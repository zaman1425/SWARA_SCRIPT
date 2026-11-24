'use client';

import React from 'react';

export default function GrammarDocsView() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          📖 SwaraScript Language Specification & Architecture
        </h3>
        <p className="text-sm text-gray-400">
          Domain-Specific Music Programming Language · Six-Phase Architecture & Audio Synthesis
        </p>
      </div>

      {/* BNF Grammar */}
      <div className="bg-gray-950 p-5 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">
          1. Formal BNF Grammar (Context-Free Grammar)
        </h4>
        <pre className="text-xs font-mono text-gray-300 bg-gray-900 p-4 rounded-lg border border-gray-800 leading-relaxed overflow-x-auto">
{`<Program>        ::= <Statement>* <EOF>

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
<WESTERN_NOTE>   ::= ('C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B') ('#' | 'b')? (<NUMBER>)?`}
        </pre>
      </div>

      {/* 6 Compiler Phases */}
      <div className="bg-gray-950 p-5 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wider">
          2. The Six Compiler Phases
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-purple-400 font-bold text-sm block mb-1">Phase 1: Lexical Analysis</span>
            <p className="text-gray-400">Splits source string into strongly typed tokens (Keywords, Identifiers, Notes, Numbers, Symbols). Computes 1-based line & column position markers.</p>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-blue-400 font-bold text-sm block mb-1">Phase 2: Recursive Descent Parser</span>
            <p className="text-gray-400">Validates grammatical structure according to the BNF specification and builds an Abstract Syntax Tree (AST).</p>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-yellow-400 font-bold text-sm block mb-1">Phase 3: Semantic Analyzer & Symbol Table</span>
            <p className="text-gray-400">Tracks defined phrases, identifies undefined phrase invocations, flags unused declarations, and checks tempo (20-300), octave (0-8), and velocity (0-127) limits.</p>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-orange-400 font-bold text-sm block mb-1">Phase 4: Intermediate Event Code Generation</span>
            <p className="text-gray-400">Flattens the AST into a timed sequence of music events with start time (seconds), duration, pitch, MIDI note, and acoustic frequency.</p>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-emerald-400 font-bold text-sm block mb-1">Phase 5: Event Code Optimization</span>
            <p className="text-gray-400">Merges contiguous rest events, folds constants, strips silent/redundant notes, and calculates percentage reduction while strictly preserving music length.</p>
          </div>
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
            <span className="text-pink-400 font-bold text-sm block mb-1">Phase 6: Audio Synthesis & Code Generation</span>
            <p className="text-gray-400">Synthesizes tones in real time using the browser Web Audio API (oscillators + custom ADSR envelopes) across multiple instruments, drives piano visualization, and exports standard MIDI (.mid) files.</p>
          </div>
        </div>
      </div>

      {/* Literature Comparison */}
      <div className="bg-gray-950 p-5 rounded-xl border border-gray-800">
        <h4 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
          3. Literature Review & Research Gap Addressed
        </h4>
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="w-full text-xs font-mono">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-gray-400">Author (Year)</th>
                <th className="px-3 py-2 text-left text-gray-400">Title / Work</th>
                <th className="px-3 py-2 text-left text-gray-400">Key Contribution</th>
                <th className="px-3 py-2 text-left text-gray-400">Gap SwaraScript Addresses</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-800">
                <td className="px-3 py-2 text-white">Mulshine et al. (2023)</td>
                <td className="px-3 py-2 text-yellow-300">WebChucK</td>
                <td className="px-3 py-2 text-gray-400">Strongly timed music language running in browser via WebAssembly & Web Audio.</td>
                <td className="px-3 py-2 text-orange-300">A full language runtime; compiler phases are not visible to user.</td>
              </tr>
              <tr className="border-t border-gray-800">
                <td className="px-3 py-2 text-white">Zang, Benetatos & Duan (2023)</td>
                <td className="px-3 py-2 text-yellow-300">Euterpe</td>
                <td className="px-3 py-2 text-gray-400">Web framework for real-time audio/MIDI input and interactive music applications.</td>
                <td className="px-3 py-2 text-orange-300">Interaction framework; lacks source language and compiler pipeline.</td>
              </tr>
              <tr className="border-t border-gray-800">
                <td className="px-3 py-2 text-white">Matsuura (2024)</td>
                <td className="px-3 py-2 text-yellow-300">Lambda-mmm</td>
                <td className="px-3 py-2 text-gray-400">Lambda-calculus IR & VM for synchronous signal processing languages.</td>
                <td className="px-3 py-2 text-orange-300">Targets low-level signal processing, not note-level music events.</td>
              </tr>
              <tr className="border-t border-gray-800">
                <td className="px-3 py-2 text-white">Peng, Choi & Berger (2024)</td>
                <td className="px-3 py-2 text-yellow-300">SIREN</td>
                <td className="px-3 py-2 text-gray-400">JS & Web Audio synthesizers for sound design on the web.</td>
                <td className="px-3 py-2 text-orange-300">Focuses purely on sound design; lacks formal grammar and event optimization.</td>
              </tr>
              <tr className="border-t border-gray-800">
                <td className="px-3 py-2 text-white">Cella & Camci (2025)</td>
                <td className="px-3 py-2 text-yellow-300">Wax</td>
                <td className="px-3 py-2 text-gray-400">Browser audio environment with flow-based programming.</td>
                <td className="px-3 py-2 text-orange-300">Flow-based model, not a textual domain-specific language with formal grammar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
