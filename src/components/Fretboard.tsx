import { memo, type ReactNode } from 'react';
import { pcName, type NoteNaming } from '../lib/music';

export type MarkKind = 'root' | 'note' | 'active' | 'ghost' | 'correct' | 'wrong' | 'target';

export interface FretMark {
  string: number;
  fret: number;
  label?: string;
  kind?: MarkKind;
}

export interface FretboardProps {
  tuning: number[];
  frets?: number;
  startFret?: number;
  marks?: FretMark[];
  showAllNotes?: boolean;
  naming?: NoteNaming;
  leftHanded?: boolean;
  onFretClick?: (string: number, fret: number) => void;
  dimFrets?: [number, number] | null;
  compact?: boolean;
}

const W = 1000;
const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];

export const Fretboard = memo(function Fretboard({
  tuning,
  frets = 15,
  startFret = 0,
  marks = [],
  showAllNotes = false,
  naming = 'letter',
  leftHanded = false,
  onFretClick,
  dimFrets = null,
  compact = false,
}: FretboardProps) {
  const sc = tuning.length;
  const gap = compact ? 22 : 26;
  const top = 18;
  const H = top + (sc - 1) * gap + (compact ? 30 : 36);
  const endFret = startFret + frets;
  const labelW = 26;
  const openW = startFret === 0 ? 44 : 10;
  const x0 = labelW + openW;
  const x1 = W - 12;
  const pos = (n: number) => 1 - Math.pow(2, -n / 12);
  const p0 = pos(startFret);
  const p1 = pos(endFret);
  const fx = (n: number) => x0 + ((pos(n) - p0) / (p1 - p0)) * (x1 - x0);
  const X = (x: number) => (leftHanded ? W - x : x);
  const centerOf = (f: number) => (f === 0 ? labelW + openW / 2 - 2 : (fx(f - 1) + fx(f)) / 2);
  const sy = (s: number) => top + (s - 1) * gap;

  const els: ReactNode[] = [];

  // Klavye zemini
  els.push(<rect key="board" x={Math.min(X(x0), X(x1))} y={top - 10} width={x1 - x0} height={(sc - 1) * gap + 20} rx={4} className="fb-board" />);

  // Kakmalar (inlay)
  for (let f = Math.max(1, startFret + 1); f <= endFret; f++) {
    const cx = X(centerOf(f));
    const midY = top + ((sc - 1) * gap) / 2;
    if (INLAYS.includes(f)) els.push(<circle key={`in${f}`} cx={cx} cy={midY} r={6} className="fb-inlay" />);
    if (f === 12 || f === 24) {
      els.push(<circle key={`in${f}a`} cx={cx} cy={midY - gap * 1.5} r={6} className="fb-inlay" />);
      els.push(<circle key={`in${f}b`} cx={cx} cy={midY + gap * 1.5} r={6} className="fb-inlay" />);
    }
  }

  if (dimFrets) {
    const [a, b] = dimFrets;
    const xa = a <= startFret ? labelW : a === 0 ? labelW : fx(a - 1);
    const xb = fx(Math.min(endFret, b));
    els.push(<rect key="dimL" x={Math.min(X(labelW), X(xa))} y={top - 12} width={Math.max(0, xa - labelW)} height={(sc - 1) * gap + 24} className="fb-dim" />);
    els.push(<rect key="dimR" x={Math.min(X(xb), X(x1))} y={top - 12} width={Math.max(0, x1 - xb)} height={(sc - 1) * gap + 24} className="fb-dim" />);
  }

  // Perdeler
  for (let f = startFret; f <= endFret; f++) {
    const x = X(fx(f));
    const isNut = f === 0;
    els.push(<line key={`fr${f}`} x1={x} x2={x} y1={top - 10} y2={top + (sc - 1) * gap + 10} className={isNut ? 'fb-nut' : 'fb-fret'} />);
  }
  // Perde numaraları
  for (let f = Math.max(1, startFret + 1); f <= endFret; f++) {
    els.push(
      <text key={`fn${f}`} x={X(centerOf(f))} y={top + (sc - 1) * gap + (compact ? 24 : 28)} className={`fb-fnum${INLAYS.includes(f) || f === 12 ? ' strong' : ''}`} textAnchor="middle">
        {f}
      </text>,
    );
  }

  // Teller
  for (let s = 1; s <= sc; s++) {
    const y = sy(s);
    const thick = 0.9 + ((s - 1) / (sc - 1)) * 1.9;
    els.push(<line key={`st${s}`} x1={X(labelW + 2)} x2={X(x1)} y1={y} y2={y} className="fb-string" strokeWidth={thick} />);
    els.push(
      <text key={`sl${s}`} x={leftHanded ? W - 4 : 4} y={y + 4} className="fb-slabel" textAnchor={leftHanded ? 'end' : 'start'}>
        {pcName(tuning[sc - s], naming)}
      </text>,
    );
  }

  // Tüm nota adları (soluk)
  if (showAllNotes) {
    for (let s = 1; s <= sc; s++) {
      for (let f = startFret; f <= endFret; f++) {
        if (marks.some((m) => m.string === s && m.fret === f)) continue;
        els.push(
          <text key={`an${s}-${f}`} x={X(centerOf(f))} y={sy(s) + 4} className="fb-allnote" textAnchor="middle">
            {pcName(tuning[sc - s] + f, naming)}
          </text>,
        );
      }
    }
  }

  // İşaretler
  marks.forEach((m, i) => {
    if (m.fret < startFret || m.fret > endFret || m.string < 1 || m.string > sc) return;
    const cx = X(centerOf(m.fret));
    const cy = sy(m.string);
    const kind = m.kind ?? 'note';
    els.push(
      <g key={`mk${i}`} className={`fb-mark ${kind}`}>
        <circle cx={cx} cy={cy} r={compact ? 9.5 : 11} />
        {m.label && (
          <text x={cx} y={cy + 4} textAnchor="middle">
            {m.label}
          </text>
        )}
      </g>,
    );
  });

  // Tıklama alanları
  if (onFretClick) {
    for (let s = 1; s <= sc; s++) {
      for (let f = startFret; f <= endFret; f++) {
        const xa = f === 0 ? labelW : fx(f - 1);
        const xb = f === 0 ? x0 : fx(f);
        els.push(
          <rect
            key={`hit${s}-${f}`}
            x={Math.min(X(xa), X(xb))}
            y={sy(s) - gap / 2}
            width={xb - xa}
            height={gap}
            className="fb-hit"
            onClick={() => onFretClick(s, f)}
          />,
        );
      }
    }
  }

  return (
    <div className="fretboard-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="fretboard" preserveAspectRatio="xMidYMid meet">
        {els}
      </svg>
    </div>
  );
});
