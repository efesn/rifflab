import type { TuningId } from '../tunings';
import type { DrumPatternId } from '../../audio/drums';
import type { ToneId } from '../../audio/amp';
import type { TimeSig } from '../../tab/types';
import type { Technique } from '../riffs/types';
import type { ScaleId } from '../scales';

export type LessonBlock =
  | { type: 'md'; text: string }
  | { type: 'tip'; tone?: 'info' | 'warn' | 'metal' | 'ok' | 'tip'; title?: string; text: string }
  | {
      type: 'tab';
      title?: string;
      tab: string;
      tuning?: TuningId;
      bpm: number;
      startBpm?: number;
      timeSig?: TimeSig;
      drums?: DrumPatternId;
      tone?: ToneId;
      note?: string;
    }
  | { type: 'chords'; ids: string[]; caption?: string }
  | { type: 'scale'; root: number; scale: ScaleId; from?: number; to?: number; caption?: string }
  | { type: 'fretboard'; marks: { string: number; fret: number; label?: string; kind?: 'root' | 'note' }[]; frets?: number; caption?: string; tuning?: TuningId }
  | { type: 'link'; to: string; label: string; desc?: string }
  | { type: 'riffs'; ids: string[]; caption?: string }
  | { type: 'tones'; tuning: TuningId; caption?: string };

export interface Lesson {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  level: 'Başlangıç' | 'Temel' | 'Orta';
  minutes: number;
  goals: string[];
  techniques?: Technique[];
  blocks: LessonBlock[];
  checklist: string[];
}
