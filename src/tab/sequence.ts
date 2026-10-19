// Ayrıştırılmış tab ölçülerini, oynatıcının zamanlayacağı düz bir olay listesine çevirir.

import type { Articulation } from '../audio/guitar';
import { measureBeats, type ParsedTab, type TimeSig } from './types';

export interface MeasureRef {
  section: number;
  measure: number;
}

export interface SeqNote {
  string: number;
  midi: number;
  durBeats: number;
  art: Articulation;
  velocity: number;
  dead?: boolean;
  slideFrom?: number;
  bend?: number;
  vibrato?: boolean;
}

export interface SeqEvent {
  beat: number;
  dur: number;
  ref: MeasureRef & { event: number };
  notes: SeqNote[];
  pm: boolean;
  tie: boolean;
  letRing?: boolean;
}

export interface SeqMeasure {
  beat: number;
  beats: number;
  ref: MeasureRef;
}

export interface Sequence {
  events: SeqEvent[];
  measures: SeqMeasure[];
  totalBeats: number;
  timeSig: TimeSig;
}

const HARMONIC_OFFSET: Record<number, number> = { 12: 12, 24: 24, 7: 19, 19: 19, 5: 24, 4: 28, 9: 28, 16: 28, 3: 31 };

export function buildSequence(sections: ParsedTab[], refs: MeasureRef[], tuning: number[], timeSig: TimeSig): Sequence {
  const events: SeqEvent[] = [];
  const measures: SeqMeasure[] = [];
  let beat = 0;
  let lastSounding: SeqNote[] = [];
  const lastOnString = new Map<number, number>();

  for (const ref of refs) {
    const m = sections[ref.section]?.measures[ref.measure];
    if (!m) continue;
    const mStart = beat;
    m.events.forEach((ev, ei) => {
      const se: SeqEvent = { beat, dur: ev.dur, ref: { ...ref, event: ei }, notes: [], pm: !!ev.pm, tie: !!ev.tie };
      if (ev.tie) {
        for (const n of lastSounding) n.durBeats += ev.dur;
      } else if (ev.notes.length) {
        const notes: SeqNote[] = ev.notes.map((n) => {
          const open = tuning[tuning.length - n.string];
          const midi = n.harmonic ? open + (HARMONIC_OFFSET[n.fret] ?? n.fret + 12) : open + n.fret;
          const legato = n.hammer || n.pull;
          const art: Articulation = n.harmonic ? 'harmonic' : ev.pm ? 'pm' : legato ? 'legato' : 'normal';
          const velocity = ev.accent ? 1 : ev.pm ? 0.86 : legato ? 0.62 : 0.8;
          const sn: SeqNote = { string: n.string, midi, durBeats: ev.dur, art, velocity };
          if (n.dead) sn.dead = true;
          if (n.bend) sn.bend = n.bend;
          if (n.vibrato) sn.vibrato = true;
          if (n.slide) sn.slideFrom = lastOnString.get(n.string) ?? midi - 2;
          return sn;
        });
        // Aşağı vuruş: kalın telden ince tele
        notes.sort((a, b) => b.string - a.string);
        se.notes = notes;
        for (const n of notes) if (!n.dead) lastOnString.set(n.string, n.midi);
        lastSounding = notes;
        if (ev.letRing) se.letRing = true;
      } else {
        lastSounding = [];
      }
      events.push(se);
      beat += ev.dur;
    });
    measures.push({ beat: mStart, beats: beat - mStart, ref });
  }

  // "Çınlasın" işaretli notalar aynı telde yeni nota gelene kadar (en fazla 4 vuruş) uzar
  events.forEach((se, i) => {
    if (!se.letRing) return;
    for (const n of se.notes) {
      let until = Math.min(beat, se.beat + 4);
      for (let k = i + 1; k < events.length; k++) {
        if (events[k].beat >= until) break;
        if (events[k].notes.some((x) => x.string === n.string)) {
          until = events[k].beat;
          break;
        }
      }
      n.durBeats = Math.max(n.durBeats, until - se.beat);
    }
  });

  return { events, measures, totalBeats: beat, timeSig };
}

/** Bir bölümün tüm ölçüleri için referans listesi. */
export function sectionRefs(section: number, tab: ParsedTab, repeat = 1): MeasureRef[] {
  const out: MeasureRef[] = [];
  for (let r = 0; r < repeat; r++) tab.measures.forEach((_, measure) => out.push({ section, measure }));
  return out;
}

export function beatsPerBar(ts: TimeSig) {
  return measureBeats(ts);
}

/** Bir parçadaki farklı (nota, artikülasyon) çiftleri — ses tamponlarını önceden üretmek için. */
export function collectNotes(seq: Sequence): { midi: number; art: Articulation }[] {
  const seen = new Map<string, { midi: number; art: Articulation }>();
  for (const e of seq.events) for (const n of e.notes) if (!n.dead) seen.set(`${n.midi}|${n.art}`, { midi: n.midi, art: n.art });
  return [...seen.values()];
}
