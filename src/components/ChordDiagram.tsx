import type { ReactNode } from 'react';

export interface ChordShape {
  /** Kalın telden (6) ince tele (1): null = çalınmaz (x), 0 = açık tel */
  frets: (number | null)[];
  fingers?: (number | null)[];
  /** Barre: perde ve tel aralığı (6 = kalın mi … 1 = ince mi) */
  barre?: { fret: number; from: number; to: number };
}

export function chordBaseFret(shape: ChordShape): number {
  const pressed = shape.frets.filter((f): f is number => f !== null && f > 0);
  if (!pressed.length) return 1;
  const max = Math.max(...pressed);
  const min = Math.min(...pressed);
  return max <= 4 ? 1 : min;
}

export function ChordDiagram({ shape, size = 1, highlightRoot }: { shape: ChordShape; size?: number; highlightRoot?: number }) {
  const strings = shape.frets.length;
  const base = chordBaseFret(shape);
  const rows = 5;
  const w = 118 * size;
  const left = 22 * size;
  const top = 26 * size;
  const sgap = (w - left - 12 * size) / (strings - 1);
  const fgap = 22 * size;
  const h = top + rows * fgap + 16 * size;
  const sx = (i: number) => left + i * sgap;
  const els: ReactNode[] = [];

  // Perde çizgileri
  for (let r = 0; r <= rows; r++) {
    const y = top + r * fgap;
    els.push(<line key={`f${r}`} x1={sx(0)} x2={sx(strings - 1)} y1={y} y2={y} className={r === 0 && base === 1 ? 'cd-nut' : 'cd-fret'} />);
  }
  // Teller
  for (let i = 0; i < strings; i++) els.push(<line key={`s${i}`} x1={sx(i)} x2={sx(i)} y1={top} y2={top + rows * fgap} className="cd-string" />);
  if (base > 1)
    els.push(
      <text key="base" x={left - 8 * size} y={top + fgap * 0.65} className="cd-base" textAnchor="end">
        {base}
      </text>,
    );

  // Barre
  if (shape.barre) {
    const r = shape.barre.fret - base + 1;
    const i1 = strings - shape.barre.from;
    const i2 = strings - shape.barre.to;
    const y = top + (r - 0.5) * fgap;
    els.push(<rect key="barre" x={sx(Math.min(i1, i2)) - 8 * size} y={y - 8 * size} width={Math.abs(sx(i2) - sx(i1)) + 16 * size} height={16 * size} rx={8 * size} className="cd-barre" />);
  }

  shape.frets.forEach((f, i) => {
    const x = sx(i);
    if (f === null) {
      els.push(
        <text key={`x${i}`} x={x} y={top - 9 * size} className="cd-mute" textAnchor="middle">
          ×
        </text>,
      );
      return;
    }
    if (f === 0) {
      els.push(<circle key={`o${i}`} cx={x} cy={top - 13 * size} r={4.5 * size} className="cd-open" />);
      return;
    }
    const r = f - base + 1;
    const y = top + (r - 0.5) * fgap;
    const finger = shape.fingers?.[i];
    const inBarre = shape.barre && shape.barre.fret === f && finger === 1 && i !== strings - shape.barre.from && i !== strings - shape.barre.to;
    if (inBarre) return;
    els.push(
      <g key={`d${i}`} className={`cd-dot${highlightRoot === i ? ' root' : ''}`}>
        <circle cx={x} cy={y} r={8.5 * size} />
        {finger ? (
          <text x={x} y={y + 4 * size} textAnchor="middle">
            {finger}
          </text>
        ) : null}
      </g>,
    );
  });

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="chord-diagram">
      {els}
    </svg>
  );
}
