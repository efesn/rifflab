import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { layoutTab, stringY, type EventBox, type RowBox, type TabLayout } from './layout';
import type { ParsedTab, TabEvent, TimeSig } from './types';
import { pcName, type NoteNaming } from '../lib/music';

export interface ActiveRef {
  m: number;
  e: number;
}

export interface TabViewProps {
  tab: ParsedTab;
  tuning: number[];
  naming: NoteNaming;
  timeSig: TimeSig;
  beatWidth?: number;
  showRhythm?: boolean;
  compact?: boolean;
  active?: ActiveRef | null;
  selection?: { from: number; to: number } | null;
  onMeasureClick?: (measure: number, shift: boolean) => void;
  measureOffset?: number;
}

const GAP = 13;

export function TabView(props: TabViewProps) {
  const { tab, tuning, naming, timeSig, beatWidth = 52, showRhythm = true, compact = false, active, selection, onMeasureClick, measureOffset = 0 } = props;
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(
    () => (width > 0 ? layoutTab(tab.measures, { width, beatWidth, stringCount: tuning.length, stringGap: GAP, showRhythm, compact }) : null),
    [tab, width, beatWidth, tuning.length, showRhythm, compact],
  );

  return (
    <div className="tabview" ref={wrap}>
      {layout && (
        <svg width={layout.width} height={layout.height} className="tabview-svg" role="img" aria-label="Tab gösterimi">
          <TabStatic tab={tab} layout={layout} tuning={tuning} naming={naming} showRhythm={showRhythm} timeSig={timeSig} measureOffset={measureOffset} />
          <TabOverlay tab={tab} layout={layout} active={active ?? null} selection={selection ?? null} onMeasureClick={onMeasureClick} />
        </svg>
      )}
      {!tab.measures.length && <div className="tabview-empty">Gösterilecek nota yok.</div>}
    </div>
  );
}

function fretText(n: { fret: number; dead?: boolean; harmonic?: boolean }, tie?: boolean) {
  if (n.dead) return 'x';
  if (n.harmonic) return `<${n.fret}>`;
  return tie ? `(${n.fret})` : String(n.fret);
}

function textWidth(s: string) {
  return s.length * 7.2 + 3;
}

/** Satırdaki olayları sırayla (ölçü sınırlarını aşarak) dolaşmak için düz liste. */
function rowEvents(layout: TabLayout, row: RowBox, tab: ParsedTab) {
  const out: { box: EventBox; ev: TabEvent }[] = [];
  for (const mi of row.measures) {
    const mb = layout.measures[mi];
    mb.events.forEach((box, ei) => out.push({ box, ev: tab.measures[mi].events[ei] }));
  }
  return out;
}

