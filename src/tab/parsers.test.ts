import { describe, expect, it } from 'vitest';
import { parseDsl } from './dsl';
import { parseAsciiTab } from './ascii';
import { buildSequence, sectionRefs } from './sequence';
import { TUNINGS } from '../data/tunings';
import { eventsDuration } from './types';

const STD = TUNINGS.standard.notes;
const DROP_D = TUNINGS.dropD.notes;
const DROP_C = TUNINGS.dropC.notes;

describe('RiffLab notasyonu', () => {
  it('chug + power chord ölçüsünü ayrıştırır', () => {
    const r = parseDsl('e 6:0m 6:0m 6:0m 6:0m 6:0m 6:0m P6:3> r', { tuning: DROP_D, timeSig: [4, 4] });
    expect(r.warnings).toEqual([]);
    expect(r.measures).toHaveLength(1);
    const evs = r.measures[0].events;
    expect(evs).toHaveLength(8);
    expect(evs[0].pm).toBe(true);
    expect(evs[6].notes).toEqual([
      { string: 6, fret: 3 },
      { string: 5, fret: 3 },
    ]);
    expect(evs[6].accent).toBe(true);
    expect(evs[6].powerRoot).toBe(41);
    expect(evs[7].notes).toEqual([]);
  });

  it('standart akortta Q makrosu kök-beşli-oktav üretir', () => {
    const r = parseDsl('w Q6:3', { tuning: STD, timeSig: [4, 4] });
    expect(r.measures[0].events[0].notes).toEqual([
      { string: 6, fret: 3 },
      { string: 5, fret: 5 },
      { string: 4, fret: 5 },
    ]);
    const r5 = parseDsl('w P5:3', { tuning: STD, timeSig: [4, 4] });
    expect(r5.measures[0].events[0].notes).toEqual([
      { string: 5, fret: 3 },
      { string: 4, fret: 5 },
    ]);
  });

  it('Drop C akortta tek parmak power chord', () => {
    const r = parseDsl('w Q6:5', { tuning: DROP_C, timeSig: [4, 4] });
    expect(r.measures[0].events[0].notes.map((n) => n.fret)).toEqual([5, 5, 5]);
  });

  it('tekrar grupları ve yapışkan süre', () => {
    const r = parseDsl('(e 6:0m)x6 q P6:5', { tuning: DROP_D, timeSig: [4, 4] });
    expect(r.warnings).toEqual([]);
    expect(r.measures[0].events).toHaveLength(7);
    expect(eventsDuration(r.measures[0].events)).toBe(4);
  });

  it('tekrar grubu içinde ölçü çizgileri', () => {
    const r = parseDsl('( q 6:0 6:0 6:0 6:0 | )x3', { tuning: STD, timeSig: [4, 4] });
    expect(r.measures).toHaveLength(3);
    expect(r.warnings).toEqual([]);
  });

  it('eksik ölçüler için uyarı verir', () => {
    const r = parseDsl('q 6:0 6:0 | 6:0 6:0 6:0 6:0', { tuning: STD, timeSig: [4, 4] });
    expect(r.measures).toHaveLength(2);
    expect(r.warnings.length).toBe(1);
  });

  it('bağ, üçleme ve teknik ekleri', () => {
    const r = parseDsl('e3 3:5 3:7h 3:5p q 3:7b2~ h 3:5/ _ r', { tuning: STD, timeSig: [4, 4] });
    expect(r.warnings).toEqual([]);
    const evs = r.measures.flatMap((m) => m.events);
    expect(evs[1].notes[0].hammer).toBe(true);
    expect(evs[2].notes[0].pull).toBe(true);
    expect(evs[3].notes[0]).toMatchObject({ bend: 2, vibrato: true });
    expect(evs[4].notes[0].slide).toBe(true);
    expect(evs[5].tie).toBe(true);
    expect(eventsDuration(evs)).toBeCloseTo(8);
  });

  it('etiket ve yorum satırları', () => {
    const r = parseDsl('# yorum satırı\n"Em" w 6:0+5:2+4:2', { tuning: STD, timeSig: [4, 4] });
    expect(r.measures[0].events[0].label).toBe('Em');
    expect(r.measures[0].events[0].notes).toHaveLength(3);
  });
});

describe('ASCII tab', () => {
  const sample = `
Intro riff
e|-----------------|
B|-----------------|
G|-----------------|
D|-----------------|
A|-----2---2-------|
E|-0-0---0---0-3-2-|
`;
  it('notaları sırayla bulur', () => {
    const r = parseAsciiTab(sample, { timing: 'even', unit: 0.5, timeSig: [4, 4] });
    expect(r.systems).toBe(1);
    const evs = r.measures.flatMap((m) => m.events);
    expect(evs.map((e) => e.notes.map((n) => `${n.string}:${n.fret}`).join('+'))).toEqual(['6:0', '6:0', '5:2', '6:0', '5:2', '6:0', '6:3', '6:2']);
  });

  it('iki haneli perdeler ve akorlar', () => {
    const t = `e|------|
B|------|
G|------|
D|--12--|
A|--12--|
E|--10--|`;
    const r = parseAsciiTab(t, { timing: 'even', unit: 1, timeSig: [4, 4] });
    const evs = r.measures.flatMap((m) => m.events);
    expect(evs).toHaveLength(1);
    expect(evs[0].notes.map((n) => n.fret)).toEqual([10, 12, 12]);
  });

  it('hammer-on, bend ve palm mute satırı', () => {
    const t = `PM-----
e|-------------|
B|-------------|
G|-----5h7-7b9-|
D|-------------|
A|-------------|
E|-0-0---------|`;
    const r = parseAsciiTab(t, { timing: 'even', unit: 0.5, timeSig: [4, 4] });
    const evs = r.measures.flatMap((m) => m.events);
    expect(evs).toHaveLength(5);
    expect(evs[0].pm).toBe(true);
    expect(evs[3].notes[0]).toMatchObject({ fret: 7, hammer: true });
    expect(evs[4].notes[0]).toMatchObject({ fret: 7, bend: 2 });
  });

  it('aralıklardan ritim tahmini', () => {
    const t = `e|----------------|
B|----------------|
G|----------------|
D|----------------|
A|----------------|
E|-0-0-0-0-3---5--|`;
    const r = parseAsciiTab(t, { timing: 'spacing', unit: 0.5, timeSig: [4, 4] });
    const durs = r.measures.flatMap((m) => m.events).map((e) => e.dur);
    expect(durs).toEqual([0.5, 0.5, 0.5, 0.5, 1, 1]);
  });

  it('tab olmayan metinde uyarı verir', () => {
    const r = parseAsciiTab('Merhaba dünya\nAm C G', { timing: 'even', unit: 0.5, timeSig: [4, 4] });
    expect(r.measures).toHaveLength(0);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe('Oynatma dizisi', () => {
  it('bağlar önceki notayı uzatır, vuruşlar birikir', () => {
    const tab = parseDsl('h 6:0 _ | q 6:3 6:5 h 6:0', { tuning: STD, timeSig: [4, 4] });
    const seq = buildSequence([tab], sectionRefs(0, tab, 2), STD, [4, 4]);
    expect(seq.totalBeats).toBe(16);
    expect(seq.events[0].notes[0].durBeats).toBe(4);
    expect(seq.events[1].tie).toBe(true);
    expect(seq.measures).toHaveLength(4);
    expect(seq.events[2].notes[0].midi).toBe(43);
  });
});
