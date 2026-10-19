import type { ChordShape } from '../components/ChordDiagram';
import type { TuningId } from './tunings';

export type ChordGroup = 'open' | 'power' | 'barre' | 'seventh' | 'sus';

export interface ChordDef {
  id: string;
  name: string;
  full: string;
  group: ChordGroup;
  shape: ChordShape;
  tip?: string;
  /** Kök notanın bulunduğu tel indeksi (0 = 6. tel) */
  rootIndex?: number;
  /** Standart dışı akort gerektiriyorsa */
  tuning?: TuningId;
}

const n = null;

export const CHORDS: ChordDef[] = [
  // Açık akorlar
  { id: 'Em', name: 'Em', full: 'Mi minör', group: 'open', shape: { frets: [0, 2, 2, 0, 0, 0], fingers: [n, 2, 3, n, n, n] }, rootIndex: 0, tip: 'İlk öğrenilecek akor: sadece iki parmak.' },
  { id: 'E', name: 'E', full: 'Mi majör', group: 'open', shape: { frets: [0, 2, 2, 1, 0, 0], fingers: [n, 2, 3, 1, n, n] }, rootIndex: 0, tip: 'Em şekline işaret parmağını (3. tel 1. perde) ekle.' },
  { id: 'Am', name: 'Am', full: 'La minör', group: 'open', shape: { frets: [n, 0, 2, 2, 1, 0], fingers: [n, n, 2, 3, 1, n] }, rootIndex: 1, tip: 'E majör şeklinin bir tel aşağı kaydırılmış hali.' },
  { id: 'A', name: 'A', full: 'La majör', group: 'open', shape: { frets: [n, 0, 2, 2, 2, 0], fingers: [n, n, 1, 2, 3, n] }, rootIndex: 1, tip: 'Üç parmak aynı perdede yan yana; sıkışırsa 2-3-4 parmaklarını dene.' },
  { id: 'D', name: 'D', full: 'Re majör', group: 'open', shape: { frets: [n, n, 0, 2, 3, 2], fingers: [n, n, n, 1, 3, 2] }, rootIndex: 2, tip: 'Sadece ilk dört teli çal — 5. ve 6. tele dokunma.' },
  { id: 'Dm', name: 'Dm', full: 'Re minör', group: 'open', shape: { frets: [n, n, 0, 2, 3, 1], fingers: [n, n, n, 2, 3, 1] }, rootIndex: 2 },
  { id: 'C', name: 'C', full: 'Do majör', group: 'open', shape: { frets: [n, 3, 2, 0, 1, 0], fingers: [n, 3, 2, n, 1, n] }, rootIndex: 1, tip: 'Parmaklar merdiven gibi: 1-2-3. Açık 3. telin çınlamasına dikkat.' },
  { id: 'G', name: 'G', full: 'Sol majör', group: 'open', shape: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, n, n, n, 3] }, rootIndex: 0, tip: 'Alternatif: 3-2-0-0-3-3 (daha dolgun, rock\'ta sık).' },
  { id: 'Fmaj7', name: 'Fmaj7', full: 'Fa majör 7 (kolay F)', group: 'open', shape: { frets: [n, n, 3, 2, 1, 0], fingers: [n, n, 3, 2, 1, n] }, rootIndex: 2, tip: 'Barre F öğrenene kadar F yerine kullanılabilir.' },
  { id: 'Cadd9', name: 'Cadd9', full: 'Do add9', group: 'open', shape: { frets: [n, 3, 2, 0, 3, 0], fingers: [n, 2, 1, n, 3, n] }, rootIndex: 1, tip: 'G akorundan geçişi çok kolay: 3. ve 4. parmak yerinde kalabilir.' },

  // Yedili akorlar
  { id: 'E7', name: 'E7', full: 'Mi 7', group: 'seventh', shape: { frets: [0, 2, 0, 1, 0, 0], fingers: [n, 2, n, 1, n, n] }, rootIndex: 0 },
  { id: 'A7', name: 'A7', full: 'La 7', group: 'seventh', shape: { frets: [n, 0, 2, 0, 2, 0], fingers: [n, n, 2, n, 3, n] }, rootIndex: 1 },
  { id: 'D7', name: 'D7', full: 'Re 7', group: 'seventh', shape: { frets: [n, n, 0, 2, 1, 2], fingers: [n, n, n, 2, 1, 3] }, rootIndex: 2 },
  { id: 'G7', name: 'G7', full: 'Sol 7', group: 'seventh', shape: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, n, n, n, 1] }, rootIndex: 0 },
  { id: 'B7', name: 'B7', full: 'Si 7', group: 'seventh', shape: { frets: [n, 2, 1, 2, 0, 2], fingers: [n, 2, 1, 3, n, 4] }, rootIndex: 1 },
  { id: 'Am7', name: 'Am7', full: 'La minör 7', group: 'seventh', shape: { frets: [n, 0, 2, 0, 1, 0], fingers: [n, n, 2, n, 1, n] }, rootIndex: 1 },
  { id: 'Em7', name: 'Em7', full: 'Mi minör 7', group: 'seventh', shape: { frets: [0, 2, 0, 0, 0, 0], fingers: [n, 2, n, n, n, n] }, rootIndex: 0 },

  // Sus akorlar
  { id: 'Dsus2', name: 'Dsus2', full: 'Re sus2', group: 'sus', shape: { frets: [n, n, 0, 2, 3, 0], fingers: [n, n, n, 1, 3, n] }, rootIndex: 2 },
  { id: 'Dsus4', name: 'Dsus4', full: 'Re sus4', group: 'sus', shape: { frets: [n, n, 0, 2, 3, 3], fingers: [n, n, n, 1, 2, 3] }, rootIndex: 2 },
  { id: 'Asus2', name: 'Asus2', full: 'La sus2', group: 'sus', shape: { frets: [n, 0, 2, 2, 0, 0], fingers: [n, n, 1, 2, n, n] }, rootIndex: 1 },
  { id: 'Asus4', name: 'Asus4', full: 'La sus4', group: 'sus', shape: { frets: [n, 0, 2, 2, 3, 0], fingers: [n, n, 1, 2, 3, n] }, rootIndex: 1 },

  // Power chord'lar
  { id: 'E5', name: 'E5', full: 'Mi power chord', group: 'power', shape: { frets: [0, 2, 2, n, n, n], fingers: [n, 1, 2, n, n, n] }, rootIndex: 0, tip: 'Açık 6. tel + iki parmak. Metalin en kalın sesi.' },
  { id: 'A5', name: 'A5', full: 'La power chord', group: 'power', shape: { frets: [n, 0, 2, 2, n, n], fingers: [n, n, 1, 2, n, n] }, rootIndex: 1 },
  { id: 'D5', name: 'D5', full: 'Re power chord', group: 'power', shape: { frets: [n, n, 0, 2, 3, n], fingers: [n, n, n, 1, 2, n] }, rootIndex: 2 },
  { id: 'F5', name: 'F5', full: 'Fa power chord (taşınabilir)', group: 'power', shape: { frets: [1, 3, 3, n, n, n], fingers: [1, 3, 4, n, n, n] }, rootIndex: 0, tip: 'Bu şekli 6. telde kaydırarak her power chord\'u çalabilirsin.' },
  { id: 'G5', name: 'G5', full: 'Sol power chord', group: 'power', shape: { frets: [3, 5, 5, n, n, n], fingers: [1, 3, 4, n, n, n] }, rootIndex: 0 },
  { id: 'C5', name: 'C5', full: 'Do power chord (5. tel kök)', group: 'power', shape: { frets: [n, 3, 5, 5, n, n], fingers: [n, 1, 3, 4, n, n] }, rootIndex: 1 },
  { id: 'D5drop', name: 'D5 (Drop D)', full: 'Drop D akortta tek parmak power chord', group: 'power', tuning: 'dropD', shape: { frets: [0, 0, 0, n, n, n] }, rootIndex: 0, tip: 'Drop D akortta alt üç açık tel = D5. Perdede tek parmakla yatır.' },
  { id: 'F5drop', name: 'F5 (Drop D)', full: 'Drop D: 3. perdede tek parmak', group: 'power', tuning: 'dropD', shape: { frets: [3, 3, 3, n, n, n], fingers: [1, 1, 1, n, n, n], barre: { fret: 3, from: 6, to: 4 } }, rootIndex: 0 },

  // Barre akorlar
  { id: 'F', name: 'F', full: 'Fa majör (barre)', group: 'barre', shape: { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 6, to: 1 } }, rootIndex: 0, tip: 'E şeklinin barre hali. İşaret parmağının kemikli yan tarafını kullan.' },
  { id: 'Bm', name: 'Bm', full: 'Si minör (barre)', group: 'barre', shape: { frets: [n, 2, 4, 4, 3, 2], fingers: [n, 1, 3, 4, 2, 1], barre: { fret: 2, from: 5, to: 1 } }, rootIndex: 1, tip: 'Am şeklinin 2. perdede barre hali.' },
  { id: 'Fm', name: 'Fm', full: 'Fa minör (barre)', group: 'barre', shape: { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 6, to: 1 } }, rootIndex: 0 },
  { id: 'Bb', name: 'B♭', full: 'Si bemol majör (barre)', group: 'barre', shape: { frets: [n, 1, 3, 3, 3, 1], fingers: [n, 1, 2, 3, 4, 1], barre: { fret: 1, from: 5, to: 1 } }, rootIndex: 1, tip: 'A şeklinin barre hali.' },
  { id: 'Gbarre', name: 'G (barre)', full: 'Sol majör, 3. perde barre', group: 'barre', shape: { frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 3, from: 6, to: 1 } }, rootIndex: 0 },
];

export const CHORD_GROUP_LABELS: Record<ChordGroup, string> = {
  open: 'Açık akorlar',
  power: 'Power chord\'lar',
  seventh: 'Yedili akorlar',
  sus: 'Sus akorlar',
  barre: 'Barre akorlar',
};

export function getChord(id: string) {
  return CHORDS.find((c) => c.id === id);
}

/** Akor şeklinin MIDI notaları (kalından inceye), verilen akort için */
export function chordMidis(shape: ChordShape, tuning: number[]): number[] {
  return shape.frets.map((f, i) => (f === null ? null : tuning[i] + f)).filter((x): x is number => x !== null);
}
