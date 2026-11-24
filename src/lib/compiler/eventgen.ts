// ============================================================
// SwaraScript Event Code Generator (Module 2, Phase 4)
// Flattens the AST into a list of timed music events
// ============================================================

import { ASTNode, ProgramNode, PhraseDefNode } from './parser';
import { SymbolTable } from './semantic';

export interface MusicEvent {
  type: 'NOTE' | 'REST';
  startTime: number;    // in seconds
  duration: number;     // in seconds
  pitch?: string;       // note name (e.g., "C4", "Sa")
  midiNote?: number;    // MIDI note number
  frequency?: number;   // Hz
  instrument: string;
  velocity: number;     // 0-127
  id: number;           // unique event ID
}

export interface EventGenResult {
  events: MusicEvent[];
  totalDuration: number;
  eventCount: number;
}

// ---- Note to MIDI mapping ----

const SWARA_TO_SEMITONE: Record<string, number> = {
  'Sa': 0, 'sa': 0,
  'Ri': 2, 'ri': 2, 'Re': 1, 're': 1,
  'Ga': 4, 'ga': 4,
  'Ma': 5, 'ma': 5,
  'Pa': 7, 'pa': 7,
  'Dha': 9, 'dha': 9, 'Da': 8, 'da': 8,
  'Ni': 11, 'ni': 11,
  'Sa#': 1, 'Rib': 1, 'Ri#': 3, 'Gab': 3,
  'Ga#': 5, 'Ma#': 6, 'Pab': 6,
  'Pa#': 8, 'Dhab': 8, 'Dha#': 10, 'Nib': 10, 'Ni#': 0,
};

const WESTERN_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4, 'E#': 5,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11, 'B#': 0,
};

function noteToMidi(noteName: string, defaultOctave: number): number {
  // Western note with octave: C4, D#5, etc.
  const westernMatch = /^([A-G][#b]?)(\d)$/.exec(noteName);
  if (westernMatch) {
    const semitone = WESTERN_TO_SEMITONE[westernMatch[1]] ?? 0;
    const octave = parseInt(westernMatch[2]);
    return (octave + 1) * 12 + semitone;
  }

  // Western note without octave
  if (WESTERN_TO_SEMITONE[noteName] !== undefined) {
    return (defaultOctave + 1) * 12 + WESTERN_TO_SEMITONE[noteName];
  }

  // Swara note — base at Sa = C of defaultOctave
  if (SWARA_TO_SEMITONE[noteName] !== undefined) {
    return (defaultOctave + 1) * 12 + SWARA_TO_SEMITONE[noteName];
  }

  // Fallback: middle C
  return 60;
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function generateEvents(
  ast: ProgramNode,
  symbolTable: SymbolTable,
): EventGenResult {
  let tempo = 120;              // default BPM
  let currentOctave = 4;        // default octave
  let currentInstrument = 'piano';
  let currentVelocity = 100;    // default velocity
  let defaultDuration = 1;      // default duration in beats (quarter note)
  let currentTime = 0;          // in seconds
  let eventId = 0;
  const events: MusicEvent[] = [];

  function beatsToSeconds(beats: number): number {
    return (beats * 60) / tempo;
  }

  function processNode(node: ASTNode) {
    switch (node.type) {
      case 'Program':
        node.body.forEach(processNode);
        break;

      case 'Tempo':
        tempo = node.bpm;
        break;

      case 'Instrument':
        currentInstrument = node.name;
        break;

      case 'Octave':
        currentOctave = node.value;
        break;

      case 'Velocity':
        currentVelocity = node.value;
        break;

      case 'Duration': {
        const val = node.value;
        const durationMap: Record<string, number> = {
          'whole': 4, 'half': 2, 'quarter': 1, 'eighth': 0.5,
          'sixteenth': 0.25, 'dotted': 1.5,
        };
        defaultDuration = durationMap[val] ?? (parseFloat(val) || 1);
        break;
      }

      case 'PhraseDef':
        // Phrase definitions are stored; not executed unless played
        break;

      case 'Play': {
        const entry = symbolTable.phrases.get(node.phraseName);
        if (entry) {
          entry.node.body.forEach(processNode);
        }
        break;
      }

      case 'Repeat': {
        for (let i = 0; i < node.count; i++) {
          node.body.forEach(processNode);
        }
        break;
      }

      case 'Reverse': {
        // Collect events from the body, then reverse their order
        const startTime = currentTime;
        const tempEvents: MusicEvent[] = [];
        const savedEvents = events.length;

        node.body.forEach(processNode);

        // Extract the newly added events
        const newEvents = events.splice(savedEvents);
        // Reverse them and re-calculate times
        newEvents.reverse();
        let t = startTime;
        for (const ev of newEvents) {
          ev.startTime = t;
          t += ev.duration;
          events.push(ev);
        }
        currentTime = t;
        break;
      }

      case 'Note': {
        const durationBeats = node.durationOverride ?? defaultDuration;
        const durationSec = beatsToSeconds(durationBeats);
        const midi = noteToMidi(node.value, currentOctave);
        const freq = midiToFrequency(midi);

        events.push({
          type: 'NOTE',
          startTime: currentTime,
          duration: durationSec,
          pitch: node.value,
          midiNote: midi,
          frequency: freq,
          instrument: currentInstrument,
          velocity: currentVelocity,
          id: eventId++,
        });
        currentTime += durationSec;
        break;
      }

      case 'Rest': {
        const durationBeats = node.durationOverride ?? defaultDuration;
        const durationSec = beatsToSeconds(durationBeats);

        events.push({
          type: 'REST',
          startTime: currentTime,
          duration: durationSec,
          instrument: currentInstrument,
          velocity: 0,
          id: eventId++,
        });
        currentTime += durationSec;
        break;
      }
    }
  }

  processNode(ast);

  return {
    events,
    totalDuration: currentTime,
    eventCount: events.length,
  };
}
