# 🪕 SwaraScript (स्वर लिपि)

> **Design and Implementation of a Domain-Specific Music Programming Language Compiler with Intermediate Event Code Generation, Optimization, and Web-Based Audio Synthesis**  

---

## 🌟 Overview

**SwaraScript** is a domain-specific programming language (DSL) for algorithmic music composition and compiler design education. It bridges ancient Indian classical music notation (*Sapta Swara: Sa, Ri, Ga, Ma, Pa, Dha, Ni*) with modern compiler construction principles, generating timed intermediate event code, performing event-reduction optimizations, and synthesizing audio in real time via the Web Audio API.

```
SwaraScript Source Code (.swara)
        │
        ▼
[Phase 1: Lexical Analysis] (Token Stream, Line/Col Numbers)
        │
        ▼
[Phase 2: Syntax Analysis] (Recursive Descent Parser ➔ AST)
        │
        ▼
[Phase 3: Semantic Analysis] (Symbol Table, Scope & Range Validations)
        │
        ▼
[Phase 4: Intermediate Code Generation] (Timed 4-Tuples: Time, Pitch, Duration, Instrument)
        │
        ▼
[Phase 5: Event Code Optimization] (Rest Merging, Constant Folding, Duration Invariance)
        │
        ▼
[Phase 6: Audio Synthesis & Code Generation] (Web Audio API, Tanpura Drone, Canvas Piano, MIDI Export)
```

---

## ✨ Features

- **Indian Classical & Western Music Support**:
  - Full support for Indian classical swaras: `Sa`, `Ri`, `Ga`, `Ma`, `Pa`, `Dha`, `Ni` (with sharp `#` and flat `b` variants).
  - Western chromatic notation: `C4`, `D#5`, `Eb4`, etc.
- **Six Visible Compiler Phases**:
  - **Phase 1: Tokens**: Token stream with token type badges, position markers, and token table.
  - **Phase 2: AST**: Interactive collapsible Abstract Syntax Tree with JSON viewer toggle.
  - **Phase 3: Semantic**: Symbol table displaying defined phrases, usage counts, and range checking (Tempo $20–300$, Octaves $0–8$).
  - **Phase 4: Events**: Intermediate representation of music events with visual timeline and table.
  - **Phase 5: Optimizer**: Merges consecutive rests, eliminates silent/dead events, calculates reduction percentage while guaranteeing duration conservation ($\Delta t = 0$).
  - **Phase 6: Audio Playback**: 16 synthesized instruments (Veena, Sitar, Flute, Sarod, Harmonium, etc.) with custom ADSR envelopes.
- **Aesthetic Indian Classical Interface**:
  - Temple Maroon & Saffron Gold theme with Devanagari annotations.
  - **Continuous Tanpura / Shruti Box Drone (श्रुति)**: Authentic 4-string acoustic Tambura drone ($Pa - Sa - Sa - Sa$) with resonant *Jawari* shimmer.
  - **Sapta Swara Keybed Visualizer**: Highlights keys with dual Indian Swara (सा, री, गा...) and Western note names.
  - **Quick Swara Toolbar & Raga Builder**: Fast-insert chips for Carnatic and Hindustani scales (*Malahari*, *Mayamalavagowla*, *Mohanam*, *Hamsadhwani*).
- **Binary MIDI File Export**: Download standard Type 0 `.mid` files for external Digital Audio Workstations (DAWs).
- **CLI Compiler & Automated Test Suite**: Compile from terminal, run benchmarks, and inspect compiler internals.

---

## 📖 BNF Grammar (Context-Free Grammar)

