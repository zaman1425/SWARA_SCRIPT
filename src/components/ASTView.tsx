'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ASTNode, ProgramNode } from '@/lib/compiler';

interface ASTViewProps {
  ast: ProgramNode;
}

// Tree node structure for hierarchical layout
interface LayoutNode {
  id: string;
  name: string;
  type: string;
  details: string;
  rule: string;
  line: number;
  column: number;
  color: string;
  borderColor: string;
  bgColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
  rawNode: ASTNode;
}

const NODE_THEMES: Record<string, { color: string; border: string; bg: string; rule: string; explanation: string }> = {
  Program: {
    color: '#c084fc',
    border: '#9333ea',
    bg: '#2e1065',
    rule: '<Program> ::= <Statement>* <EOF>',
    explanation: 'Root of the Abstract Syntax Tree representing the entire compilation unit.',
  },
  Tempo: {
    color: '#60a5fa',
    border: '#2563eb',
    bg: '#1e3a8a',
    rule: '<TempoStmt> ::= "tempo" NUMBER',
    explanation: 'Sets global playback speed in Beats Per Minute (BPM). Used in Phase 4 to compute beat-to-second conversion: t = (beats * 60) / tempo.',
  },
  Instrument: {
    color: '#4ade80',
    border: '#16a34a',
    bg: '#14532d',
    rule: '<InstrumentStmt> ::= "instrument" (ID | STRING)',
    explanation: 'Configures oscillator waveform timbre and ADSR harmonic envelope (Veena, Sitar, Flute, Piano, etc.).',
  },
  Octave: {
    color: '#22d3ee',
    border: '#0891b2',
    bg: '#164e63',
    rule: '<OctaveStmt> ::= "octave" NUMBER',
    explanation: 'Transposes the default octave register (0-8) for subsequent swaras. Base Sa = C of current octave.',
  },
  Velocity: {
    color: '#2dd4bf',
    border: '#0d9488',
    bg: '#134e4a',
    rule: '<VelocityStmt> ::= "velocity" NUMBER',
    explanation: 'Controls MIDI dynamic velocity (0-127) scaling synthesis amplitude and gain ramp levels.',
  },
  Duration: {
    color: '#38bdf8',
    border: '#0284c7',
    bg: '#0c4a6e',
    rule: '<DurationStmt> ::= "duration" (NUMBER | ID)',
    explanation: 'Sets default rhythmic duration in beats (quarter=1, half=2, whole=4, eighth=0.5).',
  },
  PhraseDef: {
    color: '#facc15',
    border: '#ca8a04',
    bg: '#713f12',
    rule: '<PhraseDef> ::= "phrase" ID "{" <Statement>* "}"',
    explanation: 'Defines a named, reusable musical motif. Registered in the Phase 3 Symbol Table and expanded on demand during Phase 4 Event Generation.',
  },
  Play: {
    color: '#fb923c',
    border: '#ea580c',
    bg: '#7c2d12',
    rule: '<PlayStmt> ::= "play" ID',
    explanation: 'Invokes a defined phrase by looking up its AST subtree in the Symbol Table and appending its events.',
  },
  Repeat: {
    color: '#f472b6',
    border: '#db2777',
    bg: '#831843',
    rule: '<RepeatStmt> ::= "repeat" NUMBER "{" <Statement>* "}"',
    explanation: 'Loops a block of statements N times. The event generator unrolls this loop sequentially along the timeline.',
  },
  Reverse: {
    color: '#f87171',
    border: '#dc2626',
    bg: '#7f1d1d',
    rule: '<ReverseStmt> ::= "reverse" "{" <Statement>* "}"',
    explanation: 'Inverts the temporal order of all enclosed music events (Arohana ➔ Avarohana retrograding).',
  },
  Note: {
    color: '#fdba74',
    border: '#f97316',
    bg: '#431407',
    rule: '<NoteStmt> ::= NOTE [NUMBER]',
    explanation: 'A musical pitch token (Swara or Western). Evaluated to acoustic frequency: f = 440 * 2^((n-69)/12).',
  },
  Rest: {
    color: '#9ca3af',
    border: '#4b5563',
    bg: '#1f2937',
    rule: '<RestStmt> ::= "rest" [NUMBER]',
    explanation: 'A silent beat. Target for Phase 5 rest-merging optimization (consecutive rests are combined).',
  },
};

