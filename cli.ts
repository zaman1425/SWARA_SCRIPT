#!/usr/bin/env node
// ============================================================
// SwaraScript CLI Compiler (Command-Line Interface)
// Usage: npx tsx cli.ts <source-file.swara> [options]
// Options:
//   --tokens       Print token stream from Lexer
//   --ast          Print Abstract Syntax Tree from Parser
//   --events       Print intermediate event code
//   --opt          Print optimization metrics
//   --midi [file]  Export standard MIDI (.mid) file
// ============================================================

import fs from 'fs';
import path from 'path';
import { compile } from './src/lib/compiler';
import { generateMidi } from './src/lib/compiler/midi';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
╔═════════════════════════════════════════════════════════════════╗
║   SwaraScript Compiler CLI - Domain-Specific Music Language   ║
║   Compiler Design 1407 · Guided by Dr. C. Anitha                ║
╚═════════════════════════════════════════════════════════════════╝

Usage:
  npx tsx cli.ts <file.swara> [options]
  npm run compile -- <file.swara> [options]

Options:
  --tokens        Print Lexer token stream
  --ast           Print Parser Abstract Syntax Tree (AST)
  --symbols       Print Semantic Symbol Table
  --events        Print Intermediate Event Code
  --midi <path>   Export binary Standard MIDI (.mid) file
  --json          Output complete compilation result as JSON

Examples:
  npm run compile -- examples/intro.swara
  npm run compile -- examples/malahari.swara --midi song.mid
  npm run compile -- examples/intro.swara --tokens --ast
`);
  process.exit(0);
}

const filePath = args.find(a => !a.startsWith('-'));

if (!filePath) {
  console.error('Error: Please provide a SwaraScript source file path (.swara).');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`Error: File not found: ${filePath}`);
  process.exit(1);
}

const source = fs.readFileSync(filePath, 'utf-8');
console.log(`\nCompiling ${path.basename(filePath)} (${source.split('\n').length} lines)...\n`);

const start = performance.now();
const result = compile(source);
const duration = performance.now() - start;

// Report Status
if (!result.success) {
  console.error('❌ Compilation Failed with Errors:');
  result.allErrors.forEach(err => {
    console.error(`  [${err.phase}] Line ${err.line}:${err.column} - ${err.message}`);
  });
  process.exit(1);
}

console.log(`✅ Compilation Succeeded in ${duration.toFixed(2)} ms!`);
console.log(`   Tokens: ${result.lexerResult.tokens.length}`);
console.log(`   Events: ${result.optimizeResult?.report.originalCount} -> ${result.optimizeResult?.report.optimizedCount} (${result.optimizeResult?.report.reductionPercent}% reduction)`);
console.log(`   Duration: ${result.optimizeResult?.report.optimizedDuration.toFixed(2)} seconds\n`);

if (args.includes('--tokens')) {
  console.log('--- Phase 1: Tokens ---');
  result.lexerResult.tokens
    .filter(t => t.type !== 'NEWLINE' && t.type !== 'EOF')
    .forEach(t => console.log(`  ${t.type.padEnd(20)} ${t.value.padEnd(12)} (L${t.line}:${t.column})`));
  console.log();
}

if (args.includes('--ast')) {
  console.log('--- Phase 2: AST ---');
  console.log(JSON.stringify(result.parseResult?.ast, null, 2));
  console.log();
}

if (args.includes('--symbols')) {
  console.log('--- Phase 3: Symbol Table ---');
  if (result.semanticResult) {
    for (const [name, sym] of result.semanticResult.symbolTable.phrases) {
      console.log(`  Phrase "${name}" defined at L${sym.definedAt.line}, used ${sym.usedAt.length} time(s)`);
    }
  }
  console.log();
}

if (args.includes('--events')) {
  console.log('--- Phase 4 & 5: Intermediate Event Code ---');
  result.optimizeResult?.events.forEach(e => {
    console.log(`  t=${e.startTime.toFixed(3)}s  ${e.type.padEnd(5)}  pitch=${(e.pitch || 'REST').padEnd(6)}  dur=${e.duration.toFixed(3)}s  freq=${(e.frequency ? e.frequency.toFixed(2) + 'Hz' : '-').padEnd(10)}  inst=${e.instrument}`);
  });
  console.log();
}

// Check MIDI export flag
const midiIdx = args.indexOf('--midi');
if (midiIdx !== -1 && midiIdx + 1 < args.length) {
  const midiOut = args[midiIdx + 1];
  const tempoNode = result.parseResult?.ast?.body.find(n => n.type === 'Tempo');
  const bpm = tempoNode && 'bpm' in tempoNode ? (tempoNode as { bpm: number }).bpm : 120;

  if (result.optimizeResult?.events) {
    const midiBytes = generateMidi(result.optimizeResult.events, bpm);
    fs.writeFileSync(midiOut, Buffer.from(midiBytes));
    console.log(`🎵 Exported MIDI file: ${midiOut} (${midiBytes.length} bytes)`);
  }
}
