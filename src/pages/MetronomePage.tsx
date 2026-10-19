import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Metronome as MetronomeIcon, Play, Square, Hand, TrendingUp, VolumeX } from 'lucide-react';
import { Metronome, defaultAccents, type AccentLevel, type BeatInfo, type MetronomeConfig } from '../audio/metronome';
import { CLICK_LABELS, type ClickSound } from '../audio/clicks';
import { useSettings } from '../store/settings';
import { useProgress } from '../store/progress';
import { practiceAlreadyTracked } from '../store/timer';
import { Segmented, Slider, Switch } from '../components/ui';
import { formatClock } from '../lib/format';
import './metronome.css';

const STORAGE_KEY = 'rifflab-metronome';

const TEMPO_NAMES: [number, string, string][] = [
  [40, 'Largo', 'çok ağır'],
  [60, 'Adagio', 'ağır'],
  [76, 'Andante', 'yürür gibi'],
  [108, 'Moderato', 'orta'],
  [120, 'Allegro', 'hızlı'],
  [168, 'Presto', 'çok hızlı'],
  [400, 'Prestissimo', 'son derece hızlı'],
];

function tempoName(bpm: number) {
  for (let i = TEMPO_NAMES.length - 1; i >= 0; i--) if (bpm >= TEMPO_NAMES[i][0]) return TEMPO_NAMES[i];
  return TEMPO_NAMES[0];
}

const SIGNATURES: [number, 4 | 8][] = [
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 8],
  [7, 8],
  [12, 8],
];

function loadConfig(clickSound: ClickSound): MetronomeConfig {
  const base: MetronomeConfig = {
    bpm: 90,
    beatsPerBar: 4,
    beatUnit: 4,
    subdivision: 1,
    accents: defaultAccents(4, 4),
    sound: clickSound,
    volume: 0.9,
    trainer: { enabled: false, increment: 5, everyBars: 4, target: 140 },
    gap: { enabled: false, playBars: 2, muteBars: 2 },
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    /* yok say */
  }
  return base;
}