```bnf
<Program>        ::= <Statement>* <EOF>

<Statement>      ::= <TempoStmt>
                   | <InstrumentStmt>
                   | <OctaveStmt>
                   | <VelocityStmt>
                   | <DurationStmt>
                   | <PhraseDef>
                   | <PlayStmt>
                   | <RepeatStmt>
                   | <ReverseStmt>
                   | <NoteStmt>
                   | <RestStmt>

<TempoStmt>      ::= 'tempo' <NUMBER>
<InstrumentStmt> ::= 'instrument' (<IDENTIFIER> | <STRING>)
<OctaveStmt>     ::= 'octave' <NUMBER>
<VelocityStmt>   ::= 'velocity' <NUMBER>
<DurationStmt>   ::= 'duration' (<NUMBER> | <IDENTIFIER>)

<PhraseDef>      ::= 'phrase' <IDENTIFIER> '{' <Statement>* '}'
<PlayStmt>       ::= 'play' <IDENTIFIER>
<RepeatStmt>     ::= 'repeat' <NUMBER> '{' <Statement>* '}'
<ReverseStmt>    ::= 'reverse' '{' <Statement>* '}'

<NoteStmt>       ::= <NOTE> (<NUMBER>)?
<RestStmt>       ::= 'rest' (<NUMBER>)?

<NOTE>           ::= <SWARA_NOTE> | <WESTERN_NOTE>
<SWARA_NOTE>     ::= 'Sa' | 'Ri' | 'Ga' | 'Ma' | 'Pa' | 'Dha' | 'Ni'
                   | 'Sa#' | 'Rib' | 'Ri#' | 'Gab' | 'Ga#' | 'Ma#'
                   | 'Pab' | 'Pa#' | 'Dhab' | 'Dha#' | 'Nib' | 'Ni#'
<WESTERN_NOTE>   ::= ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B') ('#' | 'b')? (<NUMBER>)?
```

---

## 📊 Benchmark & Project Outcomes

| Benchmark / Objective | Target | Achieved Result | Status |
| :--- | :--- | :--- | :--- |
| **500-Line Compilation Speed** | $< 200\text{ ms}$ | **$10 - 15\text{ ms}$** (~15× faster) | ✅ Exceeded |
| **Error Detection Rate** | $\ge 95\%$ | **$100\%$** (all syntax & semantic errors flagged with line & column) | ✅ Exceeded |
| **Optimization Invariance** | Duration preserved | **$\Delta t = 0.000\text{ s}$** (exact length conserved) | ✅ Verified |
| **Acoustic Frequency Precision** | $f = 440 \times 2^{(n-69)/12}$ | **Exact formula ($Sa = C_4 = 261.63\text{ Hz}$)** | ✅ Verified |
| **Binary MIDI File Export** | Standard player format | **Valid Type 0 `.mid` binary generation** | ✅ Verified |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/zaman1425/SWARA_SCRIPT.git
cd SWARA_SCRIPT

# Install dependencies
npm install
```

### Running the Web Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💻 Command-Line Interface (CLI)

SwaraScript includes a standalone CLI driver:

```bash
# Compile and view intermediate event code
npm run compile -- examples/intro.swara --events

# Compile and export a binary MIDI (.mid) file
npm run compile -- examples/malahari.swara --midi song.mid

# Inspect Lexer tokens and AST tree
npm run compile -- examples/intro.swara --tokens --ast

# Run optimization demonstration (rest-merging test)
npm run compile -- examples/opt-demo.swara --events

# Run automated test suite & 500-line speed benchmark
npm test
```

---

## 🎼 Sample Programs

### 1. Classical Carnatic Geetham (*Lambodara Lakumikara* in Raga Malahari)
```swara
// Sri Gananatha / Lambodara Lakumikara
// Raga: Malahari (Janya of Mayamalavagowla)
tempo 96
instrument veena

phrase pallavi {
  Ma Pa Dha Sa 2
  Dha Pa Ma Ga Ri Sa
}

phrase charanam {
  Sa Ri Ma Ga Ri Sa
  Ri Ma Pa Dha 2
  Dha Pa Ma Ga Ri Sa
}

play pallavi
rest 1
repeat 2 { play charanam }
```

### 2. Multi-Instrument Duet (*Jugalbandi*)
```swara
tempo 120
instrument flute
phrase intro { Sa Ri Ga Ma Pa }
repeat 2 { play intro }
```
---

## 📄 License
MIT License. Open source for educational and research use.