const TabStatic = memo(function TabStatic({
  tab,
  layout,
  tuning,
  naming,
  showRhythm,
  timeSig,
  measureOffset,
}: {
  tab: ParsedTab;
  layout: TabLayout;
  tuning: number[];
  naming: NoteNaming;
  showRhythm: boolean;
  timeSig: TimeSig;
  measureOffset: number;
}) {
  const sc = layout.stringCount;
  return (
    <g>
      {layout.rows.map((row) => {
        const evs = rowEvents(layout, row, tab);
        const els: ReactNode[] = [];

        // Tel adları ve çizgiler
        for (let s = 1; s <= sc; s++) {
          const y = stringY(row, s, GAP);
          els.push(
            <text key={`l${s}`} x={layout.labelWidth - 7} y={y + 4} className="tab-strlabel" textAnchor="end">
              {pcName(tuning[sc - s], naming)}
            </text>,
            <line key={`s${s}`} x1={row.x0} x2={row.x1} y1={y} y2={y} className="tab-line" />,
          );
        }

        // Ölçü çizgileri ve numaraları
        row.measures.forEach((mi, k) => {
          const mb = layout.measures[mi];
          if (k === 0) els.push(<line key={`b0-${mi}`} x1={mb.x} x2={mb.x} y1={row.staffTop} y2={row.staffBottom} className="tab-bar" />);
          els.push(
            <line key={`b-${mi}`} x1={mb.x + mb.w} x2={mb.x + mb.w} y1={row.staffTop} y2={row.staffBottom} className="tab-bar" />,
            <text key={`n-${mi}`} x={mb.x + 3} y={row.staffTop - 4} className="tab-mnum">
              {mi + 1 + measureOffset}
            </text>,
          );
        });

        // Palm mute ve let ring parantezleri
        const runs = (pred: (ev: TabEvent) => boolean, label: string, cls: string) => {
          let i = 0;
          while (i < evs.length) {
            if (!pred(evs[i].ev)) {
              i++;
              continue;
            }
            let j = i;
            while (j + 1 < evs.length && pred(evs[j + 1].ev)) j++;
            const x1 = evs[i].box.cx - 7;
            const last = evs[j].box;
            const x2 = Math.max(x1 + 22, last.x + last.w - 5);
            const y = row.staffTop - 13;
            els.push(
              <g key={`${label}${i}`} className={cls}>
                <text x={x1} y={y + 3}>
                  {label}
                </text>
                {x2 - x1 > 30 && (
                  <>
                    <line x1={x1 + 25} x2={x2} y1={y} y2={y} strokeDasharray="3 3" />
                    <line x1={x2} x2={x2} y1={y - 3} y2={y + 3} />
                  </>
                )}
              </g>,
            );
            i = j + 1;
          }
        };
        runs((ev) => !!ev.pm && ev.notes.length > 0, 'P.M.', 'tab-pm');
        runs((ev) => !!ev.letRing, 'L.R.', 'tab-lr');

        // Notalar, teknikler, akor adları
        let lastLabel = '';
        evs.forEach(({ box, ev }, idx) => {
          const key = `${box.m}-${box.e}`;
          const label = ev.label ?? (ev.powerRoot !== undefined ? `${pcName(ev.powerRoot, naming)}5` : '');
          if (label && (label !== lastLabel || ev.label)) {
            els.push(
              <text key={`c${key}`} x={box.cx} y={row.staffTop - 24} className="tab-chord" textAnchor="middle">
                {label}
              </text>,
            );
          }
          if (label) lastLabel = label;
          if (ev.accent) {
            els.push(
              <text key={`a${key}`} x={box.cx} y={row.staffTop - 3} className="tab-accent" textAnchor="middle">
                &gt;
              </text>,
            );
          }
          for (const n of ev.notes) {
            const y = stringY(row, n.string, GAP);
            const t = fretText(n, ev.tie);
            const w = textWidth(t);
            els.push(
              <g key={`f${key}-${n.string}`} className={ev.tie ? 'tab-note tie' : 'tab-note'}>
                <rect x={box.cx - w / 2} y={y - 7} width={w} height={14} className="tab-note-bg" />
                <text x={box.cx} y={y + 4} textAnchor="middle">
                  {t}
                </text>
              </g>,
            );
            if (n.hammer || n.pull || n.slide) {
              // aynı teldeki önceki notayı bul
              let prev: { box: EventBox; fret: number } | null = null;
              for (let k = idx - 1; k >= 0; k--) {
                const pn = evs[k].ev.notes.find((x) => x.string === n.string);
                if (pn) {
                  prev = { box: evs[k].box, fret: pn.fret };
                  break;
                }
                if (evs[k].ev.notes.length) break;
              }
              const x1 = prev ? prev.box.cx + 6 : box.cx - 16;
              const x2 = box.cx - 6;
              if (n.slide) {
                const up = !prev || n.fret >= prev.fret;
                els.push(<line key={`sl${key}-${n.string}`} x1={x1} x2={x2} y1={y + (up ? 4 : -4)} y2={y + (up ? -4 : 4)} className="tab-tech-line" />);
              } else {
                const mid = (x1 + x2) / 2;
                els.push(
                  <path key={`hp${key}-${n.string}`} d={`M${x1},${y - 7} Q${mid},${y - 15} ${x2},${y - 7}`} className="tab-tech-line" fill="none" />,
                  <text key={`hpt${key}-${n.string}`} x={mid} y={y - 14} className="tab-tech" textAnchor="middle">
                    {n.hammer ? 'H' : 'P'}
                  </text>,
                );
              }
            }
            if (n.bend) {
              const bx = box.cx + w / 2 + 1;
              els.push(
                <path key={`bd${key}-${n.string}`} d={`M${bx},${y} Q${bx + 9},${y} ${bx + 9},${y - 15}`} className="tab-tech-line" fill="none" />,
                <path key={`ba${key}-${n.string}`} d={`M${bx + 6},${y - 12} L${bx + 9},${y - 17} L${bx + 12},${y - 12}`} className="tab-tech-line" fill="none" />,
                <text key={`bt${key}-${n.string}`} x={bx + 9} y={y - 20} className="tab-tech" textAnchor="middle">
                  {n.bend === 1 ? '½' : n.bend === 2 ? 'tam' : n.bend === 3 ? '1½' : `${n.bend / 2}`}
                </text>,
              );
            }
            if (n.vibrato) {
              const vx = box.cx - 6;
              const vy = row.staffTop - 13;
              els.push(<path key={`v${key}-${n.string}`} d={`M${vx},${vy} q2,-3 4,0 t4,0 t4,0 t4,0`} className="tab-tech-line" fill="none" />);
            }
          }
        });

        if (showRhythm) els.push(<Rhythm key="rh" row={row} evs={evs} timeSig={timeSig} />);

        return <g key={row.index}>{els}</g>;
      })}
    </g>
  );
});

