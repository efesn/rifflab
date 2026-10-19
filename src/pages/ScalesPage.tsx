import { useMemo, useRef, useState } from 'react';
import { Route, Play, Square } from 'lucide-react';
import { SCALES, getScale, type ScaleId } from '../data/scales';
import { TUNINGS, TUNING_LIST, type TuningId } from '../data/tunings';
import { Fretboard, type FretMark } from '../components/Fretboard';
import { Segmented, Switch } from '../components/ui';
import { useSettings } from '../store/settings';
import { pluckNow } from '../audio/guitar';
import { engine } from '../audio/engine';
import { INTERVAL_NAMES, mod12, noteName, pcName } from '../lib/music';
import './chords.css';

const POSITIONS: { label: string; range: [number, number] | null }[] = [
  { label: 'Tüm klavye', range: null },
  { label: 'Açık (0–4)', range: [0, 4] },
  { label: '3–6', range: [3, 6] },
  { label: '5–8', range: [5, 8] },
  { label: '7–10', range: [7, 10] },
  { label: '9–12', range: [9, 12] },
  { label: '12–15', range: [12, 15] },
];

export function ScalesPage() {
  const naming = useSettings((s) => s.naming);
  const leftHanded = useSettings((s) => s.leftHanded);
  const [root, setRoot] = useState(9);
  const [scaleId, setScaleId] = useState<ScaleId>('minorPent');
  const [tuningId, setTuningId] = useState<TuningId>('standard');
  const [labels, setLabels] = useState<'notes' | 'intervals' | 'none'>('notes');
  const [pos, setPos] = useState(0);
  const [frets, setFrets] = useState(15);
  const [showAll, setShowAll] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const scale = getScale(scaleId);
  const tuning = TUNINGS[tuningId].notes;
  const range = POSITIONS[pos].range;

  const marks = useMemo(() => {
    const out: FretMark[] = [];
    for (let s = 1; s <= 6; s++) {
      for (let f = 0; f <= frets; f++) {
        if (range && (f < range[0] || f > range[1])) continue;
        const midi = tuning[6 - s] + f;
        const iv = mod12(midi - root);
        if (!scale.intervals.includes(iv)) continue;
        out.push({
          string: s,
          fret: f,
          kind: iv === 0 ? 'root' : 'note',
          label: labels === 'notes' ? pcName(midi, naming) : labels === 'intervals' ? INTERVAL_NAMES[iv].short : undefined,
        });
      }
    }
    return out;
  }, [frets, range, tuning, root, scale, labels, naming]);

  const stopPlay = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPlaying(false);
  };

  const playScale = async () => {
    if (playing) return stopPlay();
    await engine.resume();
    // Pozisyondaki notalar, perdeye göre benzersiz, kalından inceye
    const seen = new Set<number>();
    const notes = marks
      .map((m) => tuning[6 - m.string] + m.fret)
      .sort((a, b) => a - b)
      .filter((m) => (seen.has(m) ? false : (seen.add(m), true)));
    const lo = range ? notes : notes.filter((m) => m >= tuning[0] && m <= tuning[0] + 24);
    const seq = [...lo, ...lo.slice(0, -1).reverse()];
    setPlaying(true);
    seq.forEach((m, i) => {
      timers.current.push(window.setTimeout(() => pluckNow(m, { duration: 0.5 }), i * 260));
    });
    timers.current.push(window.setTimeout(() => setPlaying(false), seq.length * 260 + 400));
  };

  const scaleNotes = scale.intervals.map((iv) => pcName(root + iv, naming, [1, 3, 8, 10].includes(mod12(root)) || scale.intervals.includes(1)));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Route size={14} /> Klavye haritası
          </div>
          <h1>Gamlar & Klavye</h1>
          <p className="subtitle">Bir kök nota ve gam seç, klavyede tüm konumlarını gör. Pozisyon filtresiyle tek bir kutuya odaklan, notalara tıklayarak dinle.</p>
        </div>
        <button className={`btn ${playing ? '' : 'primary'}`} onClick={() => void playScale()}>
          {playing ? <Square size={16} /> : <Play size={16} />} {playing ? 'Durdur' : 'Gamı çal'}
        </button>
      </div>

      <div className="card stack mb-2">
        <div className="scale-controls">
          <div className="field">
            <label>Kök</label>
            <div className="root-picker">
              {Array.from({ length: 12 }, (_, i) => (
                <button key={i} className={`chip${root === i ? ' active' : ''}`} onClick={() => setRoot(i)}>
                  {pcName(i, naming)}
                </button>
              ))}
            </div>
          </div>
          <div className="row">
            <div className="field" style={{ minWidth: 220 }}>
              <label>Gam</label>
              <select className="select" value={scaleId} onChange={(e) => setScaleId(e.target.value as ScaleId)}>
                {SCALES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Akort</label>
              <select className="select" value={tuningId} onChange={(e) => setTuningId(e.target.value as TuningId)}>
                {TUNING_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Etiket</label>
              <Segmented
                value={labels}
                onChange={setLabels}
                options={[
                  { value: 'notes', label: 'Nota' },
                  { value: 'intervals', label: 'Aralık' },
                  { value: 'none', label: 'Yok' },
                ]}
              />
            </div>
            <div className="field">
              <label>Perde sayısı</label>
              <Segmented
                value={frets}
                onChange={setFrets}
                options={[
                  { value: 12, label: '12' },
                  { value: 15, label: '15' },
                  { value: 24, label: '24' },
                ]}
              />
            </div>
          </div>
          <div className="field">
            <label>Pozisyon</label>
            <div className="row">
              {POSITIONS.map((p, i) => (
                <button key={p.label} className={`chip${pos === i ? ' active' : ''}`} onClick={() => setPos(i)}>
                  {p.label}
                </button>
              ))}
              <span className="spacer" />
              <Switch checked={showAll} onChange={setShowAll} label="Tüm notaları göster" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <Fretboard
          tuning={tuning}
          frets={frets}
          marks={marks}
          naming={naming}
          leftHanded={leftHanded}
          showAllNotes={showAll}
          dimFrets={range}
          onFretClick={async (s, f) => {
            await engine.resume();
            pluckNow(tuning[6 - s] + f, { duration: 1.2 });
          }}
        />
      </div>

      <div className="grid grid-2 mt-2">
        <div className="card">
          <div className="card-title">
            {pcName(root, naming)} {scale.name}
          </div>
          <p className="text-2">{scale.desc}</p>
          <div className="chord-notes">
            {scale.intervals.map((iv, i) => (
              <span key={iv} className={`tag${iv === 0 ? ' accent' : ''}`}>
                {scaleNotes[i]} <span className="muted">{INTERVAL_NAMES[iv].short}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="card small text-2">
          <div className="card-title">Nasıl çalışılır?</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Turuncu noktalar kök nota ({noteName(root + 48, naming)}). Her kalıbı kökten başlayıp köke dönerek çal.</li>
            <li>Bir pozisyon seç ve o kutudaki notaları ezberle; sonra komşu kutuya geç.</li>
            <li>"Aralık" etiketleri, gamın akorlarla ilişkisini görmeni sağlar (b3 = minör, 3 = majör).</li>
            <li>Drop akortlarda 6. teldeki kalıp değişir — akort seçiminden kontrol edebilirsin.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
