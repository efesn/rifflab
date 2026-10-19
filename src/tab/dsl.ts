// RiffLab notasyonu: riffleri kısa ve okunabilir biçimde yazmak için küçük bir dil.
//
//   Süreler (yapışkan — değiştirilene kadar geçerli):
//     w = birlik, h = ikilik, q = dörtlük, e = sekizlik, s = onaltılık, t = otuzikilik
//     "." ekiyle noktalı (q.), "3" ekiyle üçleme (e3)
//   Notalar:   6:0  → 6. tel (kalın mi) açık,   3:7 → 3. tel 7. perde,   5:x → ölü nota
//   Akor:      6:0+5:2+4:2
//   Power chord: P6:3 → kök + beşli,  Q6:3 → kök + beşli + oktav (akort düzenine göre hesaplanır)
//   Ekler:     m = palm mute, > = vurgu, ! = çınlasın (let ring), h = hammer-on, p = pull-off,
//              / = kaydırma (slide), b / b1 / b2 = bükme, ~ = vibrato, * = doğal armonik
//   Diğer:     r = es (sus), _ = bağ (önceki sesi uzat), | = ölçü çizgisi,
//              ( ... )x4 = tekrar, "Em" = sonraki olayın üstüne etiket, # = yorum

import { measureBeats, eventsDuration, type ParsedTab, type TabEvent, type TabMeasure, type TabNote, type TimeSig } from './types';

const DUR: Record<string, number> = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25, t: 0.125 };

type Tok =
  | { k: 'dur'; base: number; dots: number; tuplet?: number }
  | { k: 'rest' }
  | { k: 'tie' }
  | { k: 'bar' }
  | { k: 'open' }
  | { k: 'close'; times: number }
  | { k: 'label'; text: string }
  | { k: 'event'; text: string };

