// Tab sayfa düzeni: ölçüleri satırlara yerleştirir, her olayın x konumunu hesaplar.

import type { TabMeasure } from './types';

export interface LayoutOptions {
  width: number;
  /** Bir vuruşun (dörtlük) piksel genişliği */
  beatWidth: number;
  stringCount: number;
  stringGap: number;
  showRhythm: boolean;
  compact?: boolean;
}

export interface EventBox {
  m: number;
  e: number;
  /** Zaman diliminin başlangıcı */
  x: number;
  w: number;
  /** Nota rakamlarının merkezi */
  cx: number;
  beatInMeasure: number;
}

export interface MeasureBox {
  m: number;
  row: number;
  x: number;
  w: number;
  events: EventBox[];
}

export interface RowBox {
  index: number;
  y: number;
  staffTop: number;
  staffBottom: number;
  height: number;
  measures: number[];
  x0: number;
  x1: number;
}

export interface TabLayout {
  width: number;
  height: number;
  rows: RowBox[];
  measures: MeasureBox[];
  stringGap: number;
  stringCount: number;
  labelWidth: number;
}

export const TOP_PAD = 36;
const LEFT_PAD = 12;
const RIGHT_PAD = 8;
const MIN_EVENT = 22;

function eventWidth(dur: number, maxFretDigits: number, beatWidth: number) {
  return Math.max(MIN_EVENT + (maxFretDigits > 1 ? 5 : 0), dur * beatWidth);
}

export function layoutTab(measures: TabMeasure[], o: LayoutOptions): TabLayout {
  const labelWidth = o.compact ? 22 : 28;
  const usable = Math.max(200, o.width - labelWidth - 2);
  const staffH = (o.stringCount - 1) * o.stringGap;
  const rhythmH = o.showRhythm ? 30 : 6;
  const rowH = TOP_PAD + staffH + rhythmH + (o.compact ? 10 : 18);

  // Doğal genişlikler
  const natural = measures.map((m) => {
    const widths = m.events.map((ev) => {
      const digits = Math.max(1, ...ev.notes.map((n) => (n.dead ? 1 : String(n.fret).length + (n.harmonic ? 1 : 0))));
      return eventWidth(ev.dur, digits, o.beatWidth);
    });
    return { widths, total: LEFT_PAD + RIGHT_PAD + widths.reduce((a, b) => a + b, 0) };
  });

  // Satırlara paketle
  const rowsIdx: number[][] = [];
  let cur: number[] = [];
  let curW = 0;
  natural.forEach((n, i) => {
    if (cur.length && curW + n.total > usable) {
      rowsIdx.push(cur);
      cur = [];
      curW = 0;
    }
    cur.push(i);
    curW += n.total;
  });
  if (cur.length) rowsIdx.push(cur);

  const rows: RowBox[] = [];
  const boxes: MeasureBox[] = new Array(measures.length);
  rowsIdx.forEach((idxs, r) => {
    const sum = idxs.reduce((a, i) => a + natural[i].total, 0);
    const isLast = r === rowsIdx.length - 1;
    // Son satır çok boşsa germeyelim
    const scale = isLast && sum < usable * 0.72 ? 1 : usable / sum;
    const y = r * rowH;
    let x = labelWidth;
    idxs.forEach((mi) => {
      const n = natural[mi];
      const w = n.total * scale;
      const evScale = (w - LEFT_PAD - RIGHT_PAD) / (n.total - LEFT_PAD - RIGHT_PAD || 1);
      let ex = x + LEFT_PAD;
      let beat = 0;
      const events: EventBox[] = measures[mi].events.map((ev, ei) => {
        const ew = n.widths[ei] * evScale;
        const box: EventBox = { m: mi, e: ei, x: ex, w: ew, cx: ex + Math.min(ew / 2, 11), beatInMeasure: beat };
        ex += ew;
        beat += ev.dur;
        return box;
      });
      boxes[mi] = { m: mi, row: r, x, w, events };
      x += w;
    });
    rows.push({
      index: r,
      y,
      staffTop: y + TOP_PAD,
      staffBottom: y + TOP_PAD + staffH,
      height: rowH,
      measures: idxs,
      x0: labelWidth,
      x1: x,
    });
  });

  return {
    width: o.width,
    height: rows.length * rowH,
    rows,
    measures: boxes,
    stringGap: o.stringGap,
    stringCount: o.stringCount,
    labelWidth,
  };
}

/** Tel numarasının (1 = ince) satırdaki y konumu. */
export function stringY(row: RowBox, stringNum: number, gap: number) {
  return row.staffTop + (stringNum - 1) * gap;
}
