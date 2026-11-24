import { compile } from './src/lib/compiler';

console.log('--- TEST 1: Basic Compilation ---');
const sample1 = `tempo 120
instrument flute
phrase intro { Sa Ri Ga Ma Pa }
repeat 2 { play intro }`;

const res1 = compile(sample1);
console.log('Success:', res1.success);
console.log('Time taken:', res1.timeTaken.toFixed(2), 'ms');
console.log('Tokens:', res1.lexerResult.tokens.length);
console.log('Events before opt:', res1.eventGenResult?.events.length);
console.log('Events after opt:', res1.optimizeResult?.events.length);
console.log('Optimizations:', res1.optimizeResult?.report.optimizations);

console.log('\n--- TEST 2: Error Detection ---');
const errorSample = `tempo 500
instrument unknown_inst
phrase p1 { Sa Ri UnknownNote }
play undefined_phrase
repeat -3 { play p1 }
octave 12`;

const resErr = compile(errorSample);
console.log('Detected errors/warnings count:', resErr.allErrors.length);
resErr.allErrors.forEach(e => {
  console.log(`[${e.severity.toUpperCase()}] Line ${e.line}:${e.column} (${e.phase}) - ${e.message}`);
});

console.log('\n--- TEST 3: 500-line Benchmark Target (< 200ms) ---');
const lines: string[] = ['tempo 140', 'instrument piano', 'phrase motif { Sa Ri Ga Ma Pa Dha Ni }'];
for (let i = 0; i < 500; i++) {
  lines.push(i % 5 === 0 ? 'play motif' : (i % 3 === 0 ? 'rest' : 'Sa Ri Ga'));
}
const largeProgram = lines.join('\n');
console.log('Generated program lines:', lines.length);

const benchStart = performance.now();
const resBench = compile(largeProgram);
const benchDuration = performance.now() - benchStart;
console.log('Compile 500+ lines duration:', benchDuration.toFixed(2), 'ms');
console.log('Target met (< 200ms):', benchDuration < 200 ? 'YES' : 'NO');
console.log('Bench events generated:', resBench.optimizeResult?.events.length);