function tokenize(src: string, warnings: string[]): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '#') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      if (end === -1) {
        warnings.push('Kapanmamış tırnak işareti.');
        break;
      }
      toks.push({ k: 'label', text: src.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    if (c === '|') {
      toks.push({ k: 'bar' });
      i++;
      continue;
    }
    if (c === '(') {
      toks.push({ k: 'open' });
      i++;
      continue;
    }
    if (c === ')') {
      i++;
      const m = /^[xX*](\d+)/.exec(src.slice(i));
      if (m) {
        i += m[0].length;
        toks.push({ k: 'close', times: Math.max(1, Math.min(64, parseInt(m[1], 10))) });
      } else {
        toks.push({ k: 'close', times: 2 });
      }
      continue;
    }
    let j = i;
    while (j < src.length && !/[\s|()"]/.test(src[j])) j++;
    const word = src.slice(i, j);
    i = j;
    const dm = /^([whqest])(\.|3)?$/.exec(word);
    if (dm) {
      toks.push({ k: 'dur', base: DUR[dm[1]], dots: dm[2] === '.' ? 1 : 0, tuplet: dm[2] === '3' ? 3 : undefined });
    } else if (word === 'r' || word === '-') {
      toks.push({ k: 'rest' });
    } else if (word === '_') {
      toks.push({ k: 'tie' });
    } else {
      toks.push({ k: 'event', text: word });
    }
  }
  return toks;
}

const strIdx = (tuning: number[], s: number) => tuning.length - s;

interface ParsedEventInfo {
  notes: TabNote[];
  pm: boolean;
  accent: boolean;
  letRing: boolean;
  powerRoot?: number;
}

function parseEventWord(word: string, tuning: number[], warnings: string[]): ParsedEventInfo | null {
  const info: ParsedEventInfo = { notes: [], pm: false, accent: false, letRing: false };
  for (const part of word.split('+')) {
    const m = /^([PQpq])?(\d):(x|X|\d{1,2})(.*)$/.exec(part);
    if (!m) {
      warnings.push(`Anlaşılmayan ifade: "${part}"`);
      continue;
    }
    const macro = m[1]?.toUpperCase();
    const str = parseInt(m[2], 10);
    if (str < 1 || str > tuning.length) {
      warnings.push(`Geçersiz tel numarası: ${str}`);
      continue;
    }
    const dead = m[3].toLowerCase() === 'x';
    const fret = dead ? 0 : parseInt(m[3], 10);
    const mods = m[4];
    const flags: Partial<TabNote> = {};
    for (let k = 0; k < mods.length; k++) {
      const ch = mods[k];
      switch (ch) {
        case 'm':
          info.pm = true;
          break;
        case '>':
          info.accent = true;
          break;
        case '!':
          info.letRing = true;
          break;
        case 'h':
          flags.hammer = true;
          break;
        case 'p':
          flags.pull = true;
          break;
        case '/':
          flags.slide = true;
          break;
        case '~':
          flags.vibrato = true;
          break;
        case '*':
          flags.harmonic = true;
          break;
        case 'b': {
          const d = /^\d/.exec(mods.slice(k + 1));
          flags.bend = d ? parseInt(d[0], 10) : 2;
          if (d) k++;
          break;
        }
        default:
          warnings.push(`Bilinmeyen ek "${ch}" (${part})`);
      }
    }

    if (macro) {
      if (dead) {
        warnings.push(`Power chord ölü nota olamaz: ${part}`);
        continue;
      }
      const minString = macro === 'Q' ? 3 : 2;
      if (str < minString) {
        warnings.push(`${part}: kök için daha kalın bir tel seçin.`);
        continue;
      }
      const rootMidi = tuning[strIdx(tuning, str)] + fret;
      info.notes.push({ string: str, fret, ...flags });
      const fifthOpen = tuning[strIdx(tuning, str - 1)];
      const fifthFret = rootMidi + 7 - fifthOpen;
      if (fifthFret >= 0) info.notes.push({ string: str - 1, fret: fifthFret, ...flags });
      if (macro === 'Q') {
        const octOpen = tuning[strIdx(tuning, str - 2)];
        const octFret = rootMidi + 12 - octOpen;
        if (octFret >= 0) info.notes.push({ string: str - 2, fret: octFret, ...flags });
      }
      info.powerRoot = rootMidi;
    } else {
      info.notes.push({ string: str, fret, ...(dead ? { dead: true } : {}), ...flags });
    }
  }
  // Aynı telde iki nota olamaz: sonuncusu kazanır
  const byString = new Map<number, TabNote>();
  for (const n of info.notes) byString.set(n.string, n);
  info.notes = [...byString.values()].sort((a, b) => b.string - a.string);
  return info.notes.length ? info : null;
}

export interface DslOptions {
  tuning: number[];
  timeSig: TimeSig;
}

export function parseDsl(src: string, opts: DslOptions): ParsedTab {
  const warnings: string[] = [];
  const toks = tokenize(src, warnings);
  type Item = { kind: 'event'; ev: TabEvent } | { kind: 'bar' };
  const items: Item[] = [];
  let cur = { base: 1, dots: 0, tuplet: undefined as number | undefined };
  let pendingLabel: string | undefined;
  let last: TabEvent | null = null;

  const durOf = () => cur.base * (cur.dots ? 1.5 : 1) * (cur.tuplet === 3 ? 2 / 3 : 1);
  const push = (ev: TabEvent) => {
    if (pendingLabel !== undefined) {
      ev.label = pendingLabel;
      pendingLabel = undefined;
    }
    items.push({ kind: 'event', ev });
    last = ev;
  };

  const run = (list: Tok[]) => {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      switch (t.k) {
        case 'open': {
          let depth = 1;
          let j = i + 1;
          for (; j < list.length; j++) {
            const tj = list[j];
            if (tj.k === 'open') depth++;
            else if (tj.k === 'close' && --depth === 0) break;
          }
          if (j >= list.length) warnings.push('Kapanmamış parantez.');
          const inner = list.slice(i + 1, j);
          const close = list[j];
          const times = close && close.k === 'close' ? close.times : 1;
          const saved = { ...cur };
          for (let k = 0; k < times; k++) {
            cur = { ...saved };
            run(inner);
          }
          i = j;
          break;
        }
        case 'close':
          warnings.push('Fazladan kapanış parantezi.');
          break;
        case 'dur':
          cur = { base: t.base, dots: t.dots, tuplet: t.tuplet };
          break;
        case 'bar':
          items.push({ kind: 'bar' });
          break;
        case 'label':
          pendingLabel = t.text;
          break;
        case 'rest':
          push({ dur: durOf(), base: cur.base, dots: cur.dots, tuplet: cur.tuplet, notes: [] });
          break;
        case 'tie': {
          const prev: TabEvent | null = last;
          if (!prev || prev.notes.length === 0) {
            push({ dur: durOf(), base: cur.base, dots: cur.dots, tuplet: cur.tuplet, notes: [] });
          } else {
            push({
              dur: durOf(),
              base: cur.base,
              dots: cur.dots,
              tuplet: cur.tuplet,
              tie: true,
              pm: prev.pm,
              notes: prev.notes.map((n) => ({ string: n.string, fret: n.fret, dead: n.dead })),
            });
          }
          break;
        }
        case 'event': {
          const info = parseEventWord(t.text, opts.tuning, warnings);
          if (!info) break;
          push({
            dur: durOf(),
            base: cur.base,
            dots: cur.dots,
            tuplet: cur.tuplet,
            notes: info.notes,
            ...(info.pm ? { pm: true } : {}),
            ...(info.accent ? { accent: true } : {}),
            ...(info.letRing ? { letRing: true } : {}),
            ...(info.powerRoot !== undefined ? { powerRoot: info.powerRoot } : {}),
          });
          break;
        }
      }
    }
  };
  run(toks);

  const beatsPer = measureBeats(opts.timeSig);
  const measures: TabMeasure[] = [];
  let curM: TabEvent[] = [];
  const hasBars = items.some((it) => it.kind === 'bar');
  if (hasBars) {
    for (const it of items) {
      if (it.kind === 'bar') {
        if (curM.length) measures.push({ events: curM });
        curM = [];
      } else curM.push(it.ev);
    }
    if (curM.length) measures.push({ events: curM });
    measures.forEach((m, i) => {
      const d = eventsDuration(m.events);
      if (Math.abs(d - beatsPer) > 1e-6) warnings.push(`${i + 1}. ölçü ${+d.toFixed(3)} vuruş (beklenen ${beatsPer}).`);
    });
  } else {
    let acc = 0;
    for (const it of items) {
      if (it.kind !== 'event') continue;
      curM.push(it.ev);
      acc += it.ev.dur;
      if (acc >= beatsPer - 1e-6) {
        if (acc > beatsPer + 1e-6) warnings.push(`${measures.length + 1}. ölçü taşıyor (${+acc.toFixed(3)} vuruş).`);
        measures.push({ events: curM });
        curM = [];
        acc = 0;
      }
    }
    if (curM.length) {
      measures.push({ events: curM });
      warnings.push(`Son ölçü eksik (${+acc.toFixed(3)} / ${beatsPer} vuruş).`);
    }
  }
  return { measures, warnings };
}
