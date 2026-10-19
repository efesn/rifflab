// Tab veri modeli. Süreler dörtlük nota = 1 vuruş olacak şekilde "vuruş" cinsindendir.

export interface TabNote {
  /** 1 = ince mi (e) … 6 = kalın mi (E) */
  string: number;
  fret: number;
  dead?: boolean;
  hammer?: boolean;
  pull?: boolean;
  slide?: boolean;
  /** Yarım ses cinsinden bükme (1 = ½, 2 = tam) */
  bend?: number;
  vibrato?: boolean;
  harmonic?: boolean;
}

export interface TabEvent {
  /** Gerçek süre (nokta/üçleme dahil), vuruş cinsinden */
  dur: number;
  /** Ritim gösterimi için temel nota değeri: 4, 2, 1, 0.5, 0.25, 0.125 */
  base: number;
  dots: number;
  tuplet?: number;
  /** Boş dizi = es (sus) */
  notes: TabNote[];
  pm?: boolean;
  accent?: boolean;
  letRing?: boolean;
  /** Önceki olayın notalarını yeniden çalmadan uzatır (bağ) */
  tie?: boolean;
  /** Power chord kök notası (akor adı göstermek için) */
  powerRoot?: number;
  label?: string;
}

export interface TabMeasure {
  events: TabEvent[];
}

export interface ParsedTab {
  measures: TabMeasure[];
  warnings: string[];
}

export type TimeSig = [number, number];

/** Ölçü uzunluğu (dörtlük vuruş cinsinden) */
export function measureBeats(ts: TimeSig): number {
  return (ts[0] * 4) / ts[1];
}

export function eventsDuration(events: TabEvent[]): number {
  return events.reduce((s, e) => s + e.dur, 0);
}

/** Bir süreyi gösterilebilir nota değerine (temel + nokta) ayırır. */
export function splitDuration(dur: number): { base: number; dots: number; tuplet?: number } {
  const bases = [4, 2, 1, 0.5, 0.25, 0.125];
  for (const b of bases) {
    if (Math.abs(dur - b) < 1e-6) return { base: b, dots: 0 };
    if (Math.abs(dur - b * 1.5) < 1e-6) return { base: b, dots: 1 };
    if (Math.abs(dur - (b * 2) / 3) < 1e-6) return { base: b, dots: 0, tuplet: 3 };
  }
  // En yakın temel değer
  let best = 1;
  for (const b of bases) if (Math.abs(dur - b) < Math.abs(dur - best)) best = b;
  return { base: best, dots: 0 };
}
