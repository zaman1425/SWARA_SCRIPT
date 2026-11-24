'use client';

import React from 'react';
import { SemanticResult } from '@/lib/compiler';

interface SemanticViewProps {
  result: SemanticResult;
}

export default function SemanticView({ result }: SemanticViewProps) {
  const { errors, symbolTable } = result;
  const phrases = Array.from(symbolTable.phrases.values());

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">🔍 Semantic Analysis</h3>

      {/* Symbol Table */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          📋 Symbol Table
          <span className="text-xs text-gray-500">({phrases.length} phrase{phrases.length !== 1 ? 's' : ''})</span>
        </h4>
        {phrases.length > 0 ? (
          <div className="overflow-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm font-mono">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400">Name</th>
                  <th className="px-4 py-2 text-left text-gray-400">Type</th>
                  <th className="px-4 py-2 text-left text-gray-400">Defined At</th>
                  <th className="px-4 py-2 text-left text-gray-400">Used At</th>
                  <th className="px-4 py-2 text-left text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {phrases.map((entry) => (
                  <tr key={entry.name} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-yellow-400">{entry.name}</td>
                    <td className="px-4 py-2 text-purple-400">{entry.type}</td>
                    <td className="px-4 py-2 text-gray-500">L{entry.definedAt.line}:{entry.definedAt.column}</td>
                    <td className="px-4 py-2 text-gray-500">
                      {entry.usedAt.length > 0
                        ? entry.usedAt.map(u => `L${u.line}:${u.column}`).join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {entry.usedAt.length > 0
                        ? <span className="text-green-400 text-xs">✓ Used</span>
                        : <span className="text-yellow-400 text-xs">⚠ Unused</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No phrases defined</p>
        )}
      </div>

      {/* Semantic Errors & Warnings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          🔎 Semantic Checks
          <span className="text-xs text-gray-500 ml-2">
            ({errors.filter(e => e.severity === 'error').length} errors, {errors.filter(e => e.severity === 'warning').length} warnings)
          </span>
        </h4>
        {errors.length > 0 ? (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-2 rounded-lg border ${
                  err.severity === 'error'
                    ? 'bg-red-950/30 border-red-900 text-red-300'
                    : 'bg-yellow-950/30 border-yellow-900 text-yellow-300'
                }`}
              >
                <span>{err.severity === 'error' ? '🔴' : '🟡'}</span>
                <div>
                  <p className="text-sm">{err.message}</p>
                  <p className="text-xs text-gray-500">Line {err.line}, Column {err.column}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-green-400 text-sm flex items-center gap-2 bg-green-950/20 rounded-lg px-4 py-3 border border-green-900">
            ✅ All semantic checks passed
          </div>
        )}
      </div>
    </div>
  );
}
