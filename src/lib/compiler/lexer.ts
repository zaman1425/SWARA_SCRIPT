// ============================================================
// SwaraScript Lexer – Lexical Analysis (Module 1, Phase 1)
// ============================================================

export enum TokenType {
  // Keywords
  KEYWORD_TEMPO = 'KEYWORD_TEMPO',
  KEYWORD_INSTRUMENT = 'KEYWORD_INSTRUMENT',
  KEYWORD_PHRASE = 'KEYWORD_PHRASE',
  KEYWORD_PLAY = 'KEYWORD_PLAY',
  KEYWORD_REPEAT = 'KEYWORD_REPEAT',
  KEYWORD_REVERSE = 'KEYWORD_REVERSE',
  KEYWORD_REST = 'KEYWORD_REST',
  KEYWORD_OCTAVE = 'KEYWORD_OCTAVE',
  KEYWORD_VELOCITY = 'KEYWORD_VELOCITY',
  KEYWORD_DURATION = 'KEYWORD_DURATION',

  // Literals
  NOTE = 'NOTE',
  NUMBER = 'NUMBER',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',

  // Symbols
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  COMMA = 'COMMA',
  DOT = 'DOT',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  COMMENT = 'COMMENT',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface LexerError {
  message: string;
  line: number;
  column: number;
}

export interface LexerResult {
  tokens: Token[];
  errors: LexerError[];
}

// Indian Swara notes (Carnatic / Hindustani)
const SWARA_NOTES = new Set([
  'Sa', 'sa',
  'Ri', 'ri', 'Re', 're',
  'Ga', 'ga',
  'Ma', 'ma',
  'Pa', 'pa',
  'Dha', 'dha', 'Da', 'da',
  'Ni', 'ni',
  // Sharp/Flat variants
  'Sa#', 'Rib', 'Ri#', 'Gab', 'Ga#', 'Ma#',
  'Pab', 'Pa#', 'Dhab', 'Dha#', 'Nib', 'Ni#',
]);

// Western notes
const WESTERN_NOTES = new Set([
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'C#', 'D#', 'F#', 'G#', 'A#',
  'Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb',
  // With octave numbers (will be handled via regex)
]);

const KEYWORDS: Record<string, TokenType> = {
  tempo: TokenType.KEYWORD_TEMPO,
  instrument: TokenType.KEYWORD_INSTRUMENT,
  phrase: TokenType.KEYWORD_PHRASE,
  play: TokenType.KEYWORD_PLAY,
  repeat: TokenType.KEYWORD_REPEAT,
  reverse: TokenType.KEYWORD_REVERSE,
  rest: TokenType.KEYWORD_REST,
  octave: TokenType.KEYWORD_OCTAVE,
  velocity: TokenType.KEYWORD_VELOCITY,
  duration: TokenType.KEYWORD_DURATION,
};

const INSTRUMENTS = new Set([
  'piano', 'flute', 'veena', 'sitar', 'guitar', 'organ', 'violin',
  'trumpet', 'sarod', 'tabla', 'mridangam', 'harmonium', 'sine',
  'square', 'sawtooth', 'triangle',
]);

function isAlpha(ch: string): boolean {
  return /[a-zA-Z_]/.test(ch);
}

function isDigit(ch: string): boolean {
  return /[0-9]/.test(ch);
}

function isAlphaNumeric(ch: string): boolean {
  return /[a-zA-Z0-9_]/.test(ch);
}

export function tokenize(source: string): LexerResult {
  const tokens: Token[] = [];
  const errors: LexerError[] = [];
  let pos = 0;
  let line = 1;
  let column = 1;

  function peek(): string {
    return pos < source.length ? source[pos] : '\0';
  }

  function advance(): string {
    const ch = source[pos];
    pos++;
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  }

  function addToken(type: TokenType, value: string, startLine: number, startCol: number) {
    tokens.push({ type, value, line: startLine, column: startCol });
  }

  while (pos < source.length) {
    const ch = peek();
    const startLine = line;
    const startCol = column;

    // Skip whitespace (but not newlines)
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance();
      continue;
    }

    // Newlines
    if (ch === '\n') {
      advance();
      addToken(TokenType.NEWLINE, '\\n', startLine, startCol);
      continue;
    }

    // Comments: // or #
    if (ch === '/' && pos + 1 < source.length && source[pos + 1] === '/') {
      let comment = '';
      while (pos < source.length && peek() !== '\n') {
        comment += advance();
      }
      addToken(TokenType.COMMENT, comment, startLine, startCol);
      continue;
    }
    if (ch === '#') {
      let comment = '';
      while (pos < source.length && peek() !== '\n') {
        comment += advance();
      }
      addToken(TokenType.COMMENT, comment, startLine, startCol);
      continue;
    }

    // Symbols
    if (ch === '{') { advance(); addToken(TokenType.LBRACE, '{', startLine, startCol); continue; }
    if (ch === '}') { advance(); addToken(TokenType.RBRACE, '}', startLine, startCol); continue; }
    if (ch === '(') { advance(); addToken(TokenType.LPAREN, '(', startLine, startCol); continue; }
    if (ch === ')') { advance(); addToken(TokenType.RPAREN, ')', startLine, startCol); continue; }
    if (ch === ',') { advance(); addToken(TokenType.COMMA, ',', startLine, startCol); continue; }
    if (ch === '.') { advance(); addToken(TokenType.DOT, '.', startLine, startCol); continue; }

    // Numbers (integers and floats)
    if (isDigit(ch)) {
      let num = '';
      while (pos < source.length && (isDigit(peek()) || peek() === '.')) {
        num += advance();
      }
      addToken(TokenType.NUMBER, num, startLine, startCol);
      continue;
    }

    // String literals
    if (ch === '"' || ch === "'") {
      const quote = advance();
      let str = '';
      while (pos < source.length && peek() !== quote && peek() !== '\n') {
        str += advance();
      }
      if (pos < source.length && peek() === quote) {
        advance();
        addToken(TokenType.STRING, str, startLine, startCol);
      } else {
        errors.push({ message: `Unterminated string literal`, line: startLine, column: startCol });
      }
      continue;
    }

    // Words (keywords, notes, identifiers)
    if (isAlpha(ch)) {
      let word = '';
      while (pos < source.length && isAlphaNumeric(peek())) {
        word += advance();
      }

      // Check for sharp/flat suffix
      if (pos < source.length && (peek() === '#' || peek() === 'b')) {
        const lookAhead = word + peek();
        if (SWARA_NOTES.has(lookAhead) || WESTERN_NOTES.has(lookAhead)) {
          word += advance();
        }
      }

      // Check if it's a keyword
      const lower = word.toLowerCase();
      if (KEYWORDS[lower]) {
        addToken(KEYWORDS[lower], word, startLine, startCol);
        continue;
      }

      // Check if it's a note (swara or western)
      // Western notes with octave: C4, D#5, etc.
      const westernWithOctave = /^([A-G][#b]?)(\d)$/.exec(word);
      if (westernWithOctave) {
        addToken(TokenType.NOTE, word, startLine, startCol);
        continue;
      }
      if (SWARA_NOTES.has(word)) {
        addToken(TokenType.NOTE, word, startLine, startCol);
        continue;
      }
      if (WESTERN_NOTES.has(word)) {
        // Might have octave number following
        if (pos < source.length && isDigit(peek())) {
          word += advance();
        }
        addToken(TokenType.NOTE, word, startLine, startCol);
        continue;
      }

      // Otherwise it's an identifier
      addToken(TokenType.IDENTIFIER, word, startLine, startCol);
      continue;
    }

    // Unknown character
    errors.push({ message: `Unexpected character '${ch}'`, line: startLine, column: startCol });
    advance();
  }

  addToken(TokenType.EOF, '', line, column);
  return { tokens, errors };
}