export function MetronomePage() {
  const clickSound = useSettings((s) => s.clickSound);
  const setSettings = useSettings((s) => s.set);
  const [cfg, setCfg] = useState<MetronomeConfig>(() => loadConfig(clickSound));
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState<BeatInfo | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [, tick] = useState(0);
  const metro = useRef<Metronome | null>(null);
  if (!metro.current) metro.current = new Metronome(cfg);
  const taps = useRef<number[]>([]);

  useEffect(() => {
    metro.current!.update(cfg);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...cfg }));
    } catch {
      /* yok say */
    }
  }, [cfg]);

  useEffect(() => {
    const m = metro.current!;
    const off1 = m.onBeat((b) => setBeat(b));
    const off2 = m.onBpmChange((bpm) => setCfg((c) => ({ ...c, bpm })));
    return () => {
      off1();
      off2();
    };
  }, []);

  const logPractice = useCallback((from: number | null) => {
    if (!from) return;
    const secs = (Date.now() - from) / 1000;
    if (secs >= 20 && !practiceAlreadyTracked()) useProgress.getState().addSession({ seconds: secs, kind: 'tool', note: 'Metronom' });
  }, []);

  useEffect(
    () => () => {
      metro.current?.stop();
    },
    [],
  );

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [running]);

  const toggle = useCallback(async () => {
    const m = metro.current!;
    if (m.running) {
      m.stop();
      setRunning(false);
      setBeat(null);
      setStartedAt(null);
    } else {
      await m.start();
      setRunning(true);
      setStartedAt(Date.now());
    }
  }, []);

  // Durdurulunca ya da sayfadan çıkınca süreyi pratik olarak kaydet
  useEffect(() => {
    return () => logPractice(startedAt);
  }, [startedAt, logPractice]);

  const setBpm = useCallback((v: number) => setCfg((c) => ({ ...c, bpm: Math.max(20, Math.min(320, Math.round(v))) })), []);

  const tap = useCallback(() => {
    const now = performance.now();
    const arr = taps.current.filter((t) => now - t < 2500);
    arr.push(now);
    taps.current = arr;
    if (arr.length >= 2) {
      const intervals = arr.slice(1).map((t, i) => t - arr[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBpm(60000 / avg);
    }
  }, [setBpm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (t?.tagName === 'BUTTON') t.blur();
        void toggle();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCfg((c) => ({ ...c, bpm: Math.min(320, c.bpm + (e.shiftKey ? 5 : 1)) }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCfg((c) => ({ ...c, bpm: Math.max(20, c.bpm - (e.shiftKey ? 5 : 1)) }));
      } else if (e.key === 't' || e.key === 'T') tap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, tap]);

  const setSig = (n: number, unit: 4 | 8) => setCfg((c) => ({ ...c, beatsPerBar: n, beatUnit: unit, accents: defaultAccents(n, unit) }));

  const cycleAccent = (i: number) =>
    setCfg((c) => {
      const accents = [...c.accents];
      const cur = accents[i] ?? 1;
      accents[i] = (cur === 2 ? 1 : cur === 1 ? 0 : 2) as AccentLevel;
      return { ...c, accents };
    });

  const [tn, tnTr] = [tempoName(cfg.bpm)[1], tempoName(cfg.bpm)[2]];
  const elapsed = startedAt ? (Date.now() - startedAt) / 1000 : 0;

  return (
    <div className="metro-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <MetronomeIcon size={14} /> Metronom
          </div>
          <h1>Metronom</h1>
          <p className="subtitle">Ses saatine göre hassas zamanlama. Vurguları ayarla, hız antrenörüyle tempoyu kademeli artır, sessiz ölçülerle iç ritmini test et.</p>
        </div>
        <div className="small muted">
          Kısayollar: <span className="kbd">Boşluk</span> başlat/durdur · <span className="kbd">↑</span>
          <span className="kbd">↓</span> tempo · <span className="kbd">T</span> tap
        </div>
      </div>

      <div className="metro-layout">
        <div className={`card metro-main${running ? ' running' : ''}`}>
          <div className="metro-beats" style={{ '--n': cfg.beatsPerBar } as CSSProperties}>
            {Array.from({ length: cfg.beatsPerBar }, (_, i) => (
              <button
                key={i}
                className={`beat-dot lvl${cfg.accents[i] ?? 1}${running && beat?.beat === i ? ' on' : ''}${beat?.muted ? ' muted' : ''}`}
                onClick={() => cycleAccent(i)}
                title="Tıkla: vurgu → normal → sessiz"
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="metro-bpm">
            <button className="btn icon lg round" onClick={() => setBpm(cfg.bpm - 1)} aria-label="Azalt">
              −
            </button>
            <div className="metro-bpm-value">
              <span key={running ? beat?.beat : 'x'} className={running && beat?.beat === 0 ? 'pulse' : ''}>
                {cfg.bpm}
              </span>
              <small>
                BPM · {tn} <span className="muted">({tnTr})</span>
              </small>
            </div>
            <button className="btn icon lg round" onClick={() => setBpm(cfg.bpm + 1)} aria-label="Artır">
              +
            </button>
          </div>
          <Slider value={cfg.bpm} min={30} max={300} onChange={setBpm} ariaLabel="Tempo" />
          <div className="row" style={{ justifyContent: 'center' }}>
            {[60, 80, 100, 120, 140, 160].map((b) => (
              <button key={b} className={`chip${cfg.bpm === b ? ' active' : ''}`} onClick={() => setBpm(b)}>
                {b}
              </button>
            ))}
          </div>

          <div className="metro-actions">
            <button className={`btn lg ${running ? '' : 'primary'} metro-start`} onClick={() => void toggle()}>
              {running ? <Square size={18} /> : <Play size={18} />}
              {running ? 'Durdur' : 'Başlat'}
            </button>
            <button className="btn lg" onClick={tap} title="Tempoyu vurarak belirle (T)">
              <Hand size={18} /> Tap
            </button>
          </div>
          {running && (
            <div className="metro-status mono">
              Ölçü {(beat?.bar ?? 0) + 1} · {formatClock(elapsed)}
              {beat?.muted && (
                <span className="tag warn">
                  <VolumeX size={12} /> sessiz ölçü — ritmi sen tut!
                </span>
              )}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card stack">
            <div className="field">
              <label>Ölçü</label>
              <div className="row">
                {SIGNATURES.map(([n, u]) => (
                  <button key={`${n}/${u}`} className={`chip${cfg.beatsPerBar === n && cfg.beatUnit === u ? ' active' : ''}`} onClick={() => setSig(n, u)}>
                    {n}/{u}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Bölünme</label>
              <Segmented
                value={cfg.subdivision}
                onChange={(v) => setCfg((c) => ({ ...c, subdivision: v }))}
                options={[
                  { value: 1, label: '♩ Dörtlük' },
                  { value: 2, label: '♪♪ Sekizlik' },
                  { value: 3, label: 'Üçleme' },
                  { value: 4, label: 'Onaltılık' },
                ]}
              />
            </div>
            <div className="field">
              <label>Ses</label>
              <select
                className="select"
                value={cfg.sound}
                onChange={(e) => {
                  const s = e.target.value as ClickSound;
                  setCfg((c) => ({ ...c, sound: s }));
                  setSettings({ clickSound: s });
                }}
              >
                {(Object.keys(CLICK_LABELS) as ClickSound[]).map((k) => (
                  <option key={k} value={k}>
                    {CLICK_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Seviye</label>
              <Slider value={cfg.volume} min={0} max={1.5} step={0.05} onChange={(v) => setCfg((c) => ({ ...c, volume: v }))} ariaLabel="Metronom seviyesi" />
            </div>
          </div>

          <div className="card stack">
            <div className="card-title">
              <TrendingUp size={17} /> Hız antrenörü
            </div>
            <Switch checked={cfg.trainer.enabled} onChange={(v) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, enabled: v } }))} label="Tempoyu otomatik artır" />
            <div className="row small">
              Her
              <input className="input mini" type="number" min={1} max={32} value={cfg.trainer.everyBars} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, everyBars: Math.max(1, +e.target.value || 1) } }))} />
              ölçüde
              <input className="input mini" type="number" min={1} max={30} value={cfg.trainer.increment} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, increment: Math.max(1, +e.target.value || 1) } }))} />
              BPM artır, hedef
              <input className="input mini" type="number" min={30} max={320} value={cfg.trainer.target} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, target: Math.max(30, +e.target.value || 120) } }))} />
            </div>
          </div>

          <div className="card stack">
            <div className="card-title">
              <VolumeX size={17} /> Sessiz ölçü antrenmanı
            </div>
            <Switch checked={cfg.gap.enabled} onChange={(v) => setCfg((c) => ({ ...c, gap: { ...c.gap, enabled: v } }))} label="Metronomu belirli ölçülerde sustur" />
            <div className="row small">
              <input className="input mini" type="number" min={1} max={16} value={cfg.gap.playBars} onChange={(e) => setCfg((c) => ({ ...c, gap: { ...c.gap, playBars: Math.max(1, +e.target.value || 1) } }))} />
              ölçü çal,
              <input className="input mini" type="number" min={1} max={16} value={cfg.gap.muteBars} onChange={(e) => setCfg((c) => ({ ...c, gap: { ...c.gap, muteBars: Math.max(1, +e.target.value || 1) } }))} />
              ölçü sus
            </div>
            <p className="small muted" style={{ margin: 0 }}>
              Sessiz ölçülerde tempoyu kendin tutmaya çalış. Tık geri geldiğinde hâlâ onunla aynı yerdeysen ritmin sağlam demektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
