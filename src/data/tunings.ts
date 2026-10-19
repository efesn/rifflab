// Akort düzenleri. notes dizisi kalın telden (6. tel) ince tele (1. tel) MIDI numaralarıdır.

export type TuningId = 'standard' | 'dropD' | 'eb' | 'dStd' | 'dropCs' | 'dropC' | 'cStd' | 'dropB';

export interface Tuning {
  id: TuningId;
  name: string;
  notes: number[];
  description: string;
}

export const TUNINGS: Record<TuningId, Tuning> = {
  standard: {
    id: 'standard',
    name: 'Standart (E)',
    notes: [40, 45, 50, 55, 59, 64],
    description: 'En yaygın akort. Derslerin çoğu ve klasik riffler bununla çalınır.',
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D',
    notes: [38, 45, 50, 55, 59, 64],
    description: 'Sadece 6. tel bir tam ses (D) düşürülür. Power chord tek parmakla basılır.',
  },
  eb: {
    id: 'eb',
    name: 'E♭ (yarım ses pes)',
    notes: [39, 44, 49, 54, 58, 63],
    description: 'Tüm teller yarım ses aşağı. Hendrix, Van Halen, Guns N’ Roses.',
  },
  dStd: {
    id: 'dStd',
    name: 'D Standart',
    notes: [38, 43, 48, 53, 57, 62],
    description: 'Tüm teller bir tam ses aşağı.',
  },
  dropCs: {
    id: 'dropCs',
    name: 'Drop C♯',
    notes: [37, 44, 49, 54, 58, 63],
    description: 'Yarım ses pes akorun Drop versiyonu.',
  },
  dropC: {
    id: 'dropC',
    name: 'Drop C',
    notes: [36, 43, 48, 53, 57, 62],
    description: 'Tüm teller bir tam ses aşağı, 6. tel ayrıca bir tam ses daha (C). Ağır, karanlık ton.',
  },
  cStd: {
    id: 'cStd',
    name: 'C Standart',
    notes: [36, 41, 46, 51, 55, 60],
    description: 'Tüm teller iki tam ses aşağı.',
  },
  dropB: {
    id: 'dropB',
    name: 'Drop B',
    notes: [35, 42, 47, 52, 56, 61],
    description: 'Çok ağır, kalın teller (11-56 veya üstü) önerilir.',
  },
};

export const TUNING_LIST: Tuning[] = Object.values(TUNINGS);

/** Tel numarası (1 = ince mi … 6 = kalın mi) için açık tel MIDI numarası. */
export function openStringMidi(tuning: number[], stringNum: number): number {
  return tuning[tuning.length - stringNum];
}

export function fretMidi(tuning: number[], stringNum: number, fret: number): number {
  return openStringMidi(tuning, stringNum) + fret;
}
