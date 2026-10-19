import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Gauge, Lock, LockOpen, CircleCheck } from 'lucide-react';
import { MicInput } from '../audio/mic';
import { MedianSmoother } from '../audio/pitch';
import { engine } from '../audio/engine';
import { TUNINGS, TUNING_LIST, type TuningId } from '../data/tunings';
import { useSettings } from '../store/settings';
import { centsOff, freqToMidi, midiToFreq, noteName } from '../lib/music';
import { Callout, Segmented, Slider } from '../components/ui';
import './tuner.css';

const mic = new MicInput();

interface Reading {
  freq: number;
  midi: number;
  cents: number;
  target: number;
  stringIdx: number | null;
}

function playReference(midi: number, a4: number) {
  const ctx = engine.ctx;
  const t = ctx.currentTime + 0.02;
  const o = new OscillatorNode(ctx, { type: 'triangle', frequency: midiToFreq(midi, a4) });
  const o2 = new OscillatorNode(ctx, { type: 'sine', frequency: midiToFreq(midi, a4) * 2 });
  const g = new GainNode(ctx, { gain: 0 });
  const g2 = new GainNode(ctx, { gain: 0.25 });
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(engine.refBus);
  g.gain.linearRampToValueAtTime(0.6, t + 0.02);
  g.gain.setValueAtTime(0.6, t + 1.6);
  g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
  o.start(t);
  o2.start(t);
  o.stop(t + 2.7);
  o2.stop(t + 2.7);
  o.onended = () => g.disconnect();
}

function Needle({ cents, active, inTune }: { cents: number; active: boolean; inTune: boolean }) {
  const c = Math.max(-50, Math.min(50, cents));
  const angle = (c / 50) * 60;
  const ticks = [];
  for (let v = -50; v <= 50; v += 5) {
    const a = ((v / 50) * 60 - 90) * (Math.PI / 180);
    const r1 = v % 25 === 0 ? 112 : v % 10 === 0 ? 118 : 122;
    ticks.push(
      <line key={v} x1={150 + Math.cos(a) * r1} y1={160 + Math.sin(a) * r1} x2={150 + Math.cos(a) * 130} y2={160 + Math.sin(a) * 130} className={`tn-tick${v === 0 ? ' zero' : ''}`} />,
    );
    if (v % 25 === 0)
      ticks.push(
        <text key={`t${v}`} x={150 + Math.cos(a) * 98} y={160 + Math.sin(a) * 98 + 4} textAnchor="middle" className="tn-ticklabel">
          {v > 0 ? `+${v}` : v}
        </text>,
      );
  }
  const za = (-5 / 50) * 60 - 90;
  const zb = (5 / 50) * 60 - 90;
  const arc = (r: number, a1: number, a2: number) => {
    const p = (a: number) => `${150 + Math.cos((a * Math.PI) / 180) * r},${160 + Math.sin((a * Math.PI) / 180) * r}`;
    return `M${p(a1)} A${r},${r} 0 0 1 ${p(a2)}`;
  };
  return (
    <svg viewBox="0 0 300 180" className={`tn-needle${active ? '' : ' idle'}${inTune ? ' intune' : ''}`}>
      <path d={arc(130, -150, -30)} className="tn-arc" />
      <path d={arc(130, za, zb)} className="tn-zone" />
      {ticks}
      <g style={{ transform: `rotate(${active ? angle : 0}deg)`, transformOrigin: '150px 160px', transition: 'transform 0.08s linear' }}>
        <line x1={150} y1={160} x2={150} y2={38} className="tn-pointer" />
      </g>
      <circle cx={150} cy={160} r={9} className="tn-hub" />
    </svg>
  );
}