// Convert AST to layout tree
function buildLayoutTree(node: ASTNode, id: string = '0'): LayoutNode {
  const theme = NODE_THEMES[node.type] || {
    color: '#cbd5e1',
    border: '#64748b',
    bg: '#1e293b',
    rule: '<Statement>',
    explanation: 'General AST node.',
  };

  let name: string = node.type;
  let details = '';

  switch (node.type) {
    case 'Program':
      details = `${node.body.length} stmts`;
      break;
    case 'Tempo':
      details = `${node.bpm} BPM`;
      break;
    case 'Instrument':
      details = node.name;
      break;
    case 'Octave':
      details = `Oct ${node.value}`;
      break;
    case 'Velocity':
      details = `Vel ${node.value}`;
      break;
    case 'Duration':
      details = `${node.value} beats`;
      break;
    case 'PhraseDef':
      name = `Phrase: ${node.name}`;
      details = `${node.body.length} items`;
      break;
    case 'Play':
      name = `Play: ${node.phraseName}`;
      break;
    case 'Repeat':
      name = `Repeat ×${node.count}`;
      details = `${node.body.length} items`;
      break;
    case 'Reverse':
      name = 'Reverse';
      details = `${node.body.length} items`;
      break;
    case 'Note':
      name = `Note: ${node.value}`;
      details = node.durationOverride ? `dur=${node.durationOverride}` : '1 beat';
      break;
    case 'Rest':
      name = 'Rest';
      details = node.durationOverride ? `dur=${node.durationOverride}` : '1 beat';
      break;
  }

  const rawChildren: ASTNode[] = 'body' in node && Array.isArray(node.body) ? (node.body as ASTNode[]) : [];
  const children = rawChildren.map((c, idx) => buildLayoutTree(c, `${id}-${idx}`));

  return {
    id,
    name,
    type: node.type,
    details,
    rule: theme.rule,
    line: node.line,
    column: node.column,
    color: theme.color,
    borderColor: theme.border,
    bgColor: theme.bg,
    x: 0,
    y: 0,
    width: 140,
    height: 48,
    children,
    rawNode: node,
  };
}

// Compute tree layout coordinates (node-link tree layout algorithm)
function layoutTree(root: LayoutNode, levelGap: number = 90, siblingGap: number = 24): { minX: number; maxX: number; maxY: number } {
  let nextX = 40;
  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  function postOrder(node: LayoutNode, depth: number) {
    node.y = depth * levelGap + 40;
    if (node.y > maxY) maxY = node.y;

    if (node.children.length === 0) {
      node.x = nextX;
      nextX += node.width + siblingGap;
    } else {
      for (const child of node.children) {
        postOrder(child, depth + 1);
      }
      const firstChild = node.children[0];
      const lastChild = node.children[node.children.length - 1];
      node.x = (firstChild.x + lastChild.x) / 2;
    }

    if (node.x < minX) minX = node.x;
    if (node.x + node.width > maxX) maxX = node.x + node.width;
  }

  postOrder(root, 0);
  return { minX, maxX: Math.max(maxX, 800), maxY: maxY + 100 };
}

// Generate traditional ASCII Tree
function generateAsciiTree(node: ASTNode, prefix: string = '', isLast: boolean = true): string {
  const marker = isLast ? '└── ' : '├── ';
  let label: string = node.type;

  switch (node.type) {
    case 'Program':
      label = `Program [${node.body.length} statements]`;
      break;
    case 'Tempo':
      label = `TempoStmt: ${node.bpm} BPM`;
      break;
    case 'Instrument':
      label = `InstrumentStmt: "${node.name}"`;
      break;
    case 'Octave':
      label = `OctaveStmt: ${node.value}`;
      break;
    case 'PhraseDef':
      label = `PhraseDef: "${node.name}"`;
      break;
    case 'Play':
      label = `PlayStmt: "${node.phraseName}"`;
      break;
    case 'Repeat':
      label = `RepeatStmt: count=${node.count}`;
      break;
    case 'Reverse':
      label = 'ReverseStmt';
      break;
    case 'Note':
      label = `NoteExpr: pitch="${node.value}"${node.durationOverride ? ` dur=${node.durationOverride}` : ''}`;
      break;
    case 'Rest':
      label = `RestExpr${node.durationOverride ? ` dur=${node.durationOverride}` : ''}`;
      break;
  }

  let result = prefix + marker + label + ` (L${node.line}:${node.column})\n`;
  const children: ASTNode[] = 'body' in node && Array.isArray(node.body) ? (node.body as ASTNode[]) : [];

  for (let i = 0; i < children.length; i++) {
    const childIsLast = i === children.length - 1;
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    result += generateAsciiTree(children[i], childPrefix, childIsLast);
  }

  return result;
}

