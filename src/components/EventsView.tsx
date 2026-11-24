'use client';

import React from 'react';
import { MusicEvent } from '@/lib/compiler';

interface EventsViewProps {
  events: MusicEvent[];
  activeEventId: number | null;
}

export default function EventsView({ events, activeEventId }: EventsViewProps) {
  const totalDuration = events.length > 0
    ? Math.max(...events.map(e => e.startTime + e.duration))
    : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🎵 Intermediate Event Code</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{events.length} events</span>
          <span>{totalDuration.toFixed(2)}s total</span>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-6 bg-gray-950 rounded-lg border border-gray-800 p-4">
        <h4 className="text-xs font-semibold text-gray-400 mb-3">Timeline</h4>
        <div className="relative h-16">
          {events.map((event, i) => {
            if (totalDuration === 0) return null;
            const left = (event.startTime / totalDuration) * 100;
            const width = Math.max((event.duration / totalDuration) * 100, 0.5);
            const isActive = event.id === activeEventId;
            return (
              <div
                key={i}
                className={`absolute top-0 h-full rounded-sm transition-all ${
                  event.type === 'REST'
                    ? 'bg-gray-700/50 border border-gray-600'
                    : isActive
                    ? 'bg-orange-400 shadow-lg shadow-orange-500/40'
                    : 'bg-indigo-500/70 hover:bg-indigo-400/70'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  minWidth: '2px',
                }}
                title={`${event.type} ${event.pitch || ''} t=${event.startTime.toFixed(3)}s dur=${event.duration.toFixed(3)}s`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0s</span>
          <span>{totalDuration.toFixed(2)}s</span>
        </div>
      </div>

      {/* Event Table */}
      <div className="overflow-auto max-h-[400px] rounded-lg border border-gray-800">
        <table className="w-full text-xs font-mono">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-gray-400">ID</th>
              <th className="px-3 py-2 text-left text-gray-400">Type</th>
              <th className="px-3 py-2 text-left text-gray-400">Start (s)</th>
              <th className="px-3 py-2 text-left text-gray-400">Duration (s)</th>
              <th className="px-3 py-2 text-left text-gray-400">Pitch</th>
              <th className="px-3 py-2 text-left text-gray-400">MIDI</th>
              <th className="px-3 py-2 text-left text-gray-400">Freq (Hz)</th>
              <th className="px-3 py-2 text-left text-gray-400">Instrument</th>
              <th className="px-3 py-2 text-left text-gray-400">Velocity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isActive = event.id === activeEventId;
              return (
                <tr
                  key={event.id}
                  className={`border-t border-gray-800 ${
                    isActive
                      ? 'bg-orange-900/30 text-orange-200'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <td className="px-3 py-1.5 text-gray-600">{event.id}</td>
                  <td className={`px-3 py-1.5 ${event.type === 'NOTE' ? 'text-indigo-400' : 'text-gray-500'}`}>
                    {event.type}
                  </td>
                  <td className="px-3 py-1.5 text-blue-400">{event.startTime.toFixed(3)}</td>
                  <td className="px-3 py-1.5 text-green-400">{event.duration.toFixed(3)}</td>
                  <td className="px-3 py-1.5 text-orange-300">{event.pitch || '—'}</td>
                  <td className="px-3 py-1.5 text-gray-400">{event.midiNote ?? '—'}</td>
                  <td className="px-3 py-1.5 text-gray-400">{event.frequency?.toFixed(2) ?? '—'}</td>
                  <td className="px-3 py-1.5 text-purple-400">{event.instrument}</td>
                  <td className="px-3 py-1.5 text-gray-400">{event.velocity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
