'use client';

import React, { useState } from 'react';
import { ASTNode, ProgramNode } from '@/lib/compiler';

interface ASTViewProps {
  ast: ProgramNode;
}

function ASTNodeComponent({ node, depth = 0 }: { node: ASTNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const indent = depth * 20;

  const hasChildren = 'body' in node && Array.isArray((node as unknown as { body: unknown[] }).body);

  const nodeColor = {
    Program: 'text-purple-400',
    Tempo: 'text-blue-400',
    Instrument: 'text-green-400',
    Octave: 'text-cyan-400',
    Velocity: 'text-cyan-400',
    Duration: 'text-cyan-400',
    PhraseDef: 'text-yellow-400',
    Play: 'text-orange-400',
    Repeat: 'text-pink-400',
    Reverse: 'text-red-400',
    Note: 'text-orange-300',
    Rest: 'text-gray-400',
  }[node.type] || 'text-gray-400';

  const getNodeLabel = () => {
    switch (node.type) {
      case 'Program': return `Program (${node.body.length} statements)`;
      case 'Tempo': return `Tempo: ${node.bpm} BPM`;
      case 'Instrument': return `Instrument: ${node.name}`;
      case 'Octave': return `Octave: ${node.value}`;
      case 'Velocity': return `Velocity: ${node.value}`;
      case 'Duration': return `Duration: ${node.value}`;
      case 'PhraseDef': return `Phrase "${node.name}" (${node.body.length} items)`;
      case 'Play': return `Play "${node.phraseName}"`;
      case 'Repeat': return `Repeat ×${node.count} (${node.body.length} items)`;
      case 'Reverse': return `Reverse (${node.body.length} items)`;
      case 'Note': return `Note: ${node.value}${node.durationOverride ? ` (dur=${node.durationOverride})` : ''}`;
      case 'Rest': return `Rest${node.durationOverride ? ` (dur=${node.durationOverride})` : ''}`;
      default: return (node as ASTNode).type;
    }
  };

  const children = 'body' in node && Array.isArray(node.body) ? (node.body as ASTNode[]) : [];

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-800/50 rounded cursor-pointer select-none ${nodeColor}`}
        style={{ paddingLeft: `${indent + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="text-gray-500 w-4 text-center text-xs">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!hasChildren && <span className="w-4 text-center text-gray-700">•</span>}
        <span className="font-mono text-sm">{getNodeLabel()}</span>
        <span className="text-gray-600 text-xs ml-auto">L{node.line}:{node.column}</span>
      </div>
      {expanded && children.map((child: ASTNode, i: number) => (
        <ASTNodeComponent key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ASTView({ ast }: ASTViewProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'json'>('tree');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🌳 Parser Output — Abstract Syntax Tree</h3>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1 rounded ${viewMode === 'tree' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded ${viewMode === 'json' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            JSON
          </button>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-2 max-h-[500px] overflow-auto">
          <ASTNodeComponent node={ast} />
        </div>
      ) : (
        <pre className="bg-gray-950 rounded-lg border border-gray-800 p-4 text-xs font-mono text-gray-300 max-h-[500px] overflow-auto whitespace-pre-wrap">
          {JSON.stringify(ast, null, 2)}
        </pre>
      )}
    </div>
  );
}
