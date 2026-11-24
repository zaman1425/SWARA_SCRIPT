// ============================================================
// SwaraScript Parser – Recursive Descent Parser (Module 1, Phase 2)
// Builds an Abstract Syntax Tree (AST) from the token stream
// ============================================================

import { Token, TokenType } from './lexer';

// ---- AST Node Types ----

export type ASTNode =
  | ProgramNode
  | TempoNode
  | InstrumentNode
  | OctaveNode
  | VelocityNode
  | DurationNode
  | PhraseDefNode
  | PlayNode
  | RepeatNode
  | ReverseNode
  | NoteNode
  | RestNode;

export interface ProgramNode {
  type: 'Program';
  body: ASTNode[];
  line: number;
  column: number;
}

export interface TempoNode {
  type: 'Tempo';
  bpm: number;
  line: number;
  column: number;
}

export interface InstrumentNode {
  type: 'Instrument';
  name: string;
  line: number;
  column: number;
}

export interface OctaveNode {
  type: 'Octave';
  value: number;
  line: number;
  column: number;
}

export interface VelocityNode {
  type: 'Velocity';
  value: number;
  line: number;
  column: number;
}

export interface DurationNode {
  type: 'Duration';
  value: string; // e.g., "quarter", "half", "whole", or a number
  line: number;
  column: number;
}

export interface PhraseDefNode {
  type: 'PhraseDef';
  name: string;
  body: ASTNode[];
  line: number;
  column: number;
}

export interface PlayNode {
  type: 'Play';
  phraseName: string;
  line: number;
  column: number;
}

export interface RepeatNode {
  type: 'Repeat';
  count: number;
  body: ASTNode[];
  line: number;
  column: number;
}

export interface ReverseNode {
  type: 'Reverse';
  body: ASTNode[];
  line: number;
  column: number;
}

export interface NoteNode {
  type: 'Note';
  value: string; // e.g., "Sa", "C4", "D#5"
  durationOverride?: number; // in beats
  line: number;
  column: number;
}

export interface RestNode {
  type: 'Rest';
  durationOverride?: number;
  line: number;
  column: number;
}

export interface ParseError {
  message: string;
  line: number;
  column: number;
}

export interface ParseResult {
  ast: ProgramNode | null;
  errors: ParseError[];
}

// ---- BNF Grammar (informal) ----
// Program       ::= Statement*
// Statement     ::= TempoStmt | InstrumentStmt | OctaveStmt | VelocityStmt
//                  | DurationStmt | PhraseDef | PlayStmt | RepeatStmt
//                  | ReverseStmt | NoteStmt | RestStmt
// TempoStmt     ::= 'tempo' NUMBER
// InstrumentStmt::= 'instrument' IDENTIFIER
// OctaveStmt    ::= 'octave' NUMBER
// VelocityStmt  ::= 'velocity' NUMBER
// DurationStmt  ::= 'duration' (NUMBER | IDENTIFIER)
// PhraseDef     ::= 'phrase' IDENTIFIER '{' Statement* '}'
// PlayStmt      ::= 'play' IDENTIFIER
// RepeatStmt    ::= 'repeat' NUMBER '{' Statement* '}'
// ReverseStmt   ::= 'reverse' '{' Statement* '}'
// NoteStmt      ::= NOTE (NUMBER)?
// RestStmt      ::= 'rest' (NUMBER)?

