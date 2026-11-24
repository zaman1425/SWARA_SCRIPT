// ============================================================
// Sample SwaraScript Programs (Classical Indian Ragas & Western)
// ============================================================

export interface SampleProgram {
  name: string;
  raga?: string;
  tala?: string;
  description: string;
  code: string;
}

export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    name: 'Lambodara (Malahari Geetham)',
    raga: 'Malahari',
    tala: 'Roopaka (3 beats)',
    description: 'First geetham taught in Carnatic music by Sri Purandara Dasa (dedicated to Lord Ganesha)',
    code: `// Sri Gananatha / Lambodara Lakumikara
// Raga: Malahari (Janya of Mayamalavagowla)
// Tala: Roopaka
tempo 96
instrument veena

phrase pallavi_line1 {
  Ma Pa Dha Sa 2
  Dha Pa Ma Ga Ri Sa
}

phrase pallavi_line2 {
  Ri Ma Pa Dha 2
  Ma Pa Dha Pa Ma Ga
}

phrase charanam {
  Sa Ri Ma Ga Ri Sa
  Ri Ma Pa Dha 2
  Dha Pa Ma Ga Ri Sa
}

play pallavi_line1
rest 1
play pallavi_line2
rest 1
repeat 2 { play charanam }`,
  },
  {
    name: 'Raga Mayamalavagowla (Sarali Varisai)',
    raga: 'Mayamalavagowla (15th Melakarta)',
    tala: 'Adi Tala (8 aksharas)',
    description: 'Foundational Carnatic Sarali & Janta exercise with ascending & descending swaras',
    code: `// Foundational Sarali & Janta Varisai
// Raga: Mayamalavagowla
tempo 110
instrument flute

phrase arohanam {
  Sa Ri Ga Ma Pa Dha Ni
  octave 5
  Sa
}

phrase avarohanam {
  octave 5
  Sa
  octave 4
  Ni Dha Pa Ma Ga Ri Sa
}

phrase janta_pattern {
  Sa Sa Ri Ri Ga Ga Ma Ma
  Pa Pa Dha Dha Ni Ni
  octave 5
  Sa Sa
}

play arohanam
rest
play avarohanam
rest
repeat 2 { play janta_pattern }`,
  },
  {
    name: 'Raga Mohanam (Auspicious Pentatonic)',
    raga: 'Mohanam',
    description: 'Bright Carnatic/Hindustani raga (Audava - 5 notes: Sa Ri2 Ga3 Pa Dha2)',
    code: `// Raga Mohanam - Ninnukori Chalamela Motif
tempo 120
instrument sitar

phrase arohana {
  Sa Ri Ga Pa Dha
  octave 5
  Sa
}

phrase pallavi_swaras {
  octave 4
  Ga 2 Ga Ri Sa Ri
  Ga Ga Ri Ri Sa 2
  Pa Dha Sa Ri Ga Ri
  octave 5
  Sa 2
}

phrase fast_gamaka {
  octave 4
  Sa Ri Ga Pa
  Ri Ga Pa Dha
  Ga Pa Dha
  octave 5
  Sa
}

play arohana
rest
play pallavi_swaras
rest
repeat 2 { play fast_gamaka }`,
  },
  {
    name: 'Raga Hamsadhwani (Vatapi Ganapatim)',
    raga: 'Hamsadhwani',
    description: 'Revered invocation raga created by Ramaswami Dikshitar (Sa Ri Ga Pa Ni)',
    code: `// Vatapi Ganapatim Motif
// Raga: Hamsadhwani (Sa Ri2 Ga3 Pa Ni3 Sa')
tempo 130
instrument flute

phrase invocation {
  Sa 2 Pa 2 Ga Ri
  Sa Ri Ga Pa Ni
  octave 5
  Sa 2
}

phrase chittaswaram {
  octave 5
  Sa Ni Pa Ga Ri
  octave 4
  Sa Ri Ga Pa Ni
  octave 5
  Sa Ri Ga 2
  Ri Sa Ni Pa Ga Ri Sa
}

play invocation
rest 1
play chittaswaram`,
  },
  {
    name: 'Jugalbandi (Veena & Sitar Dialogue)',
    description: 'Call-and-response duet between South Indian Veena and North Indian Sitar',
    code: `// Jugalbandi: Carnatic & Hindustani Dialogue
tempo 115

// Veena calls
instrument veena
phrase veena_theme {
  Sa Ri Ga Ma Pa 2
}
play veena_theme
rest 0.5

// Sitar responds
instrument sitar
phrase sitar_response {
  Pa Dha Ni
  octave 5
  Sa 2
}
play sitar_response
rest 0.5

// Harmonious union
instrument flute
phrase unison {
  octave 5
  Sa Ni Dha Pa
  octave 4
  Ma Ga Ri Sa 2
}
repeat 2 { play unison }`,
  },
  {
    name: 'Twinkle Twinkle (Western Notation)',
    description: 'Western classical nursery tune written with letter pitch names',
    code: `// Twinkle Twinkle Little Star
tempo 120
instrument piano

phrase line1 { C4 C4 G4 G4 A4 A4 G4 2 }
phrase line2 { F4 F4 E4 E4 D4 D4 C4 2 }
phrase line3 { G4 G4 F4 F4 E4 E4 D4 2 }

play line1
play line2
play line3
play line3
play line1
play line2`,
  },
  {
    name: 'Compiler Stress Test (500-Line Target)',
    description: 'Performance benchmark demonstrating < 200 ms compiler throughput',
    code: `// 500-Line Performance Benchmark
tempo 160
instrument flute

phrase motif {
  Sa Ri Ga Ma Pa Dha Ni
}

phrase chitta {
  Sa Ga Pa Ri Ma Dha Ga Pa Ni
}

repeat 8 { play motif }
repeat 6 { play chitta }
reverse { Sa Ri Ga Ma Pa Dha Ni }
rest
repeat 4 { play motif }`,
  },
];
