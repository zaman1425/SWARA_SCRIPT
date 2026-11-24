'use client';

import React from 'react';
import { PlaybackState } from '@/lib/audio-engine';

interface PlaybackControlsProps {
  state: PlaybackState;
  currentTime: number;
  totalDuration: number;
  volume: number;
  isTanpuraActive?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (v: number) => void;
  onToggleTanpura?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export default function PlaybackControls({
  state,
  currentTime,
  totalDuration,
  volume,
  isTanpuraActive = false,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onToggleTanpura,
}: PlaybackControlsProps) {
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="indian-card rounded-2xl p-6 gold-ornament-border relative overflow-hidden">
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Progress Bar with Saffron/Gold Glow */}
      <div className="mb-5">
        <div className="relative h-2.5 bg-black/60 rounded-full overflow-hidden border border-amber-900/40">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-300 rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-amber-200/60 mt-1.5">
          <span>⏱ {formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={state === 'playing' ? onPause : onPlay}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 hover:from-amber-400 hover:to-red-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-950/60 transition-all hover:scale-105 active:scale-95 border border-amber-300/40"
            title={state === 'playing' ? 'Pause Music' : 'Play Music'}
          >
            {state === 'playing' ? '⏸' : '▶'}
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 border border-amber-900/50 flex items-center justify-center text-amber-200/80 text-base transition-all hover:scale-105"
            title="Stop Music"
          >
            ⏹
          </button>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-amber-900/30">
            <div className={`w-2.5 h-2.5 rounded-full ${
              state === 'playing' ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]' :
              state === 'paused' ? 'bg-orange-400' :
              'bg-amber-900/60'
            }`} />
            <span className="text-xs font-medium text-amber-100/90 capitalize">{state}</span>
          </div>
        </div>

        {/* Tanpura Drone / Shruti Box Toggle (The Soul of Indian Music) */}
        {onToggleTanpura && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-950/60 to-amber-950/40 px-4 py-2 rounded-xl border border-amber-600/30">
            <div className="text-left">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <span>🪕</span> Tanpura Drone (श्रुति)
              </div>
              <div className="text-[10px] text-amber-200/50">Continuous Sa-Pa drone</div>
            </div>
            <button
              onClick={onToggleTanpura}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isTanpuraActive
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-black/40 text-amber-300/70 border-amber-900/60 hover:border-amber-600/60 hover:text-amber-200'
              }`}
            >
              <span>{isTanpuraActive ? '🔊 ON' : '🔈 OFF'}</span>
            </button>
          </div>
        )}

        {/* Master Volume */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-amber-900/30">
          <span className="text-sm text-amber-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-amber-300/80 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
