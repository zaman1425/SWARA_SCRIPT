'use client';

import React from 'react';
import { Token, TokenType } from '@/lib/compiler';

interface TokensViewProps {
  tokens: Token[];
}

const TOKEN_COLORS: Partial<Record<TokenType, string>> = {
  [TokenType.KEYWORD_TEMPO]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_INSTRUMENT]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_PHRASE]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_PLAY]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_REPEAT]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_REVERSE]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_REST]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_OCTAVE]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_VELOCITY]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.KEYWORD_DURATION]: 'bg-purple-900/40 text-purple-300 border-purple-700',
  [TokenType.NOTE]: 'bg-orange-900/40 text-orange-300 border-orange-700',
  [TokenType.NUMBER]: 'bg-blue-900/40 text-blue-300 border-blue-700',
  [TokenType.IDENTIFIER]: 'bg-green-900/40 text-green-300 border-green-700',
  [TokenType.LBRACE]: 'bg-gray-800 text-gray-300 border-gray-600',
  [TokenType.RBRACE]: 'bg-gray-800 text-gray-300 border-gray-600',
  [TokenType.STRING]: 'bg-yellow-900/40 text-yellow-300 border-yellow-700',
};

export default function TokensView({ tokens }: TokensViewProps) {
  const displayTokens = tokens.filter(t =>
    t.type !== TokenType.NEWLINE &&
    t.type !== TokenType.EOF &&
    t.type !== TokenType.COMMENT
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🔤 Lexer Output — Token Stream</h3>
        <span className="text-sm text-gray-500">{displayTokens.length} tokens</span>
      </div>

      {/* Token Legend */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <span className="px-2 py-1 rounded bg-purple-900/40 text-purple-300">Keyword</span>
        <span className="px-2 py-1 rounded bg-orange-900/40 text-orange-300">Note</span>
        <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-300">Number</span>
        <span className="px-2 py-1 rounded bg-green-900/40 text-green-300">Identifier</span>
        <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">Symbol</span>
      </div>

      {/* Token Grid */}
      <div className="flex flex-wrap gap-2">
        {displayTokens.map((token, i) => {
          const colorClass = TOKEN_COLORS[token.type] || 'bg-gray-800 text-gray-300 border-gray-600';
          return (
            <div
              key={i}
              className={`px-3 py-1.5 rounded-lg border text-sm font-mono ${colorClass} hover:scale-105 transition-transform cursor-default`}
              title={`Type: ${token.type}\nValue: ${token.value}\nLine: ${token.line}, Col: ${token.column}`}
            >
              <span className="text-[10px] opacity-60 block">{token.type.replace('KEYWORD_', '')}</span>
              <span className="font-semibold">{token.value}</span>
              <span className="text-[10px] opacity-40 ml-1">L{token.line}:{token.column}</span>
            </div>
          );
        })}
      </div>

      {/* Raw token table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Token Table</h4>
        <div className="overflow-auto max-h-[300px] rounded-lg border border-gray-800">
          <table className="w-full text-xs font-mono">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-gray-400">#</th>
                <th className="px-3 py-2 text-left text-gray-400">Type</th>
                <th className="px-3 py-2 text-left text-gray-400">Value</th>
                <th className="px-3 py-2 text-left text-gray-400">Line</th>
                <th className="px-3 py-2 text-left text-gray-400">Column</th>
              </tr>
            </thead>
            <tbody>
              {displayTokens.map((token, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50">
                  <td className="px-3 py-1.5 text-gray-600">{i + 1}</td>
                  <td className="px-3 py-1.5 text-purple-400">{token.type}</td>
                  <td className="px-3 py-1.5 text-orange-300">{token.value}</td>
                  <td className="px-3 py-1.5 text-gray-500">{token.line}</td>
                  <td className="px-3 py-1.5 text-gray-500">{token.column}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
