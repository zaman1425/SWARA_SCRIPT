// ============================================================
// SwaraScript Compiler – Full Pipeline
// Chains: Lexer → Parser → Semantic → Event Gen → Optimizer
// ============================================================

import { tokenize, Token, LexerError, LexerResult } from './lexer';
import { parse, ProgramNode, ParseError, ParseResult } from './parser';
import { analyze, SemanticError, SemanticResult, SymbolTable } from './semantic';
import { generateEvents, MusicEvent, EventGenResult } from './eventgen';
import { optimize, OptimizeResult, OptimizationReport } from './optimizer';

export interface CompilationResult {
  success: boolean;
  timeTaken: number; // ms

  // Phase 1: Lexer
  lexerResult: LexerResult;

  // Phase 2: Parser
  parseResult: ParseResult | null;

  // Phase 3: Semantic Analysis
  semanticResult: SemanticResult | null;

  // Phase 4: Event Code Generation
  eventGenResult: EventGenResult | null;

  // Phase 5: Optimization
  optimizeResult: OptimizeResult | null;

  // All errors combined
  allErrors: Array<{
    phase: string;
    message: string;
    line: number;
    column: number;
    severity: 'error' | 'warning';
  }>;
}

export function compile(source: string): CompilationResult {
  const startTime = performance.now();

  const allErrors: CompilationResult['allErrors'] = [];
  let success = true;

  // Phase 1: Lexical Analysis
  const lexerResult = tokenize(source);
  for (const err of lexerResult.errors) {
    allErrors.push({
      phase: 'Lexer',
      message: err.message,
      line: err.line,
      column: err.column,
      severity: 'error',
    });
  }

  if (lexerResult.errors.length > 0) {
    success = false;
  }

  // Phase 2: Parsing
  const parseResult = parse(lexerResult.tokens);
  for (const err of parseResult.errors) {
    allErrors.push({
      phase: 'Parser',
      message: err.message,
      line: err.line,
      column: err.column,
      severity: 'error',
    });
  }

  if (parseResult.errors.length > 0) {
    success = false;
  }

  if (!parseResult.ast) {
    return {
      success: false,
      timeTaken: performance.now() - startTime,
      lexerResult,
      parseResult,
      semanticResult: null,
      eventGenResult: null,
      optimizeResult: null,
      allErrors,
    };
  }

  // Phase 3: Semantic Analysis
  const semanticResult = analyze(parseResult.ast);
  for (const err of semanticResult.errors) {
    allErrors.push({
      phase: 'Semantic',
      message: err.message,
      line: err.line,
      column: err.column,
      severity: err.severity,
    });
    if (err.severity === 'error') {
      success = false;
    }
  }

  // Phase 4: Event Code Generation (proceed even with semantic warnings)
  const hasHardErrors = semanticResult.errors.some(e => e.severity === 'error');
  let eventGenResult: EventGenResult | null = null;
  let optimizeResult: OptimizeResult | null = null;

  if (!hasHardErrors) {
    eventGenResult = generateEvents(parseResult.ast, semanticResult.symbolTable);

    // Phase 5: Optimization
    optimizeResult = optimize(eventGenResult.events);
  }

  const timeTaken = performance.now() - startTime;

  return {
    success,
    timeTaken,
    lexerResult,
    parseResult,
    semanticResult,
    eventGenResult,
    optimizeResult,
    allErrors,
  };
}

// Re-export types
export type { Token, LexerError, LexerResult } from './lexer';
export type { ProgramNode, ParseError, ParseResult, ASTNode } from './parser';
export type { SemanticError, SemanticResult, SymbolTable } from './semantic';
export type { MusicEvent, EventGenResult } from './eventgen';
export type { OptimizeResult, OptimizationReport } from './optimizer';
export { TokenType } from './lexer';
