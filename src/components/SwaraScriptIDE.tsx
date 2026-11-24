'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { compile, CompilationResult, MusicEvent } from '@/lib/compiler';
import { AudioEngine, PlaybackState } from '@/lib/audio-engine';
import { downloadMidi } from '@/lib/compiler/midi';
import { SAMPLE_PROGRAMS } from '@/lib/samples';
import CodeEditor from '@/components/CodeEditor';
import TokensView from '@/components/TokensView';
import ASTView from '@/components/ASTView';
import SemanticView from '@/components/SemanticView';
import EventsView from '@/components/EventsView';
import OptimizerView from '@/components/OptimizerView';
import PianoVisualizer from '@/components/PianoVisualizer';
import ErrorPanel from '@/components/ErrorPanel';
import PlaybackControls from '@/components/PlaybackControls';
import TestReportView from '@/components/TestReportView';
import GrammarDocsView from '@/components/GrammarDocsView';

const TABS = [
  { id: 'editor', label: '📝 Editor', icon: '📝', desc: 'Source Code' },
  { id: 'tokens', label: '🔤 Phase 1: Tokens', icon: '🔤', desc: 'Lexical Analysis' },
  { id: 'ast', label: '🌳 Phase 2: AST', icon: '🌳', desc: 'Grammar Tree' },
  { id: 'semantic', label: '🔍 Phase 3: Semantic', icon: '🔍', desc: 'Symbol Table' },
  { id: 'events', label: '🎵 Phase 4: Events', icon: '🎵', desc: 'Timed 4-Tuples' },
  { id: 'optimizer', label: '⚡ Phase 5: Optimizer', icon: '⚡', desc: 'Event Reduction' },
  { id: 'output', label: '🔊 Phase 6: Playback', icon: '🔊', desc: 'Sound Synthesis' },
  { id: 'testreport', label: '📊 Test Report', icon: '📊', desc: 'Automated Suite' },
  { id: 'grammar', label: '📖 Grammar & Docs', icon: '📖', desc: 'BNF & Literature' },
] as const;

type TabId = typeof TABS[number]['id'];

const DEFAULT_CODE = SAMPLE_PROGRAMS[0].code;