export default function ASTView({ ast }: ASTViewProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'ascii' | 'json'>('graph');
  const [selectedNode, setSelectedNode] = useState<LayoutNode | null>(null);
  const [zoom, setZoom] = useState(1);

  // Layout the tree
  const { layoutRoot, dimensions } = useMemo(() => {
    const root = buildLayoutTree(ast);
    const dims = layoutTree(root);
    return { layoutRoot: root, dimensions: dims };
  }, [ast]);

  // Recursively collect nodes and links for SVG rendering
  const { nodes, links } = useMemo(() => {
    const allNodes: LayoutNode[] = [];
    const allLinks: { from: LayoutNode; to: LayoutNode }[] = [];

    function traverse(node: LayoutNode) {
      allNodes.push(node);
      for (const child of node.children) {
        allLinks.push({ from: node, to: child });
        traverse(child);
      }
    }

    traverse(layoutRoot);
    return { nodes: allNodes, links: allLinks };
  }, [layoutRoot]);

  const activeTheme = selectedNode ? NODE_THEMES[selectedNode.type] : null;

  return (
    <div className="p-5 flex flex-col h-full space-y-4">
      {/* View Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/30 pb-3">
        <div>
          <h3 className="text-base font-bold text-amber-100 flex items-center gap-2">
            <span>🌳</span> Phase 2: Abstract Syntax Tree (AST Hierarchy)
          </h3>
          <p className="text-xs text-amber-200/60 mt-0.5">
            Graphical node-and-edge tree derived from Recursive Descent BNF parsing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'graph' && (
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg border border-amber-900/40 text-xs">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
                className="px-2 py-0.5 rounded hover:bg-amber-950/60 text-amber-200"
                title="Zoom Out"
              >
                −
              </button>
              <span className="font-mono text-[11px] text-amber-300 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.15))}
                className="px-2 py-0.5 rounded hover:bg-amber-950/60 text-amber-200"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 py-0.5 rounded hover:bg-amber-950/60 text-amber-300 text-[10px] ml-1"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-amber-900/40 text-xs">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                viewMode === 'graph'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              🌿 Tree Graph
            </button>
            <button
              onClick={() => setViewMode('ascii')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                viewMode === 'ascii'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              📋 Syntax Tree
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                viewMode === 'json'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-200/60 hover:text-amber-100'
              }`}
            >
              {'{ }'} JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Graphical Tree Canvas */}
          <div className="lg:col-span-3 bg-black/60 rounded-2xl border border-amber-900/40 overflow-auto min-h-[500px] max-h-[640px] relative">
            <div
              style={{
                width: `${dimensions.maxX + 100}px`,
                height: `${dimensions.maxY + 80}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.15s ease-out',
              }}
              className="relative p-8"
            >
              {/* SVG Connector Lines */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: `${dimensions.maxX + 100}px`,
                  height: `${dimensions.maxY + 80}px`,
                }}
              >
                <defs>
                  <linearGradient id="linkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {links.map((link, idx) => {
                  const x1 = link.from.x + link.from.width / 2;
                  const y1 = link.from.y + link.from.height;
                  const x2 = link.to.x + link.to.width / 2;
                  const y2 = link.to.y;
                  const midY = (y1 + y2) / 2;

                  // Smooth cubic bezier connector curve
                  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                  return (
                    <path
                      key={idx}
                      d={path}
                      fill="none"
                      stroke="url(#linkGrad)"
                      strokeWidth="1.8"
                    />
                  );
                })}
              </svg>

              {/* Node Cards */}
              {nodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    style={{
                      left: `${n.x}px`,
                      top: `${n.y}px`,
                      width: `${n.width}px`,
                      height: `${n.height}px`,
                      backgroundColor: isSelected ? '#78350f' : n.bgColor,
                      borderColor: isSelected ? '#fbbf24' : n.borderColor,
                    }}
                    className={`absolute rounded-xl border p-2 flex flex-col justify-center cursor-pointer transition-all duration-150 shadow-md ${
                      isSelected
                        ? 'ring-2 ring-amber-400 scale-105 z-20 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                        : 'hover:scale-105 hover:z-10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] font-mono truncate" style={{ color: n.color }}>
                        {n.name}
                      </span>
                      <span className="text-[9px] text-amber-200/50 font-mono">
                        L{n.line}
                      </span>
                    </div>
                    {n.details && (
                      <div className="text-[10px] text-amber-100/70 truncate font-mono">
                        {n.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grammar & Node Inspector Drawer */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-[#180509] rounded-2xl p-4 border border-amber-900/40 text-xs">
              <h4 className="font-bold text-amber-200 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                <span>🔍 Node Inspector</span>
                {selectedNode && (
                  <span className="font-mono text-amber-400 text-[10px]">
                    L{selectedNode.line}:{selectedNode.column}
                  </span>
                )}
              </h4>

              {selectedNode ? (
                <div className="space-y-3 text-amber-100/90">
                  <div>
                    <div className="text-[10px] text-amber-400/60 uppercase">AST Node Type</div>
                    <div className="font-bold text-sm" style={{ color: selectedNode.color }}>
                      {selectedNode.type}
                    </div>
                    <div className="text-xs text-amber-200/80 font-mono">{selectedNode.name}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-amber-400/60 uppercase">BNF Grammar Rule</div>
                    <pre className="p-2 rounded-lg bg-black/60 border border-amber-900/40 font-mono text-[10px] text-amber-300 whitespace-pre-wrap">
                      {selectedNode.rule}
                    </pre>
                  </div>

                  {activeTheme && (
                    <div>
                      <div className="text-[10px] text-amber-400/60 uppercase">Compiler Action</div>
                      <p className="text-[11px] text-amber-200/80 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-amber-900/30">
                        {activeTheme.explanation}
                      </p>
                    </div>
                  )}

                  <div className="pt-1 text-[10px] text-amber-400/50 font-mono">
                    Children subtrees: {selectedNode.children.length}
                  </div>
                </div>
              ) : (
                <div className="text-amber-300/50 text-[11px] py-8 text-center">
                  <div className="text-2xl mb-2">👆</div>
                  Click any node in the tree diagram to inspect its grammar derivation and compiler semantics.
                </div>
              )}
            </div>

            {/* Tree Summary Stats */}
            <div className="bg-[#180509] rounded-2xl p-4 border border-amber-900/40 text-xs space-y-2">
              <h4 className="font-bold text-amber-200 text-[11px] uppercase tracking-wider">
                AST Tree Statistics
              </h4>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="bg-black/40 p-2 rounded-lg border border-amber-900/30">
                  <span className="text-amber-400/70 block text-[10px]">Total Nodes</span>
                  <span className="font-bold text-amber-200 text-sm">{nodes.length}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-lg border border-amber-900/30">
                  <span className="text-amber-400/70 block text-[10px]">Branches</span>
                  <span className="font-bold text-amber-200 text-sm">{links.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASCII Parse Tree View */}
      {viewMode === 'ascii' && (
        <div className="bg-black/80 rounded-2xl border border-amber-900/40 p-5 overflow-auto max-h-[580px]">
          <div className="text-xs text-amber-400/70 font-mono mb-2 flex items-center justify-between">
            <span>Traditional Hierarchical Syntax Tree (Branch View)</span>
            <span>{ast.body.length} Top-level Statements</span>
          </div>
          <pre className="text-xs font-mono text-amber-200/90 leading-relaxed whitespace-pre font-medium">
            {generateAsciiTree(ast)}
          </pre>
        </div>
      )}

      {/* Raw JSON View */}
      {viewMode === 'json' && (
        <pre className="bg-black/80 rounded-2xl border border-amber-900/40 p-5 text-xs font-mono text-amber-200/90 max-h-[580px] overflow-auto whitespace-pre-wrap">
          {JSON.stringify(ast, null, 2)}
        </pre>
      )}
    </div>
  );
}
