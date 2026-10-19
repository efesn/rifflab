// Temel müzik teorisi yardımcıları: nota adları, frekans dönüşümleri, aralıklar.

export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const SOLFEGE_SHARP = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'] as const;
export const SOLFEGE_FLAT = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'] as const;

export type NoteNaming = 'letter' | 'solfege';

export const mod12 = (n: number) => ((Math.round(n) % 12) + 12) % 12;

export function midiToFreq(midi: number, a4 = 440): number {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq: number, a4 = 440): number {
  return 69 + 12 * Math.log2(freq / a4);
}

export function octaveOf(midi: number): number {
  return Math.floor(Math.round(midi) / 12) - 1;
}

/** Perde sınıfı (0 = C) için ad. */
export function pcName(pc: number, naming: NoteNaming = 'letter', flats = false): string {
  const i = mod12(pc);
  if (naming === 'solfege') return (flats ? SOLFEGE_FLAT : SOLFEGE_SHARP)[i];
  return (flats ? FLAT_NAMES : SHARP_NAMES)[i];
}

/** MIDI numarası için nota adı, isteğe bağlı oktav ile (E2, Mi2 ...). */
export function noteName(midi: number, naming: NoteNaming = 'letter', withOctave = false, flats = false): string {
  const name = pcName(midi, naming, flats);
  return withOctave ? `${name}${octaveOf(midi)}` : name;
}

/** "E2", "F#3", "Bb1" gibi bir yazımı MIDI numarasına çevirir. */
export function parseNote(text: string): number | null {
  const m = /^([A-Ga-g])([#b]?)(-?\d)$/.exec(text.trim());
  if (!m) return null;
  const base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1].toLowerCase() as 'c'];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (parseInt(m[3], 10) + 1) * 12 + base + acc;
}

export const INTERVAL_NAMES: Record<number, { short: string; name: string }> = {
  0: { short: '1', name: 'Tonik (kök)' },
  1: { short: 'b2', name: 'Küçük ikili' },
  2: { short: '2', name: 'Büyük ikili' },
  3: { short: 'b3', name: 'Küçük üçlü' },
  4: { short: '3', name: 'Büyük üçlü' },
  5: { short: '4', name: 'Tam dörtlü' },
  6: { short: 'b5', name: 'Triton' },
  7: { short: '5', name: 'Tam beşli' },
  8: { short: 'b6', name: 'Küçük altılı' },
  9: { short: '6', name: 'Büyük altılı' },
  10: { short: 'b7', name: 'Küçük yedili' },
  11: { short: '7', name: 'Büyük yedili' },
  12: { short: '8', name: 'Oktav' },
};

/** Cent farkı: f frekansının hedef MIDI notasına göre sapması. */
export function centsOff(freq: number, targetMidi: number, a4 = 440): number {
  return 1200 * Math.log2(freq / midiToFreq(targetMidi, a4));
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
