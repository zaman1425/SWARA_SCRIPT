'use client';

import React, { useState } from 'react';

interface IndianWelcomeHeroProps {
  onEnter: () => void;
}

const SWARAS = [
  { swara: 'Sa', name: 'Shadjam', sanskrit: 'षड्ज', freq: 261.63, western: 'C4', color: '#f59e0b', desc: 'The Origin · Peacock Call' },
  { swara: 'Ri', name: 'Rishabham', sanskrit: 'ऋषभ', freq: 293.66, western: 'D4', color: '#ea580c', desc: 'The Seeker · Bull Roar' },
  { swara: 'Ga', name: 'Gandharam', sanskrit: 'गान्धार', freq: 329.63, western: 'E4', color: '#eab308', desc: 'The Sky · Bleating Goat' },
  { swara: 'Ma', name: 'Madhyamam', sanskrit: 'मध्यम', freq: 349.23, western: 'F4', color: '#10b981', desc: 'The Heart · Heron Cry' },
  { swara: 'Pa', name: 'Panchamam', sanskrit: 'पञ्चम', freq: 392.00, western: 'G4', color: '#06b6d4', desc: 'The Pillar · Cuckoo Song' },
  { swara: 'Dha', name: 'Dhaivatham', sanskrit: 'धैवत', freq: 440.00, western: 'A4', color: '#8b5cf6', desc: 'The Crown · Horse Neigh' },
  { swara: 'Ni', name: 'Nishadham', sanskrit: 'निषाद', freq: 493.88, western: 'B4', color: '#ec4899', desc: 'The Gateway · Elephant Trumpet' },
];

