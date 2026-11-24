// ============================================================
// SwaraScript Semantic Analyzer (Module 1, Phase 3)
// Checks phrases, ranges, and builds symbol table
// ============================================================

import { ASTNode, ProgramNode, PhraseDefNode, PlayNode, NoteNode, RepeatNode, ReverseNode } from './parser';

export interface SemanticError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

export interface SymbolEntry {
  name: string;
  type: 'phrase';
  definedAt: { line: number; column: number };
  usedAt: { line: number; column: number }[];
  node: PhraseDefNode;
}

export interface SymbolTable {
  phrases: Map<string, SymbolEntry>;
}

export interface SemanticResult {
  errors: SemanticError[];
  symbolTable: SymbolTable;
}

// Valid note names
const VALID_SWARAS = new Set([
  'Sa', 'sa', 'Ri', 'ri', 'Re', 're', 'Ga', 'ga', 'Ma', 'ma',
  'Pa', 'pa', 'Dha', 'dha', 'Da', 'da', 'Ni', 'ni',
  'Sa#', 'Rib', 'Ri#', 'Gab', 'Ga#', 'Ma#',
  'Pab', 'Pa#', 'Dhab', 'Dha#', 'Nib', 'Ni#',
]);

const VALID_WESTERN = /^[A-G][#b]?\d?$/;

const VALID_INSTRUMENTS = new Set([
  'piano', 'flute', 'veena', 'sitar', 'guitar', 'organ', 'violin',
  'trumpet', 'sarod', 'tabla', 'mridangam', 'harmonium', 'sine',
  'square', 'sawtooth', 'triangle',
]);

export function analyze(ast: ProgramNode): SemanticResult {
  const errors: SemanticError[] = [];
  const symbolTable: SymbolTable = {
    phrases: new Map(),
  };

  // First pass: collect phrase definitions
  function collectPhrases(nodes: ASTNode[]) {
    for (const node of nodes) {
      if (node.type === 'PhraseDef') {
        if (symbolTable.phrases.has(node.name)) {
          const existing = symbolTable.phrases.get(node.name)!;
          errors.push({
            message: `Duplicate phrase definition '${node.name}' (first defined at line ${existing.definedAt.line})`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        } else {
          symbolTable.phrases.set(node.name, {
            name: node.name,
            type: 'phrase',
            definedAt: { line: node.line, column: node.column },
            usedAt: [],
            node: node,
          });
        }
      }
    }
  }

  // Second pass: check everything
  function checkNode(node: ASTNode) {
    switch (node.type) {
      case 'Program':
        node.body.forEach(checkNode);
        break;

      case 'Tempo':
        if (node.bpm < 20 || node.bpm > 300) {
          errors.push({
            message: `Tempo ${node.bpm} BPM is out of range (20–300)`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        break;

      case 'Instrument':
        if (!VALID_INSTRUMENTS.has(node.name)) {
          errors.push({
            message: `Unknown instrument '${node.name}'. Valid instruments: ${Array.from(VALID_INSTRUMENTS).join(', ')}`,
            line: node.line,
            column: node.column,
            severity: 'warning',
          });
        }
        break;

      case 'Octave':
        if (node.value < 0 || node.value > 8) {
          errors.push({
            message: `Octave ${node.value} is out of range (0–8)`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        break;

      case 'Velocity':
        if (node.value < 0 || node.value > 127) {
          errors.push({
            message: `Velocity ${node.value} is out of range (0–127)`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        break;

      case 'Note': {
        const noteVal = node.value;
        const westernMatch = /^([A-G][#b]?)(\d)?$/.exec(noteVal);
        if (westernMatch) {
          if (westernMatch[2]) {
            const octave = parseInt(westernMatch[2]);
            if (octave < 0 || octave > 8) {
              errors.push({
                message: `Octave ${octave} in note '${noteVal}' is out of range (0–8)`,
                line: node.line,
                column: node.column,
                severity: 'error',
              });
            }
          }
        } else if (!VALID_SWARAS.has(noteVal)) {
          errors.push({
            message: `Unknown note '${noteVal}'`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        if (node.durationOverride !== undefined && node.durationOverride <= 0) {
          errors.push({
            message: `Note duration must be positive, got ${node.durationOverride}`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        break;
      }

      case 'Rest':
        if (node.durationOverride !== undefined && node.durationOverride <= 0) {
          errors.push({
            message: `Rest duration must be positive, got ${node.durationOverride}`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        break;

      case 'PhraseDef':
        node.body.forEach(checkNode);
        break;

      case 'Play': {
        const entry = symbolTable.phrases.get(node.phraseName);
        if (!entry) {
          errors.push({
            message: `Phrase '${node.phraseName}' is not defined`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        } else {
          entry.usedAt.push({ line: node.line, column: node.column });
        }
        break;
      }

      case 'Repeat':
        if (node.count <= 0 || !Number.isInteger(node.count)) {
          errors.push({
            message: `Repeat count must be a positive integer, got ${node.count}`,
            line: node.line,
            column: node.column,
            severity: 'error',
          });
        }
        if (node.count > 1000) {
          errors.push({
            message: `Repeat count ${node.count} is too large (max 1000)`,
            line: node.line,
            column: node.column,
            severity: 'warning',
          });
        }
        node.body.forEach(checkNode);
        break;

      case 'Reverse':
        node.body.forEach(checkNode);
        break;

      case 'Duration':
        break;
    }
  }

  collectPhrases(ast.body);
  checkNode(ast);

  // Check for unused phrases
  for (const [name, entry] of symbolTable.phrases) {
    if (entry.usedAt.length === 0) {
      errors.push({
        message: `Phrase '${name}' is defined but never used`,
        line: entry.definedAt.line,
        column: entry.definedAt.column,
        severity: 'warning',
      });
    }
  }

  return { errors, symbolTable };
}
