'use client';

import React, { useRef, useEffect } from 'react';
import { MusicEvent } from '@/lib/compiler';

interface PianoVisualizerProps {
  events: MusicEvent[];
  activeEventId: number | null;
  currentTime: number;
}

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SWARA_NAMES = ['Sa', 'Ri', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
const DEVANAGARI_SWARAS = ['सा', 'री', 'गा', 'मा', 'पा', 'धा', 'नी'];

const SWARA_MEANINGS: Record<string, string> = {
  'Sa': 'Shadjam (षड्ज) · Tonic',
  'Ri': 'Rishabham (ऋषभ) · Second',
  'Ga': 'Gandharam (गान्धार) · Third',
  'Ma': 'Madhyamam (मध्यम) · Fourth',
  'Pa': 'Panchamam (पञ्चम) · Fifth',
  'Dha': 'Dhaivatham (धैवत) · Sixth',
  'Ni': 'Nishadham (निषाद) · Seventh',
};

function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = noteNames[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function midiToSwara(midi: number): string {
  const swaraMap: Record<number, string> = {
    0: 'Sa',
    1: 'Ri₁',
    2: 'Ri₂',
    3: 'Ga₂',
    4: 'Ga₃',
    5: 'Ma₁',
    6: 'Ma₂',
    7: 'Pa',
    8: 'Dha₁',
    9: 'Dha₂',
    10: 'Ni₂',
    11: 'Ni₃',
  };
  return swaraMap[midi % 12] || 'Sa';
}

export default function PianoVisualizer({ events, activeEventId, currentTime }: PianoVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Find active notes and active event
  const activeNotes = new Set<number>();
  let activeEvent: MusicEvent | null = null;

  for (const event of events) {
    if (
      event.type === 'NOTE' &&
      event.midiNote !== undefined &&
      currentTime >= event.startTime &&
      currentTime < event.startTime + event.duration
    ) {
      activeNotes.add(event.midiNote);
      activeEvent = event;
    }
  }

  const noteEvents = events.filter(e => e.type === 'NOTE' && e.midiNote !== undefined);
  const minMidi = noteEvents.length > 0 ? Math.min(...noteEvents.map(e => e.midiNote!)) : 48;
  const maxMidi = noteEvents.length > 0 ? Math.max(...noteEvents.map(e => e.midiNote!)) : 84;
  
  const startOctave = Math.max(0, Math.floor((minMidi - 12) / 12));
  const endOctave = Math.min(8, Math.ceil((maxMidi + 12) / 12));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const octaves = Math.max(1, endOctave - startOctave);
    const totalWhiteKeys = octaves * 7;
    const whiteKeyWidth = Math.max(width / totalWhiteKeys, 24);
    const whiteKeyHeight = height;
    const blackKeyWidth = whiteKeyWidth * 0.58;
    const blackKeyHeight = whiteKeyHeight * 0.62;

    // Rich Indian temple background
    ctx.fillStyle = '#0f0305';
    ctx.fillRect(0, 0, width, height);

    // Draw white keys
    for (let oct = startOctave; oct < endOctave; oct++) {
      for (let k = 0; k < 7; k++) {
        const keyIndex = (oct - startOctave) * 7 + k;
        const x = keyIndex * whiteKeyWidth;
        const noteName = WHITE_KEYS[k];
        const swaraName = SWARA_NAMES[k];
        const devanagari = DEVANAGARI_SWARAS[k];
        const midi = (oct + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][k];
        const isActive = activeNotes.has(midi);

        // Key body: ivory sandalwood vs radiant saffron glow
        if (isActive) {
          const grad = ctx.createLinearGradient(x, 0, x, whiteKeyHeight);
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.3, '#f59e0b');
          grad.addColorStop(1, '#ea580c');
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createLinearGradient(x, 0, x, whiteKeyHeight);
          grad.addColorStop(0, '#fffbeb');
          grad.addColorStop(0.85, '#fef3c7');
          grad.addColorStop(1, '#fde68a');
          ctx.fillStyle = grad;
        }
        ctx.fillRect(x + 1, 0, whiteKeyWidth - 2, whiteKeyHeight);

        // Key border - delicate warm bronze
        ctx.strokeStyle = isActive ? '#fbbf24' : '#b45309';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeRect(x + 1, 0, whiteKeyWidth - 2, whiteKeyHeight);

        // Indian Swara label on white key
        ctx.textAlign = 'center';
        
        // Devanagari script / Swara name
        ctx.fillStyle = isActive ? '#451a03' : '#78350f';
        ctx.font = `bold ${Math.max(10, whiteKeyWidth / 2.8)}px sans-serif`;
        ctx.fillText(swaraName, x + whiteKeyWidth / 2, whiteKeyHeight - 22);

        // Pitch & octave (e.g. C4)
        ctx.fillStyle = isActive ? '#78350f' : '#92400e';
        ctx.font = `${Math.max(8, whiteKeyWidth / 4)}px sans-serif`;
        ctx.fillText(`${noteName}${oct}`, x + whiteKeyWidth / 2, whiteKeyHeight - 8);

        // Active key aura
        if (isActive) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 24;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.fillRect(x + 1, 0, whiteKeyWidth - 2, whiteKeyHeight);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw black keys
    const blackKeyPositions = [0, 1, 3, 4, 5];
    const blackKeyOffsets = [0.7, 1.7, 3.7, 4.7, 5.7];

    for (let oct = startOctave; oct < endOctave; oct++) {
      for (let bk = 0; bk < blackKeyPositions.length; bk++) {
        const whiteKeyIndex = (oct - startOctave) * 7 + blackKeyOffsets[bk];
        const x = whiteKeyIndex * whiteKeyWidth - blackKeyWidth / 2;
        const midi = (oct + 1) * 12 + [1, 3, 6, 8, 10][bk];
        const isActive = activeNotes.has(midi);

        if (isActive) {
          const grad = ctx.createLinearGradient(x, 0, x, blackKeyHeight);
          grad.addColorStop(0, '#f97316');
          grad.addColorStop(1, '#dc2626');
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createLinearGradient(x, 0, x, blackKeyHeight);
          grad.addColorStop(0, '#2d0a11');
          grad.addColorStop(0.7, '#180407');
          grad.addColorStop(1, '#0c0203');
          ctx.fillStyle = grad;
        }
        ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);

        ctx.strokeStyle = isActive ? '#fef08a' : '#450a0a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, 0, blackKeyWidth, blackKeyHeight);

        // Swara label for black key
        const swaraMini = ['R₁', 'G₁', 'M₂', 'D₁', 'N₁'][bk];
        ctx.fillStyle = isActive ? '#ffffff' : '#f59e0b';
        ctx.font = `bold ${Math.max(7, blackKeyWidth / 3.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(swaraMini, x + blackKeyWidth / 2, blackKeyHeight - 6);

        if (isActive) {
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(234, 88, 12, 0.45)';
          ctx.fillRect(x, 0, blackKeyWidth, blackKeyHeight);
          ctx.shadowBlur = 0;
        }
      }
    }
  }, [activeNotes, startOctave, endOctave, events]);

  const activeSwaraName = activeEvent?.pitch || (activeNotes.size > 0 ? midiToSwara(Array.from(activeNotes)[0]) : null);
  const activeMeaning = activeSwaraName ? SWARA_MEANINGS[activeSwaraName] || `Pitch: ${activeSwaraName}` : null;

  return (
    <div className="indian-card rounded-2xl p-5 gold-ornament-border">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎹</span>
          <div>
            <h4 className="text-sm font-bold text-amber-200">
              Sapta Swara Piano Visualizer (सप्त स्वर)
            </h4>
            <p className="text-[11px] text-amber-300/60">
              Interactive keybed with dual Indian Swara (Sa, Ri, Ga...) and Western Pitch (C4, D4...) mapping
            </p>
          </div>
        </div>

        {/* Live Active Swara Badge */}
        {activeSwaraName && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600/30 to-red-600/30 border border-amber-500/50 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
            <span className="text-base">🎵</span>
            <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              {activeSwaraName}
            </span>
            {activeMeaning && (
              <span className="text-[10px] text-amber-300/70 border-l border-amber-500/40 pl-2">
                {activeMeaning}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="rounded-xl overflow-hidden border border-amber-900/60 shadow-inner bg-black/60">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: '145px' }}
        />
      </div>
    </div>
  );
}