export default function IndianWelcomeHero({ onEnter }: IndianWelcomeHeroProps) {
  const [activeSwara, setActiveSwara] = useState<typeof SWARAS[0] | null>(null);

  // Play a pure classical veena-like harmonic tone
  const playTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Primary tone + 2 harmonics for rich Veena timbre
      [1, 2, 3].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = freq * mult;

        const volume = idx === 0 ? 0.22 : 0.08 / idx;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);
      });
    } catch {
      // AudioContext fallback
    }
  };

  const handleEnterClick = () => {
    // Play celebratory chord (Sa - Pa - Sa')
    playTone(261.63);
    setTimeout(() => playTone(392.00), 120);
    setTimeout(() => playTone(523.25), 240);
    setTimeout(() => onEnter(), 400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-6 select-none bg-[#090103]">
      {/* Ancient Temple Mandala Backgrounds */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-20">
        <svg
          className="w-[850px] h-[850px] text-amber-500 animate-spin-slow"
          viewBox="0 0 400 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          {/* Concentric Sacred Yantra Rings */}
          <circle cx="200" cy="200" r="190" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="160" />
          <circle cx="200" cy="200" r="130" strokeDasharray="6 3" />
          <circle cx="200" cy="200" r="90" />
          <circle cx="200" cy="200" r="50" />
          {/* 12 Outer Petals */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 200 + 130 * Math.cos(angle);
            const y1 = 200 + 130 * Math.sin(angle);
            const x2 = 200 + 190 * Math.cos(angle + 0.25);
            const y2 = 200 + 190 * Math.sin(angle + 0.25);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" />;
          })}
          {/* Star Polygons */}
          <polygon points="200,60 321,270 79,270" stroke="currentColor" />
          <polygon points="200,340 321,130 79,130" stroke="currentColor" />
        </svg>
      </div>

      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-10">
        <svg
          className="w-[1200px] h-[1200px] text-red-600 animate-spin-slow-reverse"
          viewBox="0 0 600 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        >
          <circle cx="300" cy="300" r="280" strokeDasharray="5 5" />
          <circle cx="300" cy="300" r="240" />
          <circle cx="300" cy="300" r="200" strokeDasharray="10 5" />
        </svg>
      </div>

      {/* Top Banner & Invocation */}
      <header className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-gradient-to-r from-red-950/80 via-amber-950/80 to-red-950/80 border border-amber-600/40 text-amber-200 text-xs sm:text-sm tracking-widest uppercase mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span>॥</span>
          <span className="font-serif">नादब्रह्मणे नमः · Sound is Divine</span>
          <span>॥</span>
        </div>
        <p className="text-xs text-amber-300/50 font-serif tracking-wider uppercase">
          Department of Computer Science & Engineering · Compiler Design (1407)
        </p>
      </header>

      {/* Main Centerpiece */}
      <div className="relative z-10 max-w-5xl mx-auto w-full my-6 flex flex-col items-center text-center">
        {/* Ceremonial Diya Flames on Left & Right */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 mb-4 w-full">
          {/* Left Diya */}
          <div className="flex flex-col items-center">
            <div className="w-5 h-8 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full animate-diya" />
            <div className="w-8 h-2.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 rounded-full border border-amber-400/40 mt-0.5 shadow-md" />
            <div className="w-3 h-4 bg-amber-800 rounded-sm" />
            <div className="w-9 h-1.5 bg-amber-900 rounded-full" />
          </div>

          {/* Central Title */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-3xl sm:text-4xl">🪕</span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-md">
                SwaraScript
              </h1>
              <span className="text-3xl sm:text-4xl">🪕</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm sm:text-lg text-amber-300/90 font-serif">
              <span>स्वर लिपि</span>
              <span>·</span>
              <span>சுர வரிசை</span>
              <span>·</span>
              <span>Music Programming Language Compiler</span>
            </div>
          </div>

          {/* Right Diya */}
          <div className="flex flex-col items-center">
            <div className="w-5 h-8 bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-100 rounded-full animate-diya" />
            <div className="w-8 h-2.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-800 rounded-full border border-amber-400/40 mt-0.5 shadow-md" />
            <div className="w-3 h-4 bg-amber-800 rounded-sm" />
            <div className="w-9 h-1.5 bg-amber-900 rounded-full" />
          </div>
        </div>

        {/* Subtitle Statement */}
        <p className="max-w-2xl text-xs sm:text-sm text-amber-100/75 leading-relaxed font-sans mt-2 mb-8">
          A domain-specific compiler transforming Indian Classical and Western musical notation 
          into optimized intermediate event code, synthesized with Web Audio oscillators and visual keybeds.
        </p>

        {/* Interactive Sapta Swara Invocation Wheel */}
        <div className="w-full max-w-3xl mb-8">
          <div className="text-[11px] uppercase tracking-widest text-amber-400/70 font-semibold mb-3">
            ✨ Hover or Click any Swara to Audition its Pure Harmonic Frequency:
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {SWARAS.map((s) => {
              const isSelected = activeSwara?.swara === s.swara;
              return (
                <button
                  key={s.swara}
                  onMouseEnter={() => {
                    setActiveSwara(s);
                    playTone(s.freq);
                  }}
                  onClick={() => {
                    setActiveSwara(s);
                    playTone(s.freq);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative border ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-orange-700 text-white border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
                      : 'bg-black/50 hover:bg-amber-950/60 text-amber-100 border-amber-900/50 hover:border-amber-500/80 hover:scale-105'
                  }`}
                >
                  <span className="text-[10px] text-amber-200/60 font-serif">{s.sanskrit}</span>
                  <span className="text-base sm:text-xl font-bold font-mono tracking-wide">{s.swara}</span>
                  <span className="text-[10px] opacity-75 font-mono">{s.western}</span>
                  <span className="text-[9px] text-amber-300/60 font-mono mt-0.5">{s.freq.toFixed(0)}Hz</span>
                </button>
              );
            })}
          </div>

          {/* Active Swara Lore Card */}
          {activeSwara && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-xs text-amber-200 animate-fadeIn">
              <strong>{activeSwara.name} ({activeSwara.sanskrit})</strong>: {activeSwara.desc} · Frequency: <strong>{activeSwara.freq} Hz</strong> ({activeSwara.western})
            </div>
          )}
        </div>

        {/* Grand Enter Studio CTA Button */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-ring" />
          <button
            onClick={handleEnterClick}
            className="relative px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white font-serif font-bold text-base sm:text-lg tracking-wider border border-amber-300/60 shadow-[0_10px_35px_rgba(234,88,12,0.5)] transition-all duration-300 active:scale-95 flex items-center gap-3"
          >
            <span>🪕</span>
            <span>प्रवेश करें · Enter Compiler Studio</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* Three Classical Feature Highlights */}
      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-left">
        <div className="indian-card p-4 rounded-xl border border-amber-900/40">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm font-serif">
            <span>📜</span>
            <h4>I. Formal BNF Grammar & AST</h4>
          </div>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            Full recursive descent parser creating typed Abstract Syntax Trees from Swara notes, phrases, repeats, and tempo directives.
          </p>
        </div>

        <div className="indian-card p-4 rounded-xl border border-amber-900/40">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm font-serif">
            <span>⚡</span>
            <h4>II. Event Code Optimization</h4>
          </div>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            Intermediate timed 4-tuples with rest-merging and constant folding, reporting reduction metrics while strictly conserving music duration.
          </p>
        </div>

        <div className="indian-card p-4 rounded-xl border border-amber-900/40">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm font-serif">
            <span>🎶</span>
            <h4>III. Audio Synthesis & Tanpura</h4>
          </div>
          <p className="text-xs text-amber-200/60 leading-relaxed">
            Real-time Web Audio synthesis with 16 instruments, live acoustic Tanpura drone (श्रुति), canvas piano visualizer, and binary MIDI export.
          </p>
        </div>
      </div>

      {/* Footer & Academic Credits */}
      <footer className="relative z-10 text-center text-xs text-amber-300/60 border-t border-amber-950/80 pt-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <strong>Guided by:</strong> Dr. C. Anitha
          </div>
          <div>
            <strong>Presented by:</strong> S. Sha He Zaman · P. Hirushikesan · B. Revanth
          </div>
          <div>
            COMPILER DESIGN – 1407
          </div>
        </div>
      </footer>
    </div>
  );
}