export function parse(tokens: Token[]): ParseResult {
  const errors: ParseError[] = [];
  let pos = 0;

  function current(): Token {
    return tokens[pos] || { type: TokenType.EOF, value: '', line: 0, column: 0 };
  }

  function peek(): Token {
    return tokens[pos] || { type: TokenType.EOF, value: '', line: 0, column: 0 };
  }

  function advance(): Token {
    const tok = tokens[pos];
    pos++;
    return tok;
  }

  function expect(type: TokenType, message?: string): Token {
    const tok = peek();
    if (tok.type !== type) {
      errors.push({
        message: message || `Expected ${type} but got ${tok.type} '${tok.value}'`,
        line: tok.line,
        column: tok.column,
      });
      // Return a dummy token to keep parsing
      return { type, value: '', line: tok.line, column: tok.column };
    }
    return advance();
  }

  function skipNewlines() {
    while (peek().type === TokenType.NEWLINE || peek().type === TokenType.COMMENT) {
      advance();
    }
  }

  function parseNoteWithDuration(): NoteNode {
    const tok = advance(); // consume NOTE
    let durationOverride: number | undefined;
    // Check if followed by a number (duration override in beats)
    if (peek().type === TokenType.NUMBER) {
      durationOverride = parseFloat(advance().value);
    }
    return {
      type: 'Note',
      value: tok.value,
      durationOverride,
      line: tok.line,
      column: tok.column,
    };
  }

  function parseBlock(): ASTNode[] {
    expect(TokenType.LBRACE);
    skipNewlines();
    const body: ASTNode[] = [];
    while (peek().type !== TokenType.RBRACE && peek().type !== TokenType.EOF) {
      const stmt = parseStatement();
      if (stmt) body.push(stmt);
      skipNewlines();
    }
    expect(TokenType.RBRACE);
    return body;
  }

  function parseStatement(): ASTNode | null {
    skipNewlines();
    const tok = peek();

    switch (tok.type) {
      case TokenType.KEYWORD_TEMPO: {
        advance();
        const numTok = expect(TokenType.NUMBER, `Expected BPM number after 'tempo'`);
        const bpm = parseFloat(numTok.value);
        return { type: 'Tempo', bpm, line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_INSTRUMENT: {
        advance();
        const nameTok = peek();
        if (nameTok.type === TokenType.IDENTIFIER || nameTok.type === TokenType.STRING) {
          advance();
          return { type: 'Instrument', name: nameTok.value.toLowerCase(), line: tok.line, column: tok.column };
        }
        errors.push({ message: `Expected instrument name after 'instrument'`, line: tok.line, column: tok.column });
        return null;
      }

      case TokenType.KEYWORD_OCTAVE: {
        advance();
        const numTok = expect(TokenType.NUMBER, `Expected octave number after 'octave'`);
        return { type: 'Octave', value: parseInt(numTok.value), line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_VELOCITY: {
        advance();
        const numTok = expect(TokenType.NUMBER, `Expected velocity number after 'velocity'`);
        return { type: 'Velocity', value: parseInt(numTok.value), line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_DURATION: {
        advance();
        const valTok = peek();
        if (valTok.type === TokenType.NUMBER || valTok.type === TokenType.IDENTIFIER) {
          advance();
          return { type: 'Duration', value: valTok.value, line: tok.line, column: tok.column };
        }
        errors.push({ message: `Expected duration value after 'duration'`, line: tok.line, column: tok.column });
        return null;
      }

      case TokenType.KEYWORD_PHRASE: {
        advance();
        const nameTok = expect(TokenType.IDENTIFIER, `Expected phrase name after 'phrase'`);
        skipNewlines();
        const body = parseBlock();
        return { type: 'PhraseDef', name: nameTok.value, body, line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_PLAY: {
        advance();
        const nameTok = expect(TokenType.IDENTIFIER, `Expected phrase name after 'play'`);
        return { type: 'Play', phraseName: nameTok.value, line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_REPEAT: {
        advance();
        const numTok = expect(TokenType.NUMBER, `Expected repeat count after 'repeat'`);
        const count = parseInt(numTok.value);
        skipNewlines();
        const body = parseBlock();
        return { type: 'Repeat', count, body, line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_REVERSE: {
        advance();
        skipNewlines();
        const body = parseBlock();
        return { type: 'Reverse', body, line: tok.line, column: tok.column };
      }

      case TokenType.KEYWORD_REST: {
        advance();
        let durationOverride: number | undefined;
        if (peek().type === TokenType.NUMBER) {
          durationOverride = parseFloat(advance().value);
        }
        return { type: 'Rest', durationOverride, line: tok.line, column: tok.column };
      }

      case TokenType.NOTE: {
        return parseNoteWithDuration();
      }

      case TokenType.IDENTIFIER: {
        // Could be an unrecognized keyword or a bare phrase name (treat as play)
        advance();
        errors.push({ message: `Unexpected identifier '${tok.value}'`, line: tok.line, column: tok.column });
        return null;
      }

      case TokenType.EOF:
        return null;

      default: {
        advance();
        // Skip unknown tokens
        return null;
      }
    }
  }

  // Parse Program
  skipNewlines();
  const body: ASTNode[] = [];
  while (peek().type !== TokenType.EOF) {
    const stmt = parseStatement();
    if (stmt) body.push(stmt);
    skipNewlines();
  }

  const ast: ProgramNode = {
    type: 'Program',
    body,
    line: 1,
    column: 1,
  };

  return { ast, errors };
}
