// Küçük, tekrar kullanılan arayüz parçaları.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Info, Lightbulb, TriangleAlert, Flame, CircleCheck } from 'lucide-react';

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  ariaLabel?: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      style={{ '--fill': `${fill}%` } as CSSProperties}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button key={String(o.value)} type="button" title={o.title} className={o.value === value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Difficulty({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <span className="difficulty" title={`Zorluk ${level}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < level ? 'on' : ''} />
      ))}
    </span>
  );
}

export function ProgressRing({ value, size = 92, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--panel-3)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={v >= 1 ? 'var(--ok)' : 'var(--accent)'}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset .4s' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
}

export function Callout({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'metal' | 'ok' | 'tip'; title?: string; children: ReactNode }) {
  const icon =
    tone === 'warn' ? <TriangleAlert size={19} /> : tone === 'metal' ? <Flame size={19} /> : tone === 'ok' ? <CircleCheck size={19} /> : tone === 'tip' ? <Lightbulb size={19} /> : <Info size={19} />;
  return (
    <div className={`callout ${tone === 'tip' ? 'info' : tone}`}>
      {icon}
      <div>
        {title && <div className="callout-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

let toastSetter: ((t: string | null) => void) | null = null;
let toastTimer = 0;

export function toast(msg: string) {
  window.clearTimeout(toastTimer);
  toastSetter?.(msg);
  toastTimer = window.setTimeout(() => toastSetter?.(null), 2600);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    toastSetter = setMsg;
    return () => {
      toastSetter = null;
    };
  }, []);
  if (!msg) return null;
  return (
    <div className="toast" role="status">
      <CircleCheck size={17} color="var(--ok)" />
      {msg}
    </div>
  );
}

export function BarChart({
  data,
  height = 150,
  goal,
  formatValue,
}: {
  data: { label: string; value: number; highlight?: boolean; title?: string }[];
  height?: number;
  goal?: number;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(goal ?? 0, ...data.map((d) => d.value), 1);
  return (
    <div className="barchart" style={{ height }}>
      {goal !== undefined && goal > 0 && <div className="barchart-goal" style={{ bottom: `calc(20px + (100% - 20px) * ${goal / max})` }} title="Günlük hedef" />}
      {data.map((d, i) => (
        <div key={i} className="barchart-col" title={d.title ?? `${d.label}: ${formatValue ? formatValue(d.value) : d.value}`}>
          <div className="barchart-track">
            <div className={`barchart-bar${d.highlight ? ' hl' : ''}${goal && d.value >= goal ? ' done' : ''}`} style={{ height: `${(d.value / max) * 100}%` }} />
          </div>
          <div className="barchart-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