export function TunerPage({ initialTuning }: { initialTuning?: TuningId }) {
  const a4 = useSettings((s) => s.a4);
  const naming = useSettings((s) => s.naming);
  const deviceId = useSettings((s) => s.micDeviceId);
  const setSettings = useSettings((s) => s.set);
  const [tuningId, setTuningId] = useState<TuningId>(initialTuning && TUNINGS[initialTuning] ? initialTuning : 'standard');
  const [mode, setMode] = useState<'guitar' | 'chromatic'>('guitar');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [level, setLevel] = useState(0);
  const [locked, setLocked] = useState<number | null>(null);
  const [inTune, setInTune] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [tunedStrings, setTunedStrings] = useState<Set<number>>(new Set());
  const strobeRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<HTMLCanvasElement>(null);

  const tuning = TUNINGS[tuningId];

  useEffect(() => {
    if (initialTuning && TUNINGS[initialTuning]) setTuningId(initialTuning);
  }, [initialTuning]);

  useEffect(() => {
    setTunedStrings(new Set());
    setLocked(null);
  }, [tuningId]);

  const stop = useCallback(() => {
    mic.stop();
    setListening(false);
    setReading(null);
    setLevel(0);
  }, []);

  useEffect(() => () => mic.stop(), []);

  const start = async (id = deviceId) => {
    setError(null);
    try {
      await mic.start(id || undefined);
      setListening(true);
      MicInput.listInputs().then(setDevices).catch(() => {});
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      setError(
        name === 'NotAllowedError'
          ? 'Mikrofon izni reddedildi. Adres çubuğundaki kilit/mikrofon simgesinden izin verip tekrar dene.'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'Mikrofon ya da ses girişi bulunamadı.'
            : 'Mikrofon başlatılamadı.',
      );
    }
  };

  // Algılama döngüsü
  useEffect(() => {
    if (!listening) return;
    const smoother = new MedianSmoother(5);
    let raf = 0;
    let smoothCents = 0;
    let lastHeard = 0;
    let tuneSince = 0;
    let strobePhase = 0;
    let lastT = performance.now();
    const trace: number[] = [];
    let frame = 0;

    const loop = () => {
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;
      const f = mic.read();
      if (frame++ % 2 === 0) setLevel(Math.min(1, Math.sqrt(f.level) * 2.2));
      let cur: Reading | null = null;
      if (f.pitch && f.pitch.clarity > 0.82) {
        const freq = smoother.push(f.pitch.freq);
        const midiF = freqToMidi(freq, a4);
        let target = Math.round(midiF);
        let stringIdx: number | null = null;
        if (mode === 'guitar') {
          if (locked !== null) {
            stringIdx = locked;
            target = tuning.notes[locked];
          } else {
            let best = 0;
            tuning.notes.forEach((m, i) => {
              if (Math.abs(m - midiF) < Math.abs(tuning.notes[best] - midiF)) best = i;
            });
            stringIdx = best;
            target = tuning.notes[best];
          }
        }
        const cents = centsOff(freq, target, a4);
        smoothCents = lastHeard && now - lastHeard < 300 ? smoothCents + (cents - smoothCents) * 0.3 : cents;
        lastHeard = now;
        cur = { freq, midi: Math.round(midiF), cents: smoothCents, target, stringIdx };
        const ok = Math.abs(smoothCents) < 4;
        if (ok) {
          if (!tuneSince) tuneSince = now;
          if (now - tuneSince > 450 && stringIdx !== null) setTunedStrings((s) => (s.has(stringIdx!) ? s : new Set(s).add(stringIdx!)));
        } else tuneSince = 0;
        setInTune(ok && now - tuneSince > 250);
        setReading(cur);
        strobePhase += Math.max(-60, Math.min(60, smoothCents)) * dt * 6;
      } else if (lastHeard && now - lastHeard > 1500) {
        smoother.reset();
        lastHeard = 0;
        tuneSince = 0;
        setReading(null);
        setInTune(false);
      }
      if (strobeRef.current) strobeRef.current.style.backgroundPositionX = `${strobePhase}px`;

      // Sapma izi
      trace.push(cur ? Math.max(-50, Math.min(50, cur.cents)) : NaN);
      if (trace.length > 240) trace.shift();
      const cv = traceRef.current;
      if (cv) {
        const g = cv.getContext('2d');
        if (g) {
          const w = cv.width;
          const h = cv.height;
          g.clearRect(0, 0, w, h);
          g.fillStyle = 'rgba(61,220,132,0.12)';
          g.fillRect(0, h / 2 - (5 / 50) * (h / 2), w, (10 / 50) * (h / 2));
          g.strokeStyle = 'rgba(255,255,255,0.12)';
          g.beginPath();
          g.moveTo(0, h / 2);
          g.lineTo(w, h / 2);
          g.stroke();
          g.lineWidth = 2;
          g.strokeStyle = '#ff7a3d';
          g.beginPath();
          let pen = false;
          trace.forEach((v, i) => {
            // En yeni ölçüm sağda; eskiler sola kayar
            const x = w - ((trace.length - 1 - i) / 239) * w;
            if (Number.isNaN(v)) {
              pen = false;
              return;
            }
            const y = h / 2 - (v / 50) * (h / 2 - 4);
            if (pen) g.lineTo(x, y);
            else g.moveTo(x, y);
            pen = true;
          });
          g.stroke();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [listening, a4, mode, locked, tuning]);

  const cents = reading?.cents ?? 0;
  const displayMidi = reading ? (mode === 'guitar' ? reading.target : reading.midi) : null;
  const direction = !reading ? '' : Math.abs(cents) < 4 ? 'Akortlu!' : cents < 0 ? 'Pes — teli ger (sıkılaştır)' : 'Tiz — teli gevşet';

  return (
    <div className="tuner-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Gauge size={14} /> Akort cihazı
          </div>
          <h1>Akort</h1>
          <p className="subtitle">Mikrofon ya da ses kartı ile gerçek zamanlı perde algılama. Teli çal, ibreyi ortaya getir. Ses yalnızca bu cihazda işlenir.</p>
        </div>
        <div className="row">
          <select
            className="select"
            value={tuningId}
            onChange={(e) => setTuningId(e.target.value as TuningId)}
            aria-label="Akort düzeni"
          >
            {TUNING_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'guitar', label: 'Gitar' },
              { value: 'chromatic', label: 'Kromatik' },
            ]}
          />
        </div>
      </div>

      <div className="tuner-layout">
        <div className={`card tuner-main${inTune ? ' intune' : ''}`}>
          <div className="tuner-display">
            <div className="tuner-note">
              {displayMidi !== null ? noteName(displayMidi, naming) : '—'}
              {displayMidi !== null && <small>{Math.floor(displayMidi / 12) - 1}</small>}
            </div>
            <Needle cents={cents} active={!!reading} inTune={inTune} />
            <div className="tuner-readout">
              <span className="mono">{reading ? `${cents > 0 ? '+' : ''}${cents.toFixed(1)} cent` : '± 0 cent'}</span>
              <span className="mono muted">{reading ? `${reading.freq.toFixed(2)} Hz` : '— Hz'}</span>
              {reading && mode === 'guitar' && <span className="mono muted">hedef {midiToFreq(reading.target, a4).toFixed(2)} Hz</span>}
            </div>
            <div className={`tuner-hint${inTune ? ' ok' : ''}`}>{listening ? direction || 'Bir tel çal…' : 'Başlamak için mikrofonu aç'}</div>
          </div>
          <div className="strobe" ref={strobeRef} style={{ opacity: reading ? 1 : 0.25 }} title="Strobe: çizgiler durduğunda tel akortludur" />
          <canvas ref={traceRef} className="trace" width={600} height={70} />
          <div className="tuner-controls">
            {listening ? (
              <button className="btn lg" onClick={stop}>
                <MicOff size={18} /> Durdur
              </button>
            ) : (
              <button className="btn primary lg" onClick={() => void start()}>
                <Mic size={18} /> Mikrofonu başlat
              </button>
            )}
            <div className="level" title="Giriş seviyesi">
              <span style={{ width: `${level * 100}%` }} />
            </div>
          </div>
          {error && (
            <Callout tone="warn" title="Mikrofon">
              <p>{error}</p>
            </Callout>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">{tuning.name}</div>
                <div className="card-sub">{tuning.description}</div>
              </div>
            </div>
            <div className="string-list">
              {tuning.notes.map((m, i) => {
                const isActive = reading?.stringIdx === i;
                const isLocked = locked === i;
                const tuned = tunedStrings.has(i);
                return (
                  <div key={i} className={`string-row${isActive ? ' active' : ''}${tuned ? ' tuned' : ''}`}>
                    <span className="string-num">{6 - i}</span>
                    <span className="string-note">
                      {noteName(m, naming)}
                      <small>{Math.floor(m / 12) - 1}</small>
                    </span>
                    <span className="string-hz mono">{midiToFreq(m, a4).toFixed(1)} Hz</span>
                    {tuned && <CircleCheck size={16} className="ok" />}
                    <span className="spacer" />
                    <button
                      className={`btn icon sm${isLocked ? ' on' : ' ghost'}`}
                      title={isLocked ? 'Kilidi aç (otomatik tel algılama)' : 'Bu tele kilitle'}
                      onClick={() => {
                        setMode('guitar');
                        setLocked(isLocked ? null : i);
                      }}
                    >
                      {isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
                    </button>
                    <button
                      className="btn icon sm"
                      title="Referans sesi çal"
                      onClick={async () => {
                        await engine.resume();
                        playReference(m, a4);
                      }}
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
            {tunedStrings.size === 6 && (
              <Callout tone="ok" title="Tüm teller akortlu!">
                <p className="small">Harika. Teller birbirini etkiler; son bir kez hızlıca kontrol et ve çalmaya başla.</p>
              </Callout>
            )}
          </div>

          <div className="card">
            <div className="field">
              <label>Referans La (A4): {a4} Hz</label>
              <Slider value={a4} min={430} max={450} step={1} onChange={(v) => setSettings({ a4: v })} ariaLabel="A4 frekansı" />
            </div>
            {devices.length > 1 && (
              <div className="field mt-2">
                <label>Ses girişi</label>
                <select
                  className="select"
                  value={deviceId}
                  onChange={(e) => {
                    setSettings({ micDeviceId: e.target.value });
                    if (listening) void start(e.target.value);
                  }}
                >
                  <option value="">Varsayılan</option>
                  {devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Giriş ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Callout tone="tip" title="İpuçları">
            <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Notaya her zaman aşağıdan yaklaş: önce biraz pes yap, sonra yukarı ger.</li>
              <li>Teli bir kez çal ve çınlamasını bekle; arka arkaya vurma.</li>
              <li>Çevrede gürültü varsa gitarı mikrofona yaklaştır ya da bir ses kartı kullan.</li>
              <li>Yeni teller birkaç gün boyunca sık sık gevşer — normal.</li>
            </ul>
          </Callout>
        </div>
      </div>
    </div>
  );
}
