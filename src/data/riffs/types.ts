import type { TuningId } from '../tunings';
import type { DrumPatternId } from '../../audio/drums';
import type { ToneId } from '../../audio/amp';
import type { TimeSig } from '../../tab/types';

export type RiffCategory = 'rammstein' | 'classic' | 'exercise' | 'custom';

export type Technique =
  | 'palm-mute'
  | 'power-chord'
  | 'downpicking'
  | 'alternate'
  | 'chug'
  | 'octave'
  | 'single-note'
  | 'legato'
  | 'bend'
  | 'vibrato'
  | 'slide'
  | 'open-chord'
  | 'arpeggio'
  | 'syncopation'
  | 'gallop'
  | 'muting'
  | 'stamina'
  | 'drop-tuning'
  | 'melody';

export const TECHNIQUE_LABELS: Record<Technique, string> = {
  'palm-mute': 'Palm mute',
  'power-chord': 'Power chord',
  downpicking: 'Aşağı vuruş',
  alternate: 'Alternatif pena',
  chug: 'Chug',
  octave: 'Oktav',
  'single-note': 'Tek nota riff',
  legato: 'Hammer-on / Pull-off',
  bend: 'Bending',
  vibrato: 'Vibrato',
  slide: 'Slide',
  'open-chord': 'Açık akor',
  arpeggio: 'Arpej',
  syncopation: 'Senkop',
  gallop: 'Dörtnala',
  muting: 'Susturma',
  stamina: 'Dayanıklılık',
  'drop-tuning': 'Drop akort',
  melody: 'Melodi',
};

export interface RiffSection {
  name: string;
  /** RiffLab notasyonu (ya da source = 'ascii' ise ASCII tab) */
  tab: string;
  repeat?: number;
  note?: string;
}

export interface Riff {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  category: RiffCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tuning: TuningId;
  /** Orijinal / hedef tempo */
  bpm: number;
  /** Önerilen başlangıç temposu */
  startBpm?: number;
  timeSig: TimeSig;
  techniques: Technique[];
  summary: string;
  description: string;
  tips: string[];
  sections: RiffSection[];
  drums?: DrumPatternId;
  tone?: ToneId;
  /** Basitleştirilmiş / yaklaşık düzenleme */
  approx?: boolean;
  source?: 'dsl' | 'ascii';
  ascii?: { timing: 'even' | 'spacing'; unit: number };
  createdAt?: string;
}

export const CATEGORY_LABELS: Record<RiffCategory, string> = {
  rammstein: 'Rammstein',
  classic: 'Klasik riffler',
  exercise: 'Teknik egzersizler',
  custom: 'Benim tablarım',
};

export const DIFFICULTY_LABELS = ['', 'Çok kolay', 'Kolay', 'Orta', 'Zor', 'Çok zor'];

/** Başlığın dili: büyük harfe çevirirken Türkçe "i → İ" kuralı yabancı adlara uygulanmasın. */
export function riffLang(r: Pick<Riff, 'title' | 'category'>): string {
  if (/[çğıİöşüÇĞÖŞÜ]/.test(r.title)) return 'tr';
  return r.category === 'rammstein' ? 'de' : 'en';
}

export const categoryLang = (c: RiffCategory) => (c === 'rammstein' ? 'de' : undefined);
