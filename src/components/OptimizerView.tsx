'use client';

import React from 'react';
import { OptimizeResult } from '@/lib/compiler';

interface OptimizerViewProps {
  result: OptimizeResult;
}

export default function OptimizerView({ result }: OptimizerViewProps) {
  const { report, events } = result;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">⚡ Optimization Report</h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Before</div>
          <div className="text-2xl font-bold text-gray-300">{report.originalCount}</div>
          <div className="text-xs text-gray-600">events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">After</div>
          <div className="text-2xl font-bold text-green-400">{report.optimizedCount}</div>
          <div className="text-xs text-gray-600">events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Reduction</div>
          <div className="text-2xl font-bold text-orange-400">{report.reductionPercent}%</div>
          <div className="text-xs text-gray-600">fewer events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-500 mb-1">Duration</div>
          <div className="text-2xl font-bold text-blue-400">{report.optimizedDuration.toFixed(2)}s</div>
          <div className="text-xs text-gray-600">unchanged</div>
        </div>
      </div>

      {/* Optimization Bar */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Event Count Reduction</span>
          <span className="text-sm font-mono text-gray-300">
            {report.originalCount} → {report.optimizedCount}
          </span>
        </div>
        <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all"
            style={{ width: `${100 - report.reductionPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
            {report.reductionPercent}% reduction
          </div>
        </div>
      </div>

      {/* Optimizations Applied */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">🔧 Optimizations Applied</h4>
        <div className="space-y-2">
          {report.optimizations.map((opt, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
              <span className="text-green-400">✓</span>
              <span className="text-gray-300">{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Event List */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Optimized Event Code</h4>
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-4 max-h-[300px] overflow-auto">
          <pre className="text-xs font-mono text-gray-400">
            {events.map(e =>
              `t=${e.startTime.toFixed(3)}  ${e.type.padEnd(5)} ${(e.pitch || '').padEnd(6)} dur=${e.duration.toFixed(3)}  vel=${String(e.velocity).padStart(3)}  inst=${e.instrument}`
            ).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
}
