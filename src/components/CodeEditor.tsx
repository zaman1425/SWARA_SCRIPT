'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  errors?: Array<{ line: number; column: number; message: string; severity: string }>;
}

const SWARA_CHIPS = [
  { label: 'Sa', code: 'Sa ', hint: 'Shadjam (C)' },
  { label: 'Ri', code: 'Ri ', hint: 'Rishabham (D)' },
  { label: 'Ga', code: 'Ga ', hint: 'Gandharam (E)' },
  { label: 'Ma', code: 'Ma ', hint: 'Madhyamam (F)' },
  { label: 'Pa', code: 'Pa ', hint: 'Panchamam (G)' },
  { label: 'Dha', code: 'Dha ', hint: 'Dhaivatham (A)' },
  { label: 'Ni', code: 'Ni ', hint: 'Nishadham (B)' },
  { label: 'rest', code: 'rest ', hint: 'Silent beat' },
  { label: 'repeat 2', code: 'repeat 2 {\n  \n}', hint: 'Loop block' },
  { label: 'phrase', code: 'phrase motif {\n  Sa Ri Ga Ma Pa\n}', hint: 'Phrase block' },
];

export default function CodeEditor({ code, onChange, errors }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const errorLines = new Set(errors?.filter(e => e.severity === 'error').map(e => e.line) ?? []);
  const warningLines = new Set(errors?.filter(e => e.severity === 'warning').map(e => e.line) ?? []);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newCode);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }, [code, onChange]);

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(code + '\n' + snippet);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + snippet + code.substring(end);
    onChange(newCode);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#140407] to-[#0c0204]">
      {/* Editor Header Bar with Indian Accents */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#1d060b] border-b border-amber-900/40 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">📜</span>
          <span className="text-sm font-semibold text-amber-100">SwaraScript Source Studio</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/40 text-amber-300/80">
            स्वर लिपि
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-amber-200/50 font-mono">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{code.length} chars</span>
        </div>
      </div>

      {/* Quick Swara Insert Chips */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#120306]/90 border-b border-amber-900/30 overflow-x-auto text-xs">
        <span className="text-amber-400/60 text-[11px] font-medium mr-1 whitespace-nowrap">
          Quick Swara:
        </span>
        {SWARA_CHIPS.map((chip) => (
          <button
            key={chip.label}
            onClick={() => insertSnippet(chip.code)}
            title={chip.hint}
            className="px-2.5 py-1 rounded-md bg-amber-950/40 hover:bg-amber-800/40 text-amber-200 border border-amber-700/30 hover:border-amber-400/60 font-mono text-xs transition-all whitespace-nowrap shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 relative min-h-[460px]">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className="select-none font-mono text-sm leading-6 py-4 px-3 text-right bg-[#100305] border-r border-amber-950 overflow-hidden min-w-[3.2rem]"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className={`${
                errorLines.has(i + 1)
                  ? 'text-red-300 bg-red-950/70 border-r-2 border-red-500 font-bold'
                  : warningLines.has(i + 1)
                  ? 'text-amber-300 bg-amber-950/60 border-r-2 border-amber-500 font-bold'
                  : 'text-amber-800/60'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-transparent text-amber-50 font-mono text-sm leading-6 py-4 px-4 resize-none focus:outline-none placeholder-amber-900/40 selection:bg-amber-700/40"
          placeholder="// Write your SwaraScript music code here...
// Example:
// tempo 120
// instrument veena
// phrase intro { Sa Ri Ga Ma Pa Dha Ni }
// repeat 2 { play intro }"
        />
      </div>
    </div>
  );
}
