import { describe, expect, it } from 'vitest';
import { BUILTIN_RIFFS, parseRiff } from './riffs';
import { LESSONS } from './lessons';
import { TUNINGS } from './tunings';
import { CHORDS } from './chords';
import { parseDsl } from '../tab/dsl';
import { buildSequence, sectionRefs } from '../tab/sequence';

describe('Yerleşik riffler', () => {
  it('benzersiz kimlikler', () => {
    const ids = BUILTIN_RIFFS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const riff of BUILTIN_RIFFS) {
    it(`${riff.title}: uyarısız ayrışır ve çalınabilir`, () => {
      const { sections, warnings } = parseRiff(riff);
      expect(warnings).toEqual([]);
      expect(sections.length).toBeGreaterThan(0);
      const tuning = TUNINGS[riff.tuning].notes;
      sections.forEach((s, i) => {
        expect(s.tab.measures.length).toBeGreaterThan(0);
        const seq = buildSequence([s.tab], sectionRefs(0, s.tab), tuning, riff.timeSig);
        expect(seq.totalBeats).toBeGreaterThan(0);
        for (const e of seq.events)
          for (const n of e.notes) {
            expect(Number.isFinite(n.midi)).toBe(true);
            expect(n.midi).toBeGreaterThanOrEqual(tuning[0]);
          }
        expect(i).toBeGreaterThanOrEqual(0);
      });
    });
  }
});

describe('Ders içerikleri', () => {
  const riffIds = new Set(BUILTIN_RIFFS.map((r) => r.id));
  const chordIds = new Set(CHORDS.map((c) => c.id));
  for (const lesson of LESSONS) {
    it(`${lesson.num}. ${lesson.title}`, () => {
      for (const b of lesson.blocks) {
        if (b.type === 'tab') {
          const r = parseDsl(b.tab, { tuning: TUNINGS[b.tuning ?? 'standard'].notes, timeSig: b.timeSig ?? [4, 4] });
          expect(r.warnings, b.title).toEqual([]);
        }
        if (b.type === 'riffs') b.ids.forEach((id) => expect(riffIds.has(id), id).toBe(true));
        if (b.type === 'chords') b.ids.forEach((id) => expect(chordIds.has(id), id).toBe(true));
      }
      expect(lesson.checklist.length).toBeGreaterThan(0);
    });
  }
  it('ders numaraları sıralı', () => {
    expect(LESSONS.map((l) => l.num)).toEqual(LESSONS.map((_, i) => i + 1));
  });
});
