// ============================================================
// SwaraScript Audio Engine (Module 3)
// Web Audio API synthesis with instruments and ADSR envelope
// ============================================================

import { MusicEvent } from './compiler';

export type InstrumentType = 'piano' | 'flute' | 'veena' | 'sitar' | 'guitar' |
  'organ' | 'violin' | 'trumpet' | 'sine' | 'square' | 'sawtooth' | 'triangle' |
  'sarod' | 'tabla' | 'mridangam' | 'harmonium';

interface ADSR {
  attack: number;
  decay: number;
  sustain: number;  // level 0-1
  release: number;
}

interface InstrumentConfig {
  oscillatorType: OscillatorType;
  adsr: ADSR;
  harmonics?: number[]; // relative amplitudes of overtones
  detune?: number;
}

const INSTRUMENT_CONFIGS: Record<string, InstrumentConfig> = {
  piano: {
    oscillatorType: 'triangle',
    adsr: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.3 },
    harmonics: [1, 0.5, 0.25, 0.125],
  },
  flute: {
    oscillatorType: 'sine',
    adsr: { attack: 0.08, decay: 0.1, sustain: 0.7, release: 0.2 },
    harmonics: [1, 0.3, 0.1],
  },
  veena: {
    oscillatorType: 'sawtooth',
    adsr: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.5 },
    harmonics: [1, 0.6, 0.3, 0.15],
  },
  sitar: {
    oscillatorType: 'sawtooth',
    adsr: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.6 },
    harmonics: [1, 0.7, 0.4, 0.2, 0.1],
    detune: 3,
  },
  guitar: {
    oscillatorType: 'triangle',
    adsr: { attack: 0.005, decay: 0.4, sustain: 0.3, release: 0.4 },
    harmonics: [1, 0.5, 0.3],
  },
  organ: {
    oscillatorType: 'sine',
    adsr: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.1 },
    harmonics: [1, 0.8, 0.6, 0.4, 0.3],
  },
  violin: {
    oscillatorType: 'sawtooth',
    adsr: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.3 },
    harmonics: [1, 0.5, 0.3, 0.2],
  },
  trumpet: {
    oscillatorType: 'square',
    adsr: { attack: 0.05, decay: 0.15, sustain: 0.6, release: 0.2 },
    harmonics: [1, 0.6, 0.3],
  },
  sarod: {
    oscillatorType: 'sawtooth',
    adsr: { attack: 0.01, decay: 0.6, sustain: 0.2, release: 0.7 },
    harmonics: [1, 0.7, 0.5, 0.3],
  },
  tabla: {
    oscillatorType: 'triangle',
    adsr: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.2 },
  },
  mridangam: {
    oscillatorType: 'triangle',
    adsr: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.3 },
  },
  harmonium: {
    oscillatorType: 'square',
    adsr: { attack: 0.03, decay: 0.1, sustain: 0.8, release: 0.15 },
    harmonics: [1, 0.5, 0.25],
  },
  sine: {
    oscillatorType: 'sine',
    adsr: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 },
  },
  square: {
    oscillatorType: 'square',
    adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.1 },
  },
  sawtooth: {
    oscillatorType: 'sawtooth',
    adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.1 },
  },
  triangle: {
    oscillatorType: 'triangle',
    adsr: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.1 },
  },
};

export type PlaybackState = 'stopped' | 'playing' | 'paused';

