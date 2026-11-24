// ============================================================
// SwaraScript MIDI Export (Module 3)
// Generate a standard MIDI file from optimized events
// ============================================================

import { MusicEvent } from './eventgen';

// MIDI file generation (Type 0, single track)
// All timing in absolute ticks (480 ticks per quarter note)

const TICKS_PER_QUARTER = 480;

function writeVarLen(value: number): number[] {
  const bytes: number[] = [];
  let v = value;
  bytes.unshift(v & 0x7f);
  while ((v >>= 7) > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
  }
  return bytes;
}

function writeUint16(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function writeUint32(value: number): number[] {
  return [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
}

export function generateMidi(events: MusicEvent[], tempo: number = 120): Uint8Array {
  const noteEvents = events.filter(e => e.type === 'NOTE' && e.midiNote !== undefined);

  // Build track data
  const trackData: number[] = [];

  // Tempo meta event: FF 51 03 tt tt tt (microseconds per quarter note)
  const usPerQuarter = Math.round(60000000 / tempo);
  trackData.push(0x00); // delta time 0
  trackData.push(0xff, 0x51, 0x03);
  trackData.push((usPerQuarter >> 16) & 0xff);
  trackData.push((usPerQuarter >> 8) & 0xff);
  trackData.push(usPerQuarter & 0xff);

  // Track name meta event
  const trackName = 'SwaraScript';
  trackData.push(0x00); // delta time
  trackData.push(0xff, 0x03, trackName.length);
  for (const ch of trackName) {
    trackData.push(ch.charCodeAt(0));
  }

  // Convert events to MIDI note-on/off pairs
  interface MidiTimedEvent {
    tick: number;
    type: 'on' | 'off';
    note: number;
    velocity: number;
    channel: number;
  }

  const midiEvents: MidiTimedEvent[] = [];

  for (const event of noteEvents) {
    const startTick = Math.round((event.startTime / 60) * tempo * TICKS_PER_QUARTER);
    const durationTicks = Math.round((event.duration / 60) * tempo * TICKS_PER_QUARTER);
    const midi = event.midiNote!;
    const vel = Math.min(127, Math.max(1, event.velocity));

    midiEvents.push({ tick: startTick, type: 'on', note: midi, velocity: vel, channel: 0 });
    midiEvents.push({ tick: startTick + durationTicks, type: 'off', note: midi, velocity: 0, channel: 0 });
  }

  // Sort by tick, then note-off before note-on at same tick
  midiEvents.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    if (a.type === 'off' && b.type === 'on') return -1;
    if (a.type === 'on' && b.type === 'off') return 1;
    return 0;
  });

  // Write MIDI events with delta times
  let lastTick = 0;
  for (const me of midiEvents) {
    const delta = me.tick - lastTick;
    lastTick = me.tick;
    trackData.push(...writeVarLen(delta));

    if (me.type === 'on') {
      trackData.push(0x90 | me.channel); // Note On
      trackData.push(me.note & 0x7f);
      trackData.push(me.velocity & 0x7f);
    } else {
      trackData.push(0x80 | me.channel); // Note Off
      trackData.push(me.note & 0x7f);
      trackData.push(0);
    }
  }

  // End of track
  trackData.push(0x00, 0xff, 0x2f, 0x00);

  // Build complete MIDI file
  const header = [
    // MThd
    0x4d, 0x54, 0x68, 0x64,
    // Header length (6)
    ...writeUint32(6),
    // Format 0
    ...writeUint16(0),
    // Number of tracks (1)
    ...writeUint16(1),
    // Ticks per quarter note
    ...writeUint16(TICKS_PER_QUARTER),
  ];

  const trackHeader = [
    // MTrk
    0x4d, 0x54, 0x72, 0x6b,
    // Track length
    ...writeUint32(trackData.length),
  ];

  const midiFile = new Uint8Array([...header, ...trackHeader, ...trackData]);
  return midiFile;
}

export function downloadMidi(events: MusicEvent[], tempo: number = 120, filename: string = 'swarascript.mid') {
  const midiData = generateMidi(events, tempo);
  const blob = new Blob([midiData.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
