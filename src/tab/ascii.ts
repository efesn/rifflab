// İnternette yaygın olan ASCII tab biçimini (e|---0---| ...) ayrıştırır.
// ASCII tablarda ritim bilgisi yoktur; süreler ya eşit kabul edilir ya da karakter aralıklarından tahmin edilir.

import { measureBeats, splitDuration, type ParsedTab, type TabEvent, type TabMeasure, type TabNote, type TimeSig } from './types';

export interface AsciiOptions {
  timing: 'even' | 'spacing';
  /** Bir zaman biriminin vuruş karşılığı (0.5 = sekizlik) */
  unit: number;
  timeSig: TimeSig;
}

interface TabLineInfo {
  content: string;
  start: number;
  label: string;
}

const VALID = /[-0-9xXhpbrs/\\~|()<>*.=^ v]/g;

function tabLine(line: string): TabLineInfo | null {
  const m = /^(\s*([A-Ga-g][#b]?\d?)?\s*)([|:]?)/.exec(line);
  if (!m) return null;
  const start = m[0].length;
  const content = line.slice(start).replace(/\s+$/, '');
  if (content.length < 4) return null;
  const invalid = content.replace(VALID, '').length;
  if (invalid > content.length * 0.1) return null;
  const dashes = (content.match(/-/g) || []).length;
  if (dashes < 3 || dashes < content.length * 0.3) return null;
  return { content, start, label: m[2] ?? '' };
}

interface RawEvent {
  col: number;
  notes: TabNote[];
  pm: boolean;
}

function scanSystem(lines: TabLineInfo[], pmLine: string | null, warnings: string[]) {
  const L = Math.max(...lines.map((l) => l.content.length));
  const rows = lines.map((l) => l.content.padEnd(L, '-'));
  const consumed = rows.map(() => new Uint8Array(L + 4));
  const pending: (undefined | 'h' | 'p' | 's')[] = new Array(rows.length).fill(undefined);
  const pmCols = new Set<number>();

  if (pmLine) {
    const origin = lines[0].start;
    const re = /P\.?\s?M\.?/gi;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(pmLine))) {
      let j = mm.index + mm[0].length;
      while (j < pmLine.length && /[-_.|=~]/.test(pmLine[j])) j++;
      for (let c = mm.index; c < j; c++) pmCols.add(c - origin);
    }
  }

  const events: RawEvent[] = [];
  const bars: number[] = [];
  for (let c = 0; c < L; c++) {
    let barCount = 0;
    for (const r of rows) if (r[c] === '|') barCount++;
    if (barCount >= Math.min(4, rows.length)) {
      bars.push(c);
      pending.fill(undefined);
      continue;
    }
    const notes: TabNote[] = [];
    rows.forEach((row, s) => {
      if (consumed[s][c]) return;
      const ch = row[c];
      const stringNum = s + 1;
      if (ch >= '0' && ch <= '9') {
        let j = c;
        let num = '';
        while (j < L && num.length < 2 && row[j] >= '0' && row[j] <= '9') num += row[j++];
        if (num.length === 2 && parseInt(num, 10) > 24) {
          num = num[0];
          j = c + 1;
        }
        for (let k = c + 1; k < j; k++) consumed[s][k] = 1;
        const note: TabNote = { string: stringNum, fret: parseInt(num, 10) };
        const tech = pending[s];
        if (tech === 'h') note.hammer = true;
        else if (tech === 'p') note.pull = true;
        else if (tech === 's') note.slide = true;
        pending[s] = undefined;
        let k = j;
        if (row[k] === 'b') {
          consumed[s][k] = 1;
          k++;
          let t = '';
          while (k < L && t.length < 2 && row[k] >= '0' && row[k] <= '9') {
            t += row[k];
            consumed[s][k++] = 1;
          }
          const target = t ? parseInt(t, 10) : NaN;
          note.bend = Number.isFinite(target) && target > note.fret ? Math.min(4, target - note.fret) : 2;
          if (row[k] === 'r') {
            consumed[s][k++] = 1;
            while (k < L && row[k] >= '0' && row[k] <= '9') consumed[s][k++] = 1;
          }
        }
        if (row[k] === '~' || row[k] === 'v') note.vibrato = true;
        if (c > 0 && row[c - 1] === '<') note.harmonic = true;
        notes.push(note);
      } else if (ch === 'x' || ch === 'X') {
        notes.push({ string: stringNum, fret: 0, dead: true });
      } else if (ch === 'h' || ch === 'p') {
        pending[s] = ch;
      } else if (ch === '/' || ch === '\\' || ch === 's') {
        pending[s] = 's';
      } else if (ch === '-') {
        pending[s] = undefined;
      }
    });
    if (notes.length) events.push({ col: c, notes, pm: pmCols.has(c) });
  }

  // Sağa hizalanmış iki haneli perdeleri birleştir (ör. "12" ile aynı akordaki "-5")
  for (let i = 0; i + 1 < events.length; i++) {
    const a = events[i];
    const b = events[i + 1];
    if (b.col !== a.col + 1) continue;
    const twoDigit = a.notes.some((n) => n.fret >= 10);
    const overlap = b.notes.some((n) => a.notes.some((x) => x.string === n.string));
    if (twoDigit && !overlap) {
      a.notes.push(...b.notes);
      a.pm = a.pm || b.pm;
      events.splice(i + 1, 1);
      i--;
    }
  }
  if (!events.length) warnings.push('Bir tab bloğunda nota bulunamadı.');
  return { events, bars, length: L };
}

export function parseAsciiTab(text: string, opts: AsciiOptions): ParsedTab & { systems: number } {
  const warnings: string[] = [];
  const lines = text.replace(/\t/g, '    ').split(/\r?\n/);
  const infos = lines.map(tabLine);

  type Group = { events: RawEvent[]; bars: number[]; length: number };
  const groups: Group[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!infos[i]) {
      i++;
      continue;
    }
    let j = i;
    while (j < lines.length && infos[j]) j++;
    const run = infos.slice(i, j) as TabLineInfo[];
    if (run.length < 6) {
      if (run.length >= 4) warnings.push(`${run.length} telli bir blok atlandı (6 telli tab bekleniyor).`);
    } else {
      if (run.length % 6 !== 0) warnings.push(`${run.length} satırlık blok: ilk 6 satırın katları kullanıldı.`);
      for (let k = 0; k + 6 <= run.length; k += 6) {
        const prev = i + k - 1;
        const pmLine = k === 0 && prev >= 0 && /P\.?\s?M/i.test(lines[prev]) ? lines[prev] : null;
        groups.push(scanSystem(run.slice(k, k + 6), pmLine, warnings));
      }
    }
    i = j;
  }

  if (!groups.length) {
    return { measures: [], warnings: ['Tab satırı bulunamadı. Her telin ayrı satırda olduğu (e|---) biçimde yapıştırın.'], systems: 0 };
  }

  // Aralık biriminin tahmini: ölçü içindeki ardışık notalar arasındaki en yaygın mesafe
  let unitCols = 2;
  if (opts.timing === 'spacing') {
    const counts = new Map<number, number>();
    for (const g of groups) {
      for (let k = 0; k + 1 < g.events.length; k++) {
        const a = g.events[k].col;
        const b = g.events[k + 1].col;
        if (g.bars.some((bc) => bc > a && bc < b)) continue;
        const gap = b - a;
        counts.set(gap, (counts.get(gap) ?? 0) + 1);
      }
    }
    let best = 0;
    for (const [gap, n] of counts) {
      if (n > best || (n === best && gap < unitCols)) {
        best = n;
        unitCols = gap;
      }
    }
  }

  const beatsPer = measureBeats(opts.timeSig);
  const measures: TabMeasure[] = [];
  const quant = (beats: number) => Math.min(4, Math.max(0.25, Math.round(beats / 0.25) * 0.25));

  for (const g of groups) {
    const bounds = [-1, ...g.bars, g.length];
    const hasBars = g.bars.length > 0;
    const segments: RawEvent[][] = [];
    if (hasBars) {
      for (let b = 0; b + 1 < bounds.length; b++) {
        const seg = g.events.filter((e) => e.col > bounds[b] && e.col < bounds[b + 1]);
        if (seg.length) segments.push(seg);
      }
    } else segments.push(g.events);

    for (const seg of segments) {
      const evs: TabEvent[] = seg.map((e, k) => {
        let dur = opts.unit;
        if (opts.timing === 'spacing') {
          const nextCol = k + 1 < seg.length ? seg[k + 1].col : (g.bars.find((bc) => bc > e.col) ?? e.col + unitCols);
          dur = quant(((nextCol - e.col) / unitCols) * opts.unit);
        }
        const sd = splitDuration(dur);
        return { dur, base: sd.base, dots: sd.dots, tuplet: sd.tuplet, notes: e.notes.sort((a, b) => b.string - a.string), ...(e.pm ? { pm: true } : {}) };
      });
      if (hasBars && opts.timing === 'spacing' && evs.length) {
        // Ölçüyü tamamlamak için son notayı uzat (ASCII tabda son notanın süresi belirsizdir)
        const total = evs.reduce((a, e) => a + e.dur, 0);
        const missing = beatsPer - total;
        if (missing > 1e-6 && missing <= 3) {
          const last = evs[evs.length - 1];
          last.dur += missing;
          Object.assign(last, splitDuration(last.dur));
        }
      }
      if (hasBars) measures.push({ events: evs });
      else {
        // Ölçü çizgisi yoksa olayları ölçü uzunluğuna göre böl
        let cur: TabEvent[] = [];
        let acc = 0;
        for (const ev of evs) {
          cur.push(ev);
          acc += ev.dur;
          if (acc >= beatsPer - 1e-6) {
            measures.push({ events: cur });
            cur = [];
            acc = 0;
          }
        }
        if (cur.length) measures.push({ events: cur });
      }
    }
  }
  return { measures, warnings, systems: groups.length };
}