export default function SwaraScriptIDE() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [currentTime, setCurrentTime] = useState(0);
  const [activeEventId, setActiveEventId] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.6);
  const [isTanpuraActive, setIsTanpuraActive] = useState(false);
  const [dronePitch, setDronePitch] = useState<'C' | 'C#' | 'D'>('C');
  const audioEngineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    const engine = new AudioEngine();
    audioEngineRef.current = engine;
    engine.setCallback((state, time, eventId) => {
      setPlaybackState(state);
      setCurrentTime(time);
      setActiveEventId(eventId);
    });
    return () => {
      engine.dispose();
    };
  }, []);

  const handleCompile = useCallback(() => {
    const compilationResult = compile(code);
    setResult(compilationResult);
    if (compilationResult.allErrors.filter(e => e.severity === 'error').length === 0) {
      setActiveTab('tokens');
    }
  }, [code]);

  const handlePlay = useCallback(() => {
    if (!result?.optimizeResult?.events) {
      // Auto-compile first if not compiled yet
      const comp = compile(code);
      setResult(comp);
      if (comp.optimizeResult?.events) {
        audioEngineRef.current?.play(comp.optimizeResult.events);
      }
      return;
    }
    const engine = audioEngineRef.current;
    if (!engine) return;

    if (playbackState === 'paused') {
      engine.resume();
    } else {
      engine.play(result.optimizeResult.events);
    }
  }, [result, playbackState, code]);

  const handlePause = useCallback(() => {
    audioEngineRef.current?.pause();
  }, []);

  const handleStop = useCallback(() => {
    audioEngineRef.current?.stop();
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    audioEngineRef.current?.setVolume(v);
  }, []);

  const handleToggleTanpura = useCallback(() => {
    if (!audioEngineRef.current) return;
    const active = audioEngineRef.current.toggleTanpura(dronePitch);
    setIsTanpuraActive(active);
  }, [dronePitch]);

  const handleExportMidi = useCallback(() => {
    if (!result?.optimizeResult?.events) return;
    const tempo = result.parseResult?.ast?.body.find(n => n.type === 'Tempo');
    const bpm = tempo && 'bpm' in tempo ? (tempo as { bpm: number }).bpm : 120;
    downloadMidi(result.optimizeResult.events, bpm);
  }, [result]);

  const handleExportText = useCallback(() => {
    if (!result?.optimizeResult?.events) return;
    const lines = result.optimizeResult.events.map(e =>
      `t=${e.startTime.toFixed(3)}s  ${e.type.padEnd(5)}  pitch=${(e.pitch || 'REST').padEnd(6)}  dur=${e.duration.toFixed(3)}s  midi=${String(e.midiNote || '-').padStart(3)}  freq=${(e.frequency ? e.frequency.toFixed(2) + 'Hz' : '-').padEnd(10)}  inst=${e.instrument}`
    );
    const text = `=================================================================\nSWARASCRIPT INTERMEDIATE EVENT CODE GENERATION REPORT\nCOMPILER DESIGN 1407 - GUIDED BY DR. C. ANITHA\n=================================================================\n\n${lines.join('\n')}\n\nOPTIMIZATION SUMMARY:\n- Original Events: ${result.optimizeResult.report.originalCount}\n- Optimized Events: ${result.optimizeResult.report.optimizedCount}\n- Event Count Reduction: ${result.optimizeResult.report.reductionPercent}%\n- Music Duration: ${result.optimizeResult.report.optimizedDuration.toFixed(3)}s (Length Invariance Preserved)`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'swarascript-events-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleSampleLoad = useCallback((sampleCode: string) => {
    setCode(sampleCode);
    setResult(null);
    setActiveTab('editor');
    audioEngineRef.current?.stop();
  }, []);

  const totalDuration = result?.optimizeResult?.events
    ? Math.max(...result.optimizeResult.events.map(e => e.startTime + e.duration), 0)
    : 0;

  const errorCount = result?.allErrors.filter(e => e.severity === 'error').length ?? 0;
  const warningCount = result?.allErrors.filter(e => e.severity === 'warning').length ?? 0;

  return (
    <div className="min-h-screen text-amber-50 bg-[#0c0204] relative">
      {/* Temple Arch Golden Ribbon */}
      <div className="temple-arch-top" />

      {/* Main Indian Classical Header */}
      <header className="border-b border-amber-900/40 bg-[#160408]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1650px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Indian Classical Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-800 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center">
              <span className="text-2xl">🪕</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-extrabold tracking-wide bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  SwaraScript
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 border border-amber-600/40 text-amber-300">
                  स्वर लिपि
                </span>
                <span className="text-[11px] text-amber-400/60 font-serif hidden sm:inline">
                  (சுர வரிசை)
                </span>
              </div>
              <p className="text-xs text-amber-200/60 font-sans">
                Domain-Specific Music Compiler · Event Code Optimization & Web Audio Synthesis
              </p>
            </div>
          </div>

          {/* Quick Actions & Sample Picker */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tanpura Drone Quick Header Toggle */}
            <button
              onClick={handleToggleTanpura}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isTanpuraActive
                  ? 'bg-amber-600 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-black/50 text-amber-300/80 border-amber-800/60 hover:border-amber-600'
              }`}
              title="Toggle continuous Tambura / Shruti box drone"
            >
              <span>🪕</span>
              <span>Shruti Drone: {isTanpuraActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* Classical Raga & Song Library */}
            <select
              className="bg-[#24060c] text-amber-100 text-xs rounded-lg px-3 py-2 border border-amber-800/60 focus:border-amber-400 focus:outline-none cursor-pointer"
              value=""
              onChange={(e) => {
                const sample = SAMPLE_PROGRAMS.find(s => s.name === e.target.value);
                if (sample) handleSampleLoad(sample.code);
              }}
            >
              <option value="" disabled>📜 Classical Ragas & Samples...</option>
              {SAMPLE_PROGRAMS.map(s => (
                <option key={s.name} value={s.name}>
                  {s.raga ? `[${s.raga}] ` : ''}{s.name}
                </option>
              ))}
            </select>

            {/* Compile Action Button */}
            <button
              onClick={handleCompile}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white font-bold px-6 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(234,88,12,0.4)] flex items-center gap-2 border border-amber-400/40 active:scale-95 text-sm"
            >
              <span>⚡</span> Compile Pipeline
            </button>
          </div>
        </div>
      </header>

      {/* Live Compilation Diagnostics Bar */}
      {result && (
        <div className="border-b border-amber-900/30 bg-[#1a050a]/90 px-4 py-2">
          <div className="max-w-[1650px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-5">
              <span className={`flex items-center gap-1.5 font-semibold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.success ? '✓' : '✗'} {result.success ? 'Compilation Succeeded' : 'Compilation Errors Detected'}
              </span>
              <span className="text-amber-300/70 font-mono">⏱ {result.timeTaken.toFixed(1)} ms</span>
              {errorCount > 0 && <span className="text-red-400 font-semibold">🔴 {errorCount} Error{errorCount !== 1 ? 's' : ''}</span>}
              {warningCount > 0 && <span className="text-amber-400 font-semibold">🟡 {warningCount} Warning{warningCount !== 1 ? 's' : ''}</span>}
              {result.optimizeResult && (
                <span className="text-amber-200 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/50">
                  ⚡ Reduced {result.optimizeResult.report.originalCount} → {result.optimizeResult.report.optimizedCount} events ({result.optimizeResult.report.reductionPercent}% saved)
                </span>
              )}
            </div>
            <div className="text-amber-300/50 font-serif">
              Six-Phase Educational Pipeline
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="max-w-[1650px] mx-auto px-4 py-5">
        {/* Six Compiler Phase Tabs */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-thin">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-700/80 via-red-800/80 to-amber-900/80 text-amber-100 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-[#180408]/80 text-amber-200/60 hover:text-amber-100 border-amber-950/80 hover:border-amber-800/50 hover:bg-[#20060b]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Active Phase Panel */}
          <div className="lg:col-span-2">
            <div className="indian-card rounded-2xl border border-amber-900/40 overflow-hidden shadow-2xl min-h-[580px]">
              {activeTab === 'editor' && (
                <CodeEditor code={code} onChange={setCode} errors={result?.allErrors} />
              )}
              {activeTab === 'tokens' && result && (
                <TokensView tokens={result.lexerResult.tokens} />
              )}
              {activeTab === 'ast' && result?.parseResult?.ast && (
                <ASTView ast={result.parseResult.ast} />
              )}
              {activeTab === 'semantic' && result?.semanticResult && (
                <SemanticView result={result.semanticResult} />
              )}
              {activeTab === 'events' && result?.eventGenResult && (
                <EventsView
                  events={result.eventGenResult.events}
                  activeEventId={activeEventId}
                />
              )}
              {activeTab === 'optimizer' && result?.optimizeResult && (
                <OptimizerView result={result.optimizeResult} />
              )}
              {activeTab === 'output' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
                      <span>🔊</span> Audio Synthesis & Synthesis Visualizer
                    </h3>
                    <p className="text-xs text-amber-200/60 mt-1">
                      Real-time Web Audio API synthesis with Indian acoustic harmonic envelopes
                    </p>
                  </div>

                  <PlaybackControls
                    state={playbackState}
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                    volume={volume}
                    isTanpuraActive={isTanpuraActive}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onStop={handleStop}
                    onVolumeChange={handleVolumeChange}
                    onToggleTanpura={handleToggleTanpura}
                  />

                  {result?.optimizeResult && (
                    <PianoVisualizer
                      events={result.optimizeResult.events}
                      activeEventId={activeEventId}
                      currentTime={currentTime}
                    />
                  )}

                  {/* Export Options */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleExportMidi}
                      className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 border border-amber-400/30"
                    >
                      <span>📥</span> Export Standard MIDI (.mid)
                    </button>
                    <button
                      onClick={handleExportText}
                      className="bg-[#24080e] hover:bg-[#340c14] text-amber-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border border-amber-900/60 flex items-center gap-2"
                    >
                      <span>📄</span> Export Event Code Report (.txt)
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'testreport' && (
                <TestReportView />
              )}
              {activeTab === 'grammar' && (
                <GrammarDocsView />
              )}

              {/* Empty state prompt */}
              {!result && activeTab !== 'editor' && activeTab !== 'testreport' && activeTab !== 'grammar' && (
                <div className="p-16 text-center text-amber-200/60">
                  <div className="text-5xl mb-4">🪕</div>
                  <h3 className="text-lg font-serif font-bold text-amber-100 mb-2">Compile Source First</h3>
                  <p className="text-xs max-w-md mx-auto text-amber-300/60">
                    Switch to the Editor tab, write your SwaraScript or load a sample Raga, then click <strong>Compile Pipeline</strong> to visualize this phase.
                  </p>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="mt-5 px-4 py-2 rounded-lg bg-amber-950/80 border border-amber-700/50 text-amber-200 text-xs hover:bg-amber-900/60 transition-all"
                  >
                    Return to Editor
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Reference & Context Panel */}
          <div className="space-y-5">
            {/* Diagnostics Panel */}
            {result && result.allErrors.length > 0 && (
              <ErrorPanel errors={result.allErrors} />
            )}

            {/* Sapta Swara Chart */}
            <div className="indian-card rounded-2xl p-5 border border-amber-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
                <span>सप्त स्वर · Sapta Swara Reference</span>
                <span className="text-[10px] text-amber-500/70">7 Pure Notes</span>
              </h3>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  { swara: 'Sa', name: 'Shadjam (षड्ज)', western: 'C', freq: '261.63 Hz' },
                  { swara: 'Ri', name: 'Rishabham (ऋषभ)', western: 'D', freq: '293.66 Hz' },
                  { swara: 'Ga', name: 'Gandharam (गान्धार)', western: 'E', freq: '329.63 Hz' },
                  { swara: 'Ma', name: 'Madhyamam (मध्यम)', western: 'F', freq: '349.23 Hz' },
                  { swara: 'Pa', name: 'Panchamam (पञ्चम)', western: 'G', freq: '392.00 Hz' },
                  { swara: 'Dha', name: 'Dhaivatham (धैवत)', western: 'A', freq: '440.00 Hz' },
                  { swara: 'Ni', name: 'Nishadham (निषाद)', western: 'B', freq: '493.88 Hz' },
                ].map((s) => (
                  <div key={s.swara} className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-lg border border-amber-900/20 text-amber-200/90 hover:border-amber-600/40 transition-colors">
                    <span className="font-bold text-amber-300 w-8">{s.swara}</span>
                    <span className="text-[11px] text-amber-200/60 font-sans flex-1 text-left px-2">{s.name}</span>
                    <span className="text-orange-400 font-semibold px-2">{s.western}</span>
                    <span className="text-[10px] text-amber-400/50">{s.freq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Raga Insert Card */}
            <div className="indian-card rounded-2xl p-5 border border-amber-900/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                🎼 Classical Raga Snippets
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Mayamalavagowla', arohana: 'Sa Ri Ga Ma Pa Dha Ni Sa' },
                  { name: 'Mohanam', arohana: 'Sa Ri Ga Pa Dha Sa' },
                  { name: 'Hamsadhwani', arohana: 'Sa Ri Ga Pa Ni Sa' },
                  { name: 'Shankarabharanam', arohana: 'Sa Ri Ga Ma Pa Dha Ni Sa' },
                ].map((r) => (
                  <button
                    key={r.name}
                    onClick={() => {
                      const snippet = `\n// Raga ${r.name}\nphrase ${r.name.toLowerCase()} {\n  ${r.arohana}\n}\nplay ${r.name.toLowerCase()}`;
                      setCode(code + snippet);
                    }}
                    className="p-2.5 rounded-xl bg-black/40 hover:bg-amber-950/60 border border-amber-900/30 hover:border-amber-600/50 text-left transition-all"
                  >
                    <div className="font-semibold text-amber-200">{r.name}</div>
                    <div className="text-[10px] text-amber-400/50 truncate font-mono mt-0.5">{r.arohana}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Presentation Credits */}
            <div className="indian-card rounded-2xl p-5 border border-amber-900/40 text-xs">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-400/80 mb-2">
                Compiler Design – 1407
              </div>
              <div className="font-serif font-bold text-amber-100 text-sm">
                SwaraScript Research Project
              </div>
              <div className="text-amber-200/70 mt-2 space-y-1">
                <div><strong>Presented by:</strong> S. Sha He Zaman, P. Hirushikesan, B. Revanth</div>
                <div><strong>Guided by:</strong> Dr. C. Anitha</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