function RestGlyph({ x, y, base }: { x: number; y: number; base: number }) {
  if (base >= 2) return <rect x={x - 4} y={base >= 4 ? y - 3 : y - 1} width={8} height={3} className="tab-rest-fill" />;
  if (base >= 1)
    return <path d={`M${x - 1},${y - 8} l3,4 l-3,3 l3,4 m-3,0 q-3,0 -1,3`} className="tab-rest" fill="none" />;
  const flags = base >= 0.5 ? 1 : base >= 0.25 ? 2 : 3;
  const parts: ReactNode[] = [];
  for (let f = 0; f < flags; f++) {
    const fy = y - 6 + f * 4;
    parts.push(<circle key={`c${f}`} cx={x - 2} cy={fy} r={1.6} className="tab-rest-fill" />, <path key={`p${f}`} d={`M${x - 1},${fy + 0.5} L${x + 2},${fy - 1.5}`} className="tab-rest" />);
  }
  parts.push(<path key="st" d={`M${x + 2},${y - 7.5} L${x - 1},${y + 5}`} className="tab-rest" />);
  return <g>{parts}</g>;
}

function Rhythm({ row, evs, timeSig }: { row: RowBox; evs: { box: EventBox; ev: TabEvent }[]; timeSig: TimeSig }) {
  const y0 = row.staffBottom + 7;
  const y1 = y0 + 18;
  const groupLen = timeSig[1] === 8 ? 1.5 : 1;
  const els: ReactNode[] = [];

  // Kiriş grupları: aynı vuruş içindeki sekizlik ve daha kısa notalar
  type G = { box: EventBox; ev: TabEvent }[];
  const groups: G[] = [];
  let cur: G = [];
  let curKey = '';
  for (const item of evs) {
    const { box, ev } = item;
    const isRest = ev.notes.length === 0;
    const beamable = !isRest && ev.base <= 0.5;
    const key = `${box.m}:${Math.floor((box.beatInMeasure + 1e-6) / groupLen)}`;
    if (!beamable || key !== curKey) {
      if (cur.length) groups.push(cur);
      cur = [];
      curKey = key;
    }
    if (beamable) cur.push(item);
  }
  if (cur.length) groups.push(cur);
  const beamed = new Set<TabEvent>();
  for (const g of groups) if (g.length > 1) g.forEach((it) => beamed.add(it.ev));

  for (const { box, ev } of evs) {
    const x = box.cx;
    const k = `${box.m}-${box.e}`;
    if (ev.notes.length === 0) {
      els.push(<RestGlyph key={`r${k}`} x={x} y={y0 + 10} base={ev.base} />);
      continue;
    }
    if (ev.base >= 4) {
      els.push(<ellipse key={`w${k}`} cx={x} cy={y0 + 12} rx={4} ry={3} className="tab-stem-hollow" />);
    } else {
      els.push(<line key={`st${k}`} x1={x} x2={x} y1={y0} y2={y1} className="tab-stem" />);
      if (ev.base >= 2) els.push(<ellipse key={`h${k}`} cx={x} cy={y1 + 2} rx={3.2} ry={2.4} className="tab-stem-hollow" />);
      if (ev.base <= 0.5 && !beamed.has(ev)) {
        const flags = ev.base >= 0.5 ? 1 : ev.base >= 0.25 ? 2 : 3;
        for (let f = 0; f < flags; f++) els.push(<path key={`fl${k}-${f}`} d={`M${x},${y1 - f * 5} l6,-6`} className="tab-stem" />);
      }
    }
    if (ev.dots) els.push(<circle key={`d${k}`} cx={x + 5} cy={y1 - 2} r={1.6} className="tab-rest-fill" />);
  }

  for (const g of groups) {
    if (g.length < 2) continue;
    const first = g[0].box.cx;
    const last = g[g.length - 1].box.cx;
    els.push(<rect key={`bm${g[0].box.m}-${g[0].box.e}`} x={first} y={y1 - 3} width={last - first + 1} height={3} className="tab-beam" />);
    for (const level of [0.25, 0.125]) {
      const ly = y1 - 3 - (level === 0.25 ? 5 : 10);
      g.forEach((it, i) => {
        if (it.ev.base > level) return;
        const next = g[i + 1];
        const prev = g[i - 1];
        if (next && next.ev.base <= level) {
          els.push(<rect key={`b2${level}-${it.box.m}-${it.box.e}`} x={it.box.cx} y={ly} width={next.box.cx - it.box.cx + 1} height={3} className="tab-beam" />);
        } else if (!(prev && prev.ev.base <= level)) {
          const dir = next ? 1 : -1;
          const sx = dir > 0 ? it.box.cx : it.box.cx - 7;
          els.push(<rect key={`bs${level}-${it.box.m}-${it.box.e}`} x={sx} y={ly} width={7} height={3} className="tab-beam" />);
        }
      });
    }
    if (g.some((it) => it.ev.tuplet === 3)) {
      els.push(
        <text key={`tu${g[0].box.m}-${g[0].box.e}`} x={(first + last) / 2} y={y1 + 11} className="tab-tuplet" textAnchor="middle">
          3
        </text>,
      );
    }
  }
  return <g>{els}</g>;
}

