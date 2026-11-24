'use client';

import React from 'react';

interface ErrorPanelProps {
  errors: Array<{
    phase: string;
    message: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
  }>;
}

export default function ErrorPanel({ errors }: ErrorPanelProps) {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        📋 Diagnostics
        {errorCount > 0 && <span className="text-xs text-red-400">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
        {warningCount > 0 && <span className="text-xs text-yellow-400">{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-auto">
        {errors.map((err, i) => (
          <div
            key={i}
            className={`text-xs p-2 rounded border ${
              err.severity === 'error'
                ? 'bg-red-950/30 border-red-900/50 text-red-300'
                : 'bg-yellow-950/30 border-yellow-900/50 text-yellow-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span>{err.severity === 'error' ? '🔴' : '🟡'}</span>
              <span className="text-gray-500">[{err.phase}]</span>
              <span className="text-gray-600">L{err.line}:{err.column}</span>
            </div>
            <div className="ml-6">{err.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
