import { useMemo, useState } from 'react';
import { Grid3x3, Volume2, Shuffle } from 'lucide-react';
import { CHORDS, CHORD_GROUP_LABELS, chordMidis, type ChordDef, type ChordGroup } from '../data/chords';
import { TUNINGS } from '../data/tunings';
import { ChordDiagram } from '../components/ChordDiagram';
import { Fretboard, type FretMark } from '../components/Fretboard';
import { strumNow, pluckNow } from '../audio/guitar';
import { engine } from '../audio/engine';
import { useSettings } from '../store/settings';
import { noteName, pcName, mod12, INTERVAL_NAMES } from '../lib/music';
import { Callout } from '../components/ui';
import './chords.css';

const GROUPS: ChordGroup[] = ['open', 'power', 'seventh', 'sus', 'barre'];

export function ChordsPage() {
  const naming = useSettings((s) => s.naming);
  const leftHanded = useSettings((s) => s.leftHanded);
  const [group, setGroup] = useState<ChordGroup | 'all'>('all');
  const [selected, setSelected] = useState<ChordDef>(CHORDS[0]);
  const [practice, setPractice] = useState<{ a: ChordDef; b: ChordDef } | null>(null);

  const list = useMemo(() => (group === 'all' ? CHORDS : CHORDS.filter((c) => c.group === group)), [group]);
  const tuning = TUNINGS[selected.tuning ?? 'standard'].notes;
  const midis = chordMidis(selected.shape, tuning);
  const root = selected.rootIndex !== undefined ? tuning[selected.rootIndex] + (selected.shape.frets[selected.rootIndex] ?? 0) : midis[0];

  const marks: FretMark[] = selected.shape.frets
    .map((f, i) => (f === null ? null : { string: 6 - i, fret: f, label: noteName(tuning[i] + f, naming), kind: mod12(tuning[i] + f - root) === 0 ? ('root' as const) : ('note' as const) }))
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const play = async (c: ChordDef, arp = false) => {
    await engine.resume();
    const t = TUNINGS[c.tuning ?? 'standard'].notes;
    const ms = chordMidis(c.shape, t);
    if (arp) ms.forEach((m, i) => pluckNow(m, { delay: i * 0.18, duration: 2 }));
    else strumNow(ms);
  };

  const randomPair = () => {
    const pool = CHORDS.filter((c) => c.group === 'open');
    const a = pool[Math.floor(Math.random() * pool.length)];
    let b = a;
    while (b.id === a.id) b = pool[Math.floor(Math.random() * pool.length)];
    setPractice({ a, b });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Grid3x3 size={14} /> Akor kütüphanesi
          </div>
          <h1>Akorlar</h1>
          <p className="subtitle">Şemaya tıkla, sesini dinle ve klavyede nerede olduğunu gör. Noktalardaki sayılar parmak numarasıdır: 1 işaret, 2 orta, 3 yüzük, 4 serçe. × çalınmayan, ○ açık tel.</p>
        </div>
        <button className="btn" onClick={randomPair}>
          <Shuffle size={16} /> Geçiş alıştırması
        </button>
      </div>

      {practice && (
        <Callout tone="metal" title={`Geçiş alıştırması: ${practice.a.name} ↔ ${practice.b.name}`}>
          <p className="small">Bir dakika boyunca iki akor arasında gidip gel; her akoru 4 vuruş çal. Kaç temiz geçiş yaptığını say ve yarın geçmeye çalış.</p>
          <div className="row">
            {[practice.a, practice.b].map((c) => (
              <button key={c.id} className="chord-mini" onClick={() => play(c)}>
                <div className="chord-mini-name">{c.name}</div>
                <ChordDiagram shape={c.shape} size={0.8} />
              </button>
            ))}
          </div>
        </Callout>
      )}

      <div className="row mb-2">
        <button className={`chip${group === 'all' ? ' active' : ''}`} onClick={() => setGroup('all')}>
          Tümü
        </button>
        {GROUPS.map((g) => (
          <button key={g} className={`chip${group === g ? ' active' : ''}`} onClick={() => setGroup(g)}>
            {CHORD_GROUP_LABELS[g]}
          </button>
        ))}
      </div>

      <div className="chords-layout">
        <div className="chord-grid">
          {list.map((c) => (
            <button
              key={c.id}
              className={`chord-card${selected.id === c.id ? ' active' : ''}`}
              onClick={() => {
                setSelected(c);
                void play(c);
              }}
            >
              <div className="chord-card-name">{c.name}</div>
              <ChordDiagram shape={c.shape} size={0.9} highlightRoot={c.rootIndex} />
              <div className="tiny muted">{c.full}</div>
            </button>
          ))}
        </div>

        <div className="card chord-detail">
          <div className="chord-detail-head">
            <div>
              <div className="chord-detail-name">{selected.name}</div>
              <div className="muted">{selected.full}</div>
            </div>
            <div className="row">
              <button className="btn primary" onClick={() => play(selected)}>
                <Volume2 size={16} /> Çal
              </button>
              <button className="btn" onClick={() => play(selected, true)}>
                Arpej
              </button>
            </div>
          </div>
          <div className="chord-detail-body">
            <ChordDiagram shape={selected.shape} size={1.5} highlightRoot={selected.rootIndex} />
            <div className="stack small">
              <div>
                <span className="label">Notalar</span>
                <div className="chord-notes">
                  {midis.map((m, i) => (
                    <span key={i} className={`tag${mod12(m - root) === 0 ? ' accent' : ''}`}>
                      {noteName(m, naming)} <span className="muted">{INTERVAL_NAMES[mod12(m - root)].short}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="label">Kök</span>
                <div>{pcName(root, naming)}</div>
              </div>
              {selected.tuning && (
                <div>
                  <span className="label">Akort</span>
                  <div>{TUNINGS[selected.tuning].name}</div>
                </div>
              )}
              {selected.tip && <p className="text-2">{selected.tip}</p>}
            </div>
          </div>
          <Fretboard tuning={tuning} frets={Math.max(6, Math.max(...selected.shape.frets.map((f) => f ?? 0)) + 3)} marks={marks} naming={naming} leftHanded={leftHanded} compact />
        </div>
      </div>
    </div>
  );
}