export type PlaybackCallback = (state: PlaybackState, currentTime: number, activeEventId: number | null) => void;

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private scheduledNodes: { osc: OscillatorNode; gain: GainNode; stopTime: number }[] = [];
  private state: PlaybackState = 'stopped';
  private startOffset = 0;
  private pauseTime = 0;
  private animationFrame: number | null = null;
  private callback: PlaybackCallback | null = null;
  private events: MusicEvent[] = [];
  private playStartWallTime = 0;
  private tanpuraActive = false;
  private tanpuraTimer: NodeJS.Timeout | null = null;
  private tanpuraGain: GainNode | null = null;
  private tanpuraBaseFreq = 130.81; // C3
  private tanpuraStrings = [
    { ratio: 1.5, detune: 0 },   // Pa (Panchamam)
    { ratio: 2.0, detune: -2 },  // Middle Sa (Jodi 1)
    { ratio: 2.0, detune: 3 },   // Middle Sa (Jodi 2 with jawari shimmer)
    { ratio: 1.0, detune: -1 },  // Low Sa (Kharaj)
  ];
  private currentStringIndex = 0;

  constructor() {}

  setCallback(cb: PlaybackCallback) {
    this.callback = cb;
  }

  getState(): PlaybackState {
    return this.state;
  }

  private getOrCreateContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private scheduleEvent(event: MusicEvent, ctx: AudioContext, baseTime: number) {
    if (event.type !== 'NOTE' || !event.frequency) return;

    const config = INSTRUMENT_CONFIGS[event.instrument] || INSTRUMENT_CONFIGS['piano'];
    const { adsr } = config;
    const noteStart = baseTime + event.startTime;
    const noteDuration = event.duration;
    const velocity = (event.velocity / 127) * 0.3;

    const harmonics = config.harmonics || [1];
    const totalHarmonicAmplitude = harmonics.reduce((s, h) => s + h, 0);

    for (let h = 0; h < harmonics.length; h++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = config.oscillatorType;
      osc.frequency.value = event.frequency * (h + 1);
      if (config.detune) {
        osc.detune.value = config.detune * (h > 0 ? h : 0);
      }

      const harmonicGain = (harmonics[h] / totalHarmonicAmplitude) * velocity;

      // ADSR envelope
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(harmonicGain, noteStart + adsr.attack);
      gainNode.gain.linearRampToValueAtTime(
        harmonicGain * adsr.sustain,
        noteStart + adsr.attack + adsr.decay
      );
      const releaseStart = noteStart + noteDuration - adsr.release;
      if (releaseStart > noteStart + adsr.attack + adsr.decay) {
        gainNode.gain.setValueAtTime(harmonicGain * adsr.sustain, releaseStart);
      }
      gainNode.gain.linearRampToValueAtTime(0, noteStart + noteDuration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration + 0.05);

      this.scheduledNodes.push({ osc, gain: gainNode, stopTime: noteStart + noteDuration });
    }
  }

  play(events: MusicEvent[], fromTime: number = 0) {
    this.stop();
    this.events = events;
    const ctx = this.getOrCreateContext();
    const baseTime = ctx.currentTime + 0.1;
    this.startOffset = fromTime;
    this.playStartWallTime = baseTime - fromTime;

    // Schedule only events that start at or after fromTime
    for (const event of events) {
      if (event.startTime + event.duration > fromTime) {
        const adjustedEvent = { ...event, startTime: event.startTime - fromTime };
        if (adjustedEvent.startTime < 0) {
          adjustedEvent.duration += adjustedEvent.startTime;
          adjustedEvent.startTime = 0;
        }
        this.scheduleEvent(adjustedEvent, ctx, baseTime);
      }
    }

    this.state = 'playing';
    this.startAnimationLoop();
    this.callback?.(this.state, fromTime, null);
  }

  pause() {
    if (this.state !== 'playing' || !this.audioCtx) return;
    this.pauseTime = this.getCurrentPlayTime();
    this.audioCtx.suspend();
    this.state = 'paused';
    this.stopAnimationLoop();
    this.callback?.(this.state, this.pauseTime, null);
  }

  resume() {
    if (this.state !== 'paused' || !this.audioCtx) return;
    this.audioCtx.resume();
    this.state = 'playing';
    this.startAnimationLoop();
    this.callback?.(this.state, this.pauseTime, null);
  }

  stop() {
    this.stopAnimationLoop();
    for (const node of this.scheduledNodes) {
      try {
        node.osc.stop();
        node.osc.disconnect();
        node.gain.disconnect();
      } catch {}
    }
    this.scheduledNodes = [];
    this.state = 'stopped';
    this.startOffset = 0;
    this.pauseTime = 0;
    this.callback?.(this.state, 0, null);
  }

  getCurrentPlayTime(): number {
    if (!this.audioCtx) return 0;
    if (this.state === 'paused') return this.pauseTime;
    if (this.state === 'stopped') return 0;
    return this.audioCtx.currentTime - this.playStartWallTime + this.startOffset;
  }

  private startAnimationLoop() {
    const tick = () => {
      if (this.state !== 'playing') return;
      const currentTime = this.getCurrentPlayTime();
      const totalDuration = this.events.length > 0
        ? Math.max(...this.events.map(e => e.startTime + e.duration))
        : 0;

      // Find active event
      let activeId: number | null = null;
      for (const event of this.events) {
        if (event.type === 'NOTE' && currentTime >= event.startTime && currentTime < event.startTime + event.duration) {
          activeId = event.id;
          break;
        }
      }

      this.callback?.(this.state, currentTime, activeId);

      if (currentTime >= totalDuration + 0.5) {
        this.stop();
        return;
      }

      this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  }

  private stopAnimationLoop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  startTanpura(basePitch: 'C' | 'C#' | 'D' = 'C') {
    const pitchFreqs: Record<string, number> = {
      'C': 130.81,
      'C#': 138.59,
      'D': 146.83,
    };
    this.tanpuraBaseFreq = pitchFreqs[basePitch] || 130.81;
    this.stopTanpura();

    const ctx = this.getOrCreateContext();
    if (!this.tanpuraGain) {
      this.tanpuraGain = ctx.createGain();
      this.tanpuraGain.gain.value = 0.35;
      this.tanpuraGain.connect(this.masterGain || ctx.destination);
    }

    this.tanpuraActive = true;
    this.currentStringIndex = 0;

    const pluckString = () => {
      if (!this.tanpuraActive || !this.audioCtx) return;
      const str = this.tanpuraStrings[this.currentStringIndex];
      this.currentStringIndex = (this.currentStringIndex + 1) % this.tanpuraStrings.length;

      const now = this.audioCtx.currentTime;
      const freq = this.tanpuraBaseFreq * str.ratio;

      // Overtones for traditional buzzing Jawari bridge sound
      const harmonics = [1, 0.6, 0.35, 0.2];
      harmonics.forEach((amp, h) => {
        if (!this.audioCtx || !this.tanpuraGain) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq * (h + 1);
        osc.detune.value = str.detune + (h * 1.5);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(amp * 0.2, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.tanpuraGain);

        osc.start(now);
        osc.stop(now + 4.0);
      });

      this.tanpuraTimer = setTimeout(pluckString, 1200);
    };

    pluckString();
  }

  stopTanpura() {
    this.tanpuraActive = false;
    if (this.tanpuraTimer) {
      clearTimeout(this.tanpuraTimer);
      this.tanpuraTimer = null;
    }
  }

  toggleTanpura(basePitch: 'C' | 'C#' | 'D' = 'C'): boolean {
    if (this.tanpuraActive) {
      this.stopTanpura();
      return false;
    } else {
      this.startTanpura(basePitch);
      return true;
    }
  }

  isTanpuraActive(): boolean {
    return this.tanpuraActive;
  }

  setVolume(value: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  dispose() {
    this.stop();
    this.stopTanpura();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
