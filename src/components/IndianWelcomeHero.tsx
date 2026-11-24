'use client';

import React, { useState } from 'react';

interface IndianWelcomeHeroProps {
  onEnter: () => void;
}

const SWARAS = [
  { swara: 'Sa', name: 'Shadjam', freq: 261.63, western: 'C4', color: 'from-amber-500 to-orange-600', note: 'Tonic' },
  { swara: 'Ri', name: 'Rishabham', freq: 293.66, western: 'D4', color: 'from-orange-500 to-amber-600', note: '2nd' },
  { swara: 'Ga', name: 'Gandharam', freq: 329.63, western: 'E4', color: 'from-yellow-500 to-amber-600', note: '3rd' },
  { swara: 'Ma', name: 'Madhyamam', freq: 349.23, western: 'F4', color: 'from-emerald-500 to-teal-600', note: '4th' },
  { swara: 'Pa', name: 'Panchamam', freq: 392.00, western: 'G4', color: 'from-cyan-500 to-blue-600', note: '5th' },
  { swara: 'Dha', name: 'Dhaivatham', freq: 440.00, western: 'A4', color: 'from-indigo-500 to-purple-600', note: '6th' },
  { swara: 'Ni', name: 'Nishadham', freq: 493.88, western: 'B4', color: 'from-rose-500 to-pink-600', note: '7th' },
];

export default function IndianWelcomeHero({ onEnter }: IndianWelcomeHeroProps) {
  const [activeSwara, setActiveSwara] = useState<typeof SWARAS[0] | null>(null);

  const playTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Two warm overtone harmonics
      [1, 2].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq * mult;

        const volume = idx === 0 ? 0.25 : 0.08;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {
      // AudioContext fallback
    }
  };

  const handleEnterClick = () => {
    playTone(261.63);
    setTimeout(() => playTone(392.00), 100);
    setTimeout(() => playTone(523.25), 200);
    setTimeout(() => onEnter(), 350);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-8 select-none bg-[#0a0204]">
      {/* Subtle Sound Waveform Resonance Atmosphere */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-600/15 via-red-900/15 to-transparent blur-3xl opacity-70" />
        <div className="absolute w-[800px] h-[800px] rounded-full border border-amber-500/10 animate-pulse-ring" />
        <div className="absolute w-[1050px] h-[1050px] rounded-full border border-amber-500/5" />

        {/* Dynamic Acoustic Soundwave Bars */}
        <div className="absolute flex items-center gap-1.5 opacity-20">
          {[24, 48, 80, 120, 160, 90, 140, 200, 110, 70, 180, 240, 130, 90, 170, 80, 40, 20].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-gradient-to-t from-amber-600 to-yellow-200"
              style={{
                height: `${h}px`,
                animation: `float-gentle ${2.5 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Modern Jali Architectural Frame Corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 pointer-events-none">
        <div className="w-3 h-3 bg-amber-500/30 m-1.5" />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-500/40 pointer-events-none">
        <div className="w-3 h-3 bg-amber-500/30 m-1.5 ml-auto" />
      </div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-500/40 pointer-events-none">
        <div className="w-3 h-3 bg-amber-500/30 m-1.5" />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 pointer-events-none">
        <div className="w-3 h-3 bg-amber-500/30 m-1.5 ml-auto" />
      </div>

      {/* Top Header Tag */}
      <header className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#180509]/80 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-amber-200 uppercase">
            COMPILER DESIGN 1407 · SWARASCRIPT
          </span>
          <span className="text-xs text-amber-500/60">|</span>
          <span className="text-xs text-amber-300/80 font-serif">स्वर लिपि</span>
        </div>
      </header>

      {/* Centerpiece: Royal Indian Glassmorphic Portal */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-6 flex flex-col items-center text-center">
        {/* Main Title Badge */}
        <div className="mb-3">
          <h1 className="text-5xl sm:text-7xl font-serif font-black tracking-wide bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
            SwaraScript
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm sm:text-base text-amber-300/80 font-serif mt-2">
            <span>सप्त स्वर</span>
            <span className="text-amber-500">•</span>
            <span>Domain-Specific Music Compiler</span>
            <span className="text-amber-500">•</span>
            <span>சுர வரிசை</span>
          </div>
        </div>

        <p className="max-w-xl text-xs sm:text-sm text-amber-100/70 leading-relaxed font-sans mb-8">
          A high-performance music programming language compiler with intermediate event code generation, 
          rest-merging optimization, and real-time Indian acoustic synthesis.
        </p>

        {/* Modern Interactive Swara Acoustic Soundboard */}
        <div className="w-full max-w-2xl bg-[#170509]/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-amber-500/25 shadow-2xl shadow-black/60 mb-8">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-amber-300/90 flex items-center gap-1.5">
              <span>🎵</span> Sapta Swara Soundboard
            </span>
            <span className="text-amber-400/60 font-mono text-[11px]">Click or Hover to Audition</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
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
                  className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-black/40 hover:bg-amber-950/40 text-amber-100 border-amber-900/40 hover:border-amber-500/60 hover:scale-105'
                  }`}
                >
                  <span className="text-lg sm:text-xl font-bold font-mono tracking-tight">{s.swara}</span>
                  <span className="text-[10px] text-amber-300/70 font-mono mt-0.5">{s.western}</span>
                  <span className="text-[9px] text-amber-400/50 font-mono mt-0.5">{s.freq.toFixed(0)}Hz</span>
                </button>
              );
            })}
          </div>

          {activeSwara && (
            <div className="mt-3 py-1.5 px-3 rounded-lg bg-black/40 border border-amber-900/40 text-[11px] text-amber-200/90 font-mono flex items-center justify-between">
              <span>Swara: <strong>{activeSwara.name} ({activeSwara.swara})</strong></span>
              <span>Western: <strong>{activeSwara.western}</strong></span>
              <span>Frequency: <strong>{activeSwara.freq} Hz</strong></span>
            </div>
          )}
        </div>

        {/* Modern "Enter Studio" Call to Action */}
        <button
          onClick={handleEnterClick}
          className="group relative px-8 sm:px-12 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold text-sm sm:text-base tracking-wide border border-amber-300/40 shadow-[0_0_25px_rgba(234,88,12,0.4)] transition-all duration-200 active:scale-95 flex items-center gap-2.5 cursor-pointer"
        >
          <span>Launch Compiler Studio</span>
          <span className="transition-transform group-hover:translate-x-1">➔</span>
        </button>

        {/* Compiler Pipeline Flow Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7 text-[11px] font-mono text-amber-300/60">
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">1. Lexer</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">2. Parser (AST)</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">3. Semantic</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">4. IR Events</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">5. Optimizer</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/40 border border-amber-900/40">6. Web Audio</span>
        </div>
      </div>

      {/* Modern Footer with Academic Credits */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-amber-200/50 border-t border-amber-950/60 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><strong>Guided by:</strong> Dr. C. Anitha</div>
          <div><strong>Presented by:</strong> S. Sha He Zaman · P. Hirushikesan · B. Revanth</div>
          <div className="font-mono">COMPILER DESIGN – 1407</div>
        </div>
      </footer>
    </div>
  );
}
