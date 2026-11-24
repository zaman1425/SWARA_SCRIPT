'use client';

import React, { useState, useRef } from 'react';
import AestheticIndianCanvas from './AestheticIndianCanvas';

interface IndianWelcomeHeroProps {
  onEnter: () => void;
}

const SWARAS = [
  { swara: 'Sa', name: 'Shadjam', freq: 261.63, western: 'C4', color: '#f59e0b', note: 'Tonic' },
  { swara: 'Ri', name: 'Rishabham', freq: 293.66, western: 'D4', color: '#ea580c', note: '2nd' },
  { swara: 'Ga', name: 'Gandharam', freq: 329.63, western: 'E4', color: '#eab308', note: '3rd' },
  { swara: 'Ma', name: 'Madhyamam', freq: 349.23, western: 'F4', color: '#10b981', note: '4th' },
  { swara: 'Pa', name: 'Panchamam', freq: 392.00, western: 'G4', color: '#06b6d4', note: '5th' },
  { swara: 'Dha', name: 'Dhaivatham', freq: 440.00, western: 'A4', color: '#8b5cf6', note: '6th' },
  { swara: 'Ni', name: 'Nishadham', freq: 493.88, western: 'B4', color: '#ec4899', note: '7th' },
];

export default function IndianWelcomeHero({ onEnter }: IndianWelcomeHeroProps) {
  const [activeSwara, setActiveSwara] = useState<typeof SWARAS[0] | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; color?: string; id: number } | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const playTone = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      [1, 2, 3].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sawtooth';
        osc.frequency.value = freq * mult;

        const volume = idx === 0 ? 0.28 : 0.09 / idx;
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

  const handleSwaraAction = (s: typeof SWARAS[0], e: React.MouseEvent) => {
    setActiveSwara(s);
    playTone(s.freq);
    setRipple({
      x: e.clientX,
      y: e.clientY,
      color: s.color,
      id: Date.now(),
    });
  };

  const handleEnterClick = (e: React.MouseEvent) => {
    setIsEntering(true);
    setRipple({
      x: e.clientX,
      y: e.clientY,
      color: '#f59e0b',
      id: Date.now(),
    });
    playTone(261.63);
    setTimeout(() => playTone(392.00), 120);
    setTimeout(() => playTone(523.25), 240);
    setTimeout(() => onEnter(), 450);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-8 select-none bg-gradient-to-b from-[#0e0204] via-[#090103] to-[#050102]"
    >
      {/* Interactive Golden Stardust & Acoustic Shockwave Canvas */}
      <AestheticIndianCanvas rippleTrigger={ripple} />

      {/* Aesthetic Laser-Cut Indian Jali Arch Border Frame */}
      <div className="absolute inset-2 sm:inset-4 border border-amber-500/25 rounded-3xl pointer-events-none z-10">
        {/* Top Center Arch Ornament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 bg-[#0e0204] border border-amber-500/40 rounded-full flex items-center gap-3">
          <span className="text-amber-400 text-xs">◆</span>
          <span className="text-[11px] font-serif tracking-[0.25em] text-amber-200/90 uppercase">
            ॥ नादब्रह्म ॥ · The Architecture of Sound
          </span>
          <span className="text-amber-400 text-xs">◆</span>
        </div>

        {/* Four Indian Jali Filigree Corner Brackets */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-400/60 rounded-tl-2xl">
          <svg className="w-10 h-10 text-amber-500/40 m-1" viewBox="0 0 40 40" fill="none" stroke="currentColor">
            <path d="M0,0 Q20,0 20,20 Q20,40 40,40" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-400/60 rounded-tr-2xl">
          <svg className="w-10 h-10 text-amber-500/40 m-1 ml-auto -scale-x-100" viewBox="0 0 40 40" fill="none" stroke="currentColor">
            <path d="M0,0 Q20,0 20,20 Q20,40 40,40" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-400/60 rounded-bl-2xl">
          <svg className="w-10 h-10 text-amber-500/40 m-1 -scale-y-100" viewBox="0 0 40 40" fill="none" stroke="currentColor">
            <path d="M0,0 Q20,0 20,20 Q20,40 40,40" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-400/60 rounded-br-2xl">
          <svg className="w-10 h-10 text-amber-500/40 m-1 ml-auto -scale-x-100 -scale-y-100" viewBox="0 0 40 40" fill="none" stroke="currentColor">
            <path d="M0,0 Q20,0 20,20 Q20,40 40,40" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Top Bar */}
      <header className="relative z-20 text-center max-w-4xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2.5 px-5 py-1.5 rounded-full bg-gradient-to-r from-red-950/70 via-black/80 to-amber-950/70 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-amber-100 font-semibold uppercase">
            SWARASCRIPT · स्वर लिपि
          </span>
          <span className="text-xs text-amber-500/60">|</span>
          <span className="text-xs text-amber-300/80 font-serif">Domain-Specific Music Compiler</span>
        </div>
      </header>

      {/* Centerpiece: Glowing Royal Portal */}
      <main className="relative z-20 max-w-3xl mx-auto w-full my-auto py-8 flex flex-col items-center text-center">
        {/* Aura Title */}
        <div className="mb-4 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-600/20 via-orange-600/25 to-red-600/20 blur-2xl rounded-full pointer-events-none" />
          <div className="relative">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-black tracking-tight bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(245,158,11,0.25)]">
              SwaraScript
            </h1>
            <div className="flex items-center justify-center gap-3 text-sm sm:text-base text-amber-300/85 font-serif mt-2 tracking-wide">
              <span>सप्त स्वर</span>
              <span className="text-amber-500">✦</span>
              <span>Music Programming Language</span>
              <span className="text-amber-500">✦</span>
              <span>சுர வரிசை</span>
            </div>
          </div>
        </div>

        <p className="max-w-xl text-xs sm:text-sm text-amber-100/70 leading-relaxed font-sans mb-8">
          A note-level musical programming language compiler transforming Swaras and Western notation 
          into optimized intermediate event code, synthesized in real-time with Web Audio.
        </p>

        {/* Interactive Sapta Swara Soundboard */}
        <div className="w-full max-w-2xl bg-[#170509]/85 backdrop-blur-2xl p-5 sm:p-6 rounded-2xl border border-amber-500/30 shadow-[0_12px_45px_rgba(0,0,0,0.7)] mb-8 transition-all hover:border-amber-400/50">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-amber-200 flex items-center gap-2">
              <span className="text-amber-400">✨</span>
              <span>Interactive Sapta Swara Soundboard</span>
            </span>
            <span className="text-amber-400/60 font-mono text-[11px] flex items-center gap-1">
              <span>Audition Notes</span>
              <span className="text-amber-400">🔊</span>
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {SWARAS.map((s) => {
              const isSelected = activeSwara?.swara === s.swara;
              return (
                <button
                  key={s.swara}
                  onMouseEnter={(e) => handleSwaraAction(s, e)}
                  onClick={(e) => handleSwaraAction(s, e)}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
                      : 'bg-black/50 hover:bg-amber-950/50 text-amber-100 border-amber-900/40 hover:border-amber-400/60 hover:scale-105'
                  }`}
                >
                  <span className="text-lg sm:text-2xl font-bold font-mono tracking-tight group-hover:text-amber-200">
                    {s.swara}
                  </span>
                  <span className="text-[10px] text-amber-300/70 font-mono mt-0.5">{s.western}</span>
                  <span className="text-[9px] text-amber-400/50 font-mono mt-0.5">{s.freq.toFixed(0)}Hz</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Swara Feedback Banner */}
          {activeSwara ? (
            <div className="mt-3 py-2 px-3.5 rounded-xl bg-black/60 border border-amber-700/40 text-xs text-amber-200 font-mono flex items-center justify-between shadow-inner">
              <span>Swara: <strong className="text-amber-300">{activeSwara.name} ({activeSwara.swara})</strong></span>
              <span>Western: <strong className="text-orange-300">{activeSwara.western}</strong></span>
              <span>Frequency: <strong className="text-amber-300">{activeSwara.freq} Hz</strong></span>
            </div>
          ) : (
            <div className="mt-3 py-2 px-3 text-[11px] text-amber-300/40 font-mono text-center">
              Hover or click any swara above to trigger acoustic wave pulses
            </div>
          )}
        </div>

        {/* Enter Studio CTA Button */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-300" />
          <button
            onClick={handleEnterClick}
            disabled={isEntering}
            className={`relative px-10 sm:px-14 py-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold text-base sm:text-lg tracking-wider border border-amber-300/50 shadow-2xl transition-all duration-200 active:scale-95 flex items-center gap-3 cursor-pointer ${
              isEntering ? 'opacity-80 scale-95' : ''
            }`}
          >
            <span>Launch Compiler Studio</span>
            <span className="transition-transform group-hover:translate-x-1.5">➔</span>
          </button>
        </div>

        {/* Modern 6-Phase Pipeline Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-[11px] font-mono text-amber-300/60">
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">1. Lexer</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">2. Parser (AST)</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">3. Semantic</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">4. IR Events</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">5. Optimizer</span>
          <span>➔</span>
          <span className="px-2.5 py-1 rounded-md bg-black/50 border border-amber-900/40">6. Web Audio</span>
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="relative z-20 max-w-3xl mx-auto w-full text-center text-[11px] text-amber-300/50 pb-2">
        <div className="flex items-center justify-between border-t border-amber-950/60 pt-3">
          <span>SwaraScript Music Compiler</span>
          <span>Web Audio API · Real-Time IR Synthesis</span>
          <span>Sapta Swara Framework</span>
        </div>
      </footer>
    </div>
  );
}