function TabOverlay({
  tab,
  layout,
  active,
  selection,
  onMeasureClick,
}: {
  tab: ParsedTab;
  layout: TabLayout;
  active: ActiveRef | null;
  selection: { from: number; to: number } | null;
  onMeasureClick?: (m: number, shift: boolean) => void;
}) {
  const activeRect = useRef<SVGRectElement>(null);
  const activeRow = active ? layout.measures[active.m]?.row : -1;

  useEffect(() => {
    if (activeRow === undefined || activeRow < 0) return;
    activeRect.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeRow]);

  const els: ReactNode[] = [];
  if (selection) {
    const lo = Math.min(selection.from, selection.to);
    const hi = Math.max(selection.from, selection.to);
    for (let m = lo; m <= hi; m++) {
      const mb = layout.measures[m];
      if (!mb) continue;
      const row = layout.rows[mb.row];
      els.push(<rect key={`sel${m}`} x={mb.x} y={row.staffTop - 30} width={mb.w} height={row.staffBottom - row.staffTop + 36} className="tab-selection" />);
    }
  }
  if (active) {
    const mb = layout.measures[active.m];
    const box = mb?.events[active.e];
    const ev = tab.measures[active.m]?.events[active.e];
    if (mb && box && ev) {
      const row = layout.rows[mb.row];
      els.push(
        <rect key="act" ref={activeRect} x={box.x + 1} y={row.staffTop - 8} width={Math.max(14, box.w - 2)} height={row.staffBottom - row.staffTop + 16} rx={4} className="tab-active" />,
      );
      for (const n of ev.notes) {
        const y = stringY(row, n.string, GAP);
        const t = fretText(n, ev.tie);
        const w = textWidth(t);
        els.push(
          <g key={`an${n.string}`} className="tab-note active">
            <rect x={box.cx - w / 2} y={y - 7} width={w} height={14} rx={3} className="tab-note-bg-active" />
            <text x={box.cx} y={y + 4} textAnchor="middle">
              {t}
            </text>
          </g>,
        );
      }
    }
  }
  if (onMeasureClick) {
    layout.measures.forEach((mb) => {
      const row = layout.rows[mb.row];
      els.push(
        <rect
          key={`hit${mb.m}`}
          x={mb.x}
          y={row.staffTop - 30}
          width={mb.w}
          height={row.staffBottom - row.staffTop + 36}
          className="tab-hit"
          onClick={(e) => onMeasureClick(mb.m, e.shiftKey)}
        >
          <title>Ölçü {mb.m + 1} — tıkla: buradan çal, Shift+tık: döngü aralığı seç</title>
        </rect>,
      );
    });
  }
  return <g>{els}</g>;
}
