import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Metronome as MetronomeIcon,
  Timer,
  Drum,
  Mic,
  MicOff,
  Gauge,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  CircleCheck,
  X,
  SkipForward,
  RotateCcw,
  Headphones,
  Ear,
  TrendingUp,
} from 'lucide-react';
import { TabView, type ActiveRef } from '../tab/TabView';
import type { ParsedTab, TimeSig } from '../tab/types';
import { buildSequence, sectionRefs, type MeasureRef, type SeqEvent } from '../tab/sequence';
import { DEFAULT_PLAYER_SETTINGS, TabPlayer, type PlayerSettings } from '../tab/player';
import { DRUM_PATTERNS, type DrumPatternId } from '../audio/drums';
import { TONE_LABELS, type ToneId } from '../audio/amp';
import { MicInput, OnsetDetector } from '../audio/mic';
import { pluckNow } from '../audio/guitar';
import { engine } from '../audio/engine';
import { createTicker } from '../audio/ticker';
import { useSettings } from '../store/settings';
import { useProgress } from '../store/progress';
import { practiceAlreadyTracked } from '../store/timer';
import { Fretboard, type FretMark } from './Fretboard';
import { Segmented, Slider, Switch, toast } from './ui';
import { freqToMidi, mod12, noteName } from '../lib/music';

export interface PlayerSection {
  name: string;
  tab: ParsedTab;
  repeat?: number;
  note?: string;
}

export interface TabPlayerPanelProps {
  sections: PlayerSection[];
  tuning: number[];
  timeSig: TimeSig;
  bpm: number;
  startBpm?: number;
  drums?: DrumPatternId;
  tone?: ToneId;
  compact?: boolean;
  riffId?: string;
  showFretboard?: boolean;
  shortcuts?: boolean;
}

type Selection = { section: number; from: number; to: number };

const sharedMic = new MicInput();

export function TabPlayerPanel(props: TabPlayerPanelProps) {
  const { sections, tuning, timeSig, bpm: originalBpm, startBpm, drums: defaultDrums = 'none', tone, compact = false, riffId, showFretboard = true, shortcuts = !compact } = props;
  const naming = useSettings((s) => s.naming);
  const zoom = useSettings((s) => s.tabZoom);
  const showRhythm = useSettings((s) => s.showRhythm);
  const globalTone = useSettings((s) => s.tone);
  const clickSound = useSettings((s) => s.clickSound);
  const leftHanded = useSettings((s) => s.leftHanded);
  const setSettings = useSettings((s) => s.set);

  const initialBpm = Math.round(startBpm ?? originalBpm);
  const [cfg, setCfg] = useState<PlayerSettings>(() => ({ ...DEFAULT_PLAYER_SETTINGS, bpm: initialBpm, drums: defaultDrums, clickSound }));
  const [playing, setPlaying] = useState(false);
  const [countIn, setCountIn] = useState<number | null>(null);
  const [active, setActive] = useState<(MeasureRef & { event: number }) | null>(null);
  const [sectionSel, setSectionSel] = useState<number | 'all'>(sections.length > 1 ? 'all' : 0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [rangeMode, setRangeMode] = useState(false);
  const [anchor, setAnchor] = useState<MeasureRef | null>(null);
  const [startAt, setStartAt] = useState<MeasureRef | null>(null);
  const [showMixer, setShowMixer] = useState(false);
  const [showTrainer, setShowTrainer] = useState(false);
  const [passes, setPasses] = useState(0);
  const [waitMode, setWaitMode] = useState(false);

  const playerRef = useRef<TabPlayer | null>(null);
  if (!playerRef.current) playerRef.current = new TabPlayer(cfg);
  const player = playerRef.current;

  // Riff değişince tempo vb. sıfırla
  useEffect(() => {
    setCfg((c) => ({ ...c, bpm: initialBpm, drums: defaultDrums }));
    setSelection(null);
    setStartAt(null);
    setSectionSel(sections.length > 1 ? 'all' : 0);
  }, [riffId, initialBpm, defaultDrums, sections.length]);

  // Riffin önerdiği ton
  useEffect(() => {
    if (tone && !compact) setSettings({ tone });
  }, [tone, compact, setSettings]);

  const seq = useMemo(() => {
    let refs: MeasureRef[] = [];
    if (selection) {
      for (let m = Math.min(selection.from, selection.to); m <= Math.max(selection.from, selection.to); m++) refs.push({ section: selection.section, measure: m });
    } else if (sectionSel === 'all') {
      sections.forEach((s, i) => refs.push(...sectionRefs(i, s.tab, s.repeat ?? 1)));
    } else {
      refs = sectionRefs(sectionSel, sections[sectionSel].tab, 1);
    }
    return buildSequence(
      sections.map((s) => s.tab),
      refs,
      tuning,
      timeSig,
    );
  }, [sections, sectionSel, selection, tuning, timeSig]);

  // Ayarları oynatıcıya aktar
  useEffect(() => {
    player.update(cfg);
  }, [cfg, player]);

  useEffect(() => {
    setCfg((c) => ({ ...c, clickSound }));
  }, [clickSound]);

  const startBeatFor = useCallback(
    (ref: MeasureRef | null) => {
      if (!ref) return 0;
      const m = seq.measures.find((x) => x.ref.section === ref.section && x.ref.measure === ref.measure);
      return m ? m.beat : 0;
    },
    [seq],
  );

  // Dizi değişince yeniden yükle; çalıyorsa baştan devam et
  useEffect(() => {
    const was = player.playing;
    player.load(seq);
    setPasses(0);
    if (was) void player.play(0);
  }, [seq, player]);

  // Oynatıcı olayları
  useEffect(() => {
    return player.on((e) => {
      if (e.type === 'state') {
        setPlaying(e.playing);
        if (!e.playing) {
          setActive(null);
          setCountIn(null);
        }
      } else if (e.type === 'pass') setPasses(e.count);
      else if (e.type === 'bpm') {
        setCfg((c) => ({ ...c, bpm: e.bpm }));
        toast(`Hız antrenörü: ${e.bpm} BPM`);
      }
    });
  }, [player]);

  // Ekran konumu takibi
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastKey = '';
    let lastCount: number | null = null;
    const loop = () => {
      const pos = player.getPosition();
      if (pos) {
        if (pos.countIn) {
          const n = Math.ceil(-pos.beat / (timeSig[1] === 8 ? 0.5 : 1));
          if (n !== lastCount) {
            lastCount = n;
            setCountIn(n);
          }
        } else {
          if (lastCount !== null) {
            lastCount = null;
            setCountIn(null);
          }
          const ev = player.sequence?.events[pos.eventIndex];
          if (ev) {
            const key = `${ev.ref.section}-${ev.ref.measure}-${ev.ref.event}`;
            if (key !== lastKey) {
              lastKey = key;
              setActive(ev.ref);
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, player, timeSig]);

  // Pratik süresi kaydı
  const activeSince = useRef<number | null>(null);
  const flushPractice = useCallback(() => {
    if (activeSince.current === null) return;
    const secs = (Date.now() - activeSince.current) / 1000;
    activeSince.current = null;
    if (secs < 5) return;
    const prog = useProgress.getState();
    if (riffId) prog.addRiffTime(riffId, secs);
    if (!practiceAlreadyTracked() && secs >= 20) prog.addSession({ seconds: secs, kind: riffId ? 'riff' : 'lesson', ref: riffId });
  }, [riffId]);

  useEffect(() => {
    if (playing || waitMode) {
      if (activeSince.current === null) activeSince.current = Date.now();
    } else flushPractice();
  }, [playing, waitMode, flushPractice]);

  useEffect(
    () => () => {
      player.stop();
      flushPractice();
    },
    [player, flushPractice],
  );

  const toggle = useCallback(async () => {
    if (player.playing) {
      player.stop();
      return;
    }
    if (waitMode) setWaitMode(false);
    await engine.resume();
    void player.play(startBeatFor(startAt));
  }, [player, startAt, startBeatFor, waitMode]);

  const stop = useCallback(() => {
    player.stop();
    setStartAt(null);
  }, [player]);

  const setBpm = useCallback((v: number) => setCfg((c) => ({ ...c, bpm: Math.max(20, Math.min(300, Math.round(v))) })), []);

  // Klavye kısayolları
  useEffect(() => {
    if (!shortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (t?.tagName === 'BUTTON') t.blur();
        void toggle();
      } else if (e.key === 'l' || e.key === 'L') setCfg((c) => ({ ...c, loop: !c.loop }));
      else if (e.key === 'm' || e.key === 'M') setCfg((c) => ({ ...c, metronome: !c.metronome }));
      else if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCfg((c) => ({ ...c, bpm: Math.min(300, c.bpm + (e.shiftKey ? 1 : 5)) }));
      } else if (e.key === '-' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCfg((c) => ({ ...c, bpm: Math.max(20, c.bpm - (e.shiftKey ? 1 : 5)) }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcuts, toggle]);

  const onMeasureClick = (section: number, measure: number, shift: boolean) => {
    if (shift || rangeMode) {
      const a = anchor && anchor.section === section ? anchor : { section, measure };
      if (!anchor || anchor.section !== section || (rangeMode && selection && selection.from !== selection.to)) {
        setAnchor({ section, measure });
        setSelection({ section, from: measure, to: measure });
      } else {
        setSelection({ section, from: Math.min(a.measure, measure), to: Math.max(a.measure, measure) });
      }
      setCfg((c) => ({ ...c, loop: true }));
      return;
    }
    setAnchor({ section, measure });
    if (selection && (selection.section !== section || measure < selection.from || measure > selection.to)) setSelection(null);
    if (sectionSel !== 'all' && sectionSel !== section) setSectionSel(section);
    const ref = { section, measure };
    setStartAt(ref);
    if (player.playing) {
      // yeni dizi hesaplanmadıysa mevcut dizide başlat
      const m = player.sequence?.measures.find((x) => x.ref.section === section && x.ref.measure === measure);
      if (m) void player.play(m.beat);
    }
  };

  const clearSelection = () => {
    setSelection(null);
    setAnchor(null);
    setRangeMode(false);
  };

  const pct = Math.round((cfg.bpm / originalBpm) * 100);
  const activeEvent: SeqEvent | undefined = useMemo(() => {
    if (!active) return undefined;
    return seq.events.find((e) => e.ref.section === active.section && e.ref.measure === active.measure && e.ref.event === active.event);
  }, [active, seq]);

  const fretMarks: FretMark[] = useMemo(() => {
    if (!activeEvent) return [];
    const marks: FretMark[] = [];
    const tab = sections[activeEvent.ref.section]?.tab;
    const ev = tab?.measures[activeEvent.ref.measure]?.events[activeEvent.ref.event];
    ev?.notes.forEach((n) => marks.push({ string: n.string, fret: n.fret, kind: 'active', label: n.dead ? 'x' : noteName(tuning[tuning.length - n.string] + n.fret, naming) }));
    return marks;
  }, [activeEvent, sections, tuning, naming]);

  const maxFret = useMemo(() => {
    let m = 0;
    sections.forEach((s) => s.tab.measures.forEach((me) => me.events.forEach((e) => e.notes.forEach((n) => (m = Math.max(m, n.fret))))));
    return m;
  }, [sections]);

  const markClean = () => {
    if (!riffId) return;
    useProgress.getState().recordRiffBpm(riffId, cfg.bpm);
    toast(`${cfg.bpm} BPM kaydedildi. Bir sonraki hedef: ${cfg.bpm + 5} BPM`);
  };

  return (
    <div className={`player${compact ? ' compact' : ''}`}>
      <div className="player-bar">
        <button className={`btn ${playing ? '' : 'primary'} player-play`} onClick={() => void toggle()} aria-label={playing ? 'Durdur' : 'Çal'} title="Çal / Durdur (Boşluk)">
          {playing ? <Pause size={18} /> : <Play size={18} />}
          <span>{playing ? 'Duraklat' : 'Çal'}</span>
        </button>
        <button className="btn icon" onClick={stop} aria-label="Başa sar" title="Durdur ve başa sar">
          <Square size={15} />
        </button>

        <div className="tempo-box" title="Tempo (↑/↓ veya +/− tuşları)">
          <button className="btn icon sm ghost" onClick={() => setBpm(cfg.bpm - 5)} aria-label="Tempoyu azalt">
            −
          </button>
          <div className="tempo-value">
            <span className="mono">{cfg.bpm}</span>
            <small>BPM · %{pct}</small>
          </div>
          <button className="btn icon sm ghost" onClick={() => setBpm(cfg.bpm + 5)} aria-label="Tempoyu artır">
            +
          </button>
        </div>
        {!compact && (
          <div className="tempo-presets">
            {[50, 75, 100].map((p) => (
              <button key={p} className={`chip${pct === p ? ' active' : ''}`} onClick={() => setBpm((originalBpm * p) / 100)}>
                %{p}
              </button>
            ))}
          </div>
        )}

        <div className="player-toggles">
          <button className={`btn icon${cfg.loop ? ' on' : ''}`} onClick={() => setCfg((c) => ({ ...c, loop: !c.loop }))} title="Döngü (L)" aria-label="Döngü">
            <Repeat size={17} />
          </button>
          <button className={`btn icon${cfg.metronome ? ' on' : ''}`} onClick={() => setCfg((c) => ({ ...c, metronome: !c.metronome }))} title="Metronom (M)" aria-label="Metronom">
            <MetronomeIcon size={17} />
          </button>
          <button className={`btn icon${cfg.countIn ? ' on' : ''}`} onClick={() => setCfg((c) => ({ ...c, countIn: !c.countIn }))} title="Başlamadan önce bir ölçü say" aria-label="Sayım">
            <Timer size={17} />
          </button>
          <button
            className={`btn icon${cfg.guitarMuted ? ' on' : ''}`}
            onClick={() => setCfg((c) => ({ ...c, guitarMuted: !c.guitarMuted }))}
            title="Sen çal: gitar sesini kapat, sadece davul/metronom çalsın"
            aria-label="Gitar sesini kapat"
          >
            <Headphones size={17} />
          </button>
          <label className="drum-select" title="Davul eşliği">
            <Drum size={16} />
            <select className="select" value={cfg.drums} onChange={(e) => setCfg((c) => ({ ...c, drums: e.target.value as DrumPatternId }))}>
              {DRUM_PATTERNS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button className={`btn icon${showMixer ? ' on' : ''}`} onClick={() => setShowMixer((v) => !v)} title="Ses ve görünüm ayarları" aria-label="Ses ayarları">
            <SlidersHorizontal size={17} />
          </button>
          {!compact && (
            <button className={`btn icon${showTrainer || cfg.trainer.enabled ? ' on' : ''}`} onClick={() => setShowTrainer((v) => !v)} title="Hız antrenörü" aria-label="Hız antrenörü">
              <TrendingUp size={17} />
            </button>
          )}
          <button
            className={`btn icon${waitMode ? ' on' : ''}`}
            onClick={() => {
              player.stop();
              setWaitMode((v) => !v);
            }}
            title="Mikrofonla takip: doğru notayı çaldıkça ilerler"
            aria-label="Mikrofonla takip"
          >
            <Ear size={17} />
          </button>
        </div>
      </div>

      {showMixer && (
        <div className="player-panel">
          <div className="field">
            <label>Gitar</label>
            <Slider value={cfg.guitarVol} min={0} max={1.5} step={0.05} onChange={(v) => setCfg((c) => ({ ...c, guitarVol: v }))} ariaLabel="Gitar seviyesi" />
          </div>
          <div className="field">
            <label>Davul</label>
            <Slider value={cfg.drumVol} min={0} max={1.5} step={0.05} onChange={(v) => setCfg((c) => ({ ...c, drumVol: v }))} ariaLabel="Davul seviyesi" />
          </div>
          <div className="field">
            <label>Metronom</label>
            <Slider value={cfg.clickVol} min={0} max={1.5} step={0.05} onChange={(v) => setCfg((c) => ({ ...c, clickVol: v }))} ariaLabel="Metronom seviyesi" />
          </div>
          <div className="field">
            <label>Gitar tonu</label>
            <Segmented value={globalTone} options={(['clean', 'crunch', 'distortion'] as ToneId[]).map((t) => ({ value: t, label: TONE_LABELS[t] }))} onChange={(t) => setSettings({ tone: t })} />
          </div>
          <div className="field">
            <label>Tab boyutu</label>
            <div className="row nowrap">
              <button className="btn icon sm" onClick={() => setSettings({ tabZoom: Math.max(34, zoom - 6) })} aria-label="Küçült">
                <ZoomOut size={15} />
              </button>
              <button className="btn icon sm" onClick={() => setSettings({ tabZoom: Math.min(90, zoom + 6) })} aria-label="Büyüt">
                <ZoomIn size={15} />
              </button>
              <Switch checked={showRhythm} onChange={(v) => setSettings({ showRhythm: v })} label="Ritim" />
            </div>
          </div>
          <div className="field">
            <label>Tempo</label>
            <Slider value={cfg.bpm} min={Math.max(20, Math.round(originalBpm * 0.25))} max={Math.round(originalBpm * 1.5)} onChange={setBpm} ariaLabel="Tempo" />
          </div>
        </div>
      )}

      {showTrainer && !compact && (
        <div className="player-panel trainer">
          <Switch checked={cfg.trainer.enabled} onChange={(v) => setCfg((c) => ({ ...c, loop: true, trainer: { ...c.trainer, enabled: v, target: c.trainer.target || originalBpm } }))} label="Hız antrenörü açık" />
          <div className="row small">
            Her
            <input className="input mini" type="number" min={1} max={16} value={cfg.trainer.everyPasses} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, everyPasses: Math.max(1, +e.target.value || 1) } }))} />
            turda
            <input className="input mini" type="number" min={1} max={30} value={cfg.trainer.increment} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, increment: Math.max(1, +e.target.value || 1) } }))} />
            BPM artır, hedef
            <input className="input mini" type="number" min={30} max={300} value={cfg.trainer.target} onChange={(e) => setCfg((c) => ({ ...c, trainer: { ...c.trainer, target: Math.max(30, +e.target.value || originalBpm) } }))} />
            BPM
          </div>
          <span className="muted small">Yavaş başla; her tur temiz çıkıyorsa tempo kendiliğinden artar. Orijinal tempo: {originalBpm} BPM.</span>
        </div>
      )}

      {sections.length > 1 && (
        <div className="player-sections">
          <button className={`chip${sectionSel === 'all' && !selection ? ' active' : ''}`} onClick={() => (setSectionSel('all'), setSelection(null))}>
            Tümü
          </button>
          {sections.map((s, i) => (
            <button key={i} className={`chip${sectionSel === i && !selection ? ' active' : ''}`} onClick={() => (setSectionSel(i), setSelection(null))}>
              {s.name}
              {s.repeat && s.repeat > 1 ? <span className="muted">×{s.repeat}</span> : null}
            </button>
          ))}
        </div>
      )}

      <div className="player-status">
        {countIn !== null ? (
          <span className="countin">{countIn}</span>
        ) : (
          <span className="muted small">
            {playing && active ? `${sections.length > 1 ? `${sections[active.section].name} · ` : ''}Ölçü ${active.measure + 1}` : startAt ? `Başlangıç: ölçü ${startAt.measure + 1}` : 'Bir ölçüye tıklayarak oradan başlat.'}
            {cfg.loop && passes > 0 ? ` · ${passes + 1}. tur` : ''}
          </span>
        )}
        <span className="spacer" />
        {selection ? (
          <span className="tag accent">
            Döngü: ölçü {Math.min(selection.from, selection.to) + 1}–{Math.max(selection.from, selection.to) + 1}
            <button className="tag-x" onClick={clearSelection} aria-label="Döngü aralığını temizle">
              <X size={12} />
            </button>
          </span>
        ) : (
          <button className={`chip${rangeMode ? ' active' : ''}`} onClick={() => setRangeMode((v) => !v)} title="Ölçülere tıklayarak döngü aralığı seç (ya da Shift+tık)">
            Aralık seç
          </button>
        )}
        {riffId && (
          <button className="chip" onClick={markClean} title="Bu tempoda hatasız çalabildiysen kaydet">
            <CircleCheck size={14} /> {cfg.bpm} BPM'de temiz çaldım
          </button>
        )}
      </div>

      {waitMode && <WaitModePanel seqEvents={seq.events} tuning={tuning} onActive={setActive} onClose={() => setWaitMode(false)} loop={cfg.loop} />}

      <div className="player-tabs">
        {sections.map((s, i) => (
          <div key={i} className={`tab-section${(sectionSel === 'all' || sectionSel === i) && !(selection && selection.section !== i) ? '' : ' dim'}`}>
            {(sections.length > 1 || s.note) && (
              <div className="tab-section-head">
                {sections.length > 1 && <h4>{s.name}</h4>}
                {s.repeat && s.repeat > 1 ? <span className="tag">×{s.repeat} tekrar</span> : null}
                {s.note && <span className="muted small">{s.note}</span>}
              </div>
            )}
            <TabView
              tab={s.tab}
              tuning={tuning}
              naming={naming}
              timeSig={timeSig}
              beatWidth={compact ? Math.min(zoom, 48) : zoom}
              showRhythm={showRhythm}
              compact={compact}
              active={active && active.section === i ? ({ m: active.measure, e: active.event } as ActiveRef) : null}
              selection={selection && selection.section === i ? { from: selection.from, to: selection.to } : startAt && startAt.section === i && !playing ? { from: startAt.measure, to: startAt.measure } : null}
              onMeasureClick={(m, shift) => onMeasureClick(i, m, shift)}
            />
          </div>
        ))}
      </div>

      {showFretboard && (
        <Fretboard tuning={tuning} frets={Math.max(12, Math.min(24, maxFret + 3))} marks={fretMarks} naming={naming} leftHanded={leftHanded} compact={compact} />
      )}
    </div>
  );
}

/* ---------------- Mikrofonla takip (bekleme modu) ---------------- */

function playableIndices(events: SeqEvent[]) {
  return events.map((e, i) => (!e.tie && e.notes.some((n) => !n.dead) ? i : -1)).filter((i) => i >= 0);
}

function WaitModePanel({
  seqEvents,
  tuning,
  onActive,
  onClose,
  loop,
}: {
  seqEvents: SeqEvent[];
  tuning: number[];
  onActive: (r: (MeasureRef & { event: number }) | null) => void;
  onClose: () => void;
  loop: boolean;
}) {
  const naming = useSettings((s) => s.naming);
  const a4 = useSettings((s) => s.a4);
  const deviceId = useSettings((s) => s.micDeviceId);
  const indices = useMemo(() => playableIndices(seqEvents), [seqEvents]);
  const [pos, setPos] = useState(0);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'hit' | 'miss'; text: string } | null>(null);
  const [stats, setStats] = useState({ hit: 0, miss: 0, laps: 0 });
  const [level, setLevel] = useState(0);
  const posRef = useRef(0);
  posRef.current = pos;

  const current = seqEvents[indices[pos]];

  useEffect(() => {
    if (current) onActive(current.ref);
    return () => onActive(null);
  }, [current, onActive]);

  useEffect(() => () => sharedMic.stop(), []);

  const advance = useCallback(() => {
    setPos((p) => {
      if (p + 1 < indices.length) return p + 1;
      setStats((s) => ({ ...s, laps: s.laps + 1 }));
      toast(loop ? 'Tur tamamlandı! Baştan devam.' : 'Riff bitti — tebrikler!');
      return 0;
    });
  }, [indices.length, loop]);

  useEffect(() => {
    if (!listening) return;
    const detector = new OnsetDetector(1.8, 0.08);
    let armedAt = -1;
    let frameNo = 0;
    // requestAnimationFrame arka planda yavaşlar; algılama için Worker zamanlayıcısı kullan
    const loopFn = () => {
      const t = performance.now() / 1000;
      const f = sharedMic.read();
      if (frameNo++ % 3 === 0) setLevel(Math.min(1, f.level * 8));
      if (detector.feed(t, f.recent, sharedMic.gate)) armedAt = t;
      if (armedAt > 0) {
        const ev = seqEvents[indices[posRef.current]];
        if (f.pitch && f.pitch.clarity > 0.75 && ev) {
          const midi = freqToMidi(f.pitch.freq, a4);
          const pc = mod12(midi);
          const targets = new Set(ev.notes.filter((n) => !n.dead).map((n) => mod12(n.midi)));
          if (targets.has(pc)) {
            setFeedback({ kind: 'hit', text: `Doğru! (${noteName(Math.round(midi), naming)})` });
            setStats((s) => ({ ...s, hit: s.hit + 1 }));
            armedAt = -1;
            advance();
          } else if (t - armedAt > 0.12) {
            setFeedback({ kind: 'miss', text: `Duyulan: ${noteName(Math.round(midi), naming)} — tekrar dene` });
            setStats((s) => ({ ...s, miss: s.miss + 1 }));
            armedAt = -1;
          }
        } else if (t - armedAt > 0.35) armedAt = -1;
      }
    };
    const ticker = createTicker(16, loopFn);
    return () => ticker.stop();
  }, [listening, seqEvents, indices, a4, naming, advance]);

  const startMic = async () => {
    setError(null);
    try {
      await sharedMic.start(deviceId || undefined);
      setListening(true);
    } catch (e) {
      setError(e instanceof Error && e.name === 'NotAllowedError' ? 'Mikrofon izni verilmedi. Tarayıcı adres çubuğundan izin verebilirsin.' : 'Mikrofon başlatılamadı. Bir ses girişi bağlı mı?');
    }
  };
  const stopMic = () => {
    sharedMic.stop();
    setListening(false);
  };

  const describe = (ev: SeqEvent | undefined) => {
    if (!ev) return '—';
    const notes = ev.notes.filter((n) => !n.dead);
    const fr = notes.map((n) => `${n.string}. tel ${n.midi - tuning[tuning.length - n.string]}. perde`).join(' + ');
    const names = [...new Set(notes.map((n) => noteName(n.midi, naming)))].join(' · ');
    return `${names}  —  ${fr}`;
  };

  const total = stats.hit + stats.miss;
  return (
    <div className="wait-panel">
      <div className="wait-head">
        <Gauge size={18} />
        <strong>Mikrofonla takip</strong>
        <span className="muted small">Doğru notayı çaldığında imleç ilerler. Akorlarda kök nota yeterli.</span>
        <span className="spacer" />
        <button className="btn icon sm ghost" onClick={onClose} aria-label="Kapat">
          <X size={16} />
        </button>
      </div>
      <div className="wait-body">
        <div className="wait-target">
          <div className="label">Sıradaki ({pos + 1}/{indices.length})</div>
          <div className="wait-note">{describe(current)}</div>
          {feedback && <div className={`wait-feedback ${feedback.kind}`}>{feedback.text}</div>}
        </div>
        <div className="wait-meter" title="Giriş seviyesi">
          <span style={{ width: `${level * 100}%` }} />
        </div>
        <div className="row">
          {listening ? (
            <button className="btn" onClick={stopMic}>
              <MicOff size={16} /> Mikrofonu durdur
            </button>
          ) : (
            <button className="btn primary" onClick={() => void startMic()}>
              <Mic size={16} /> Mikrofonu başlat
            </button>
          )}
          <button className="btn" onClick={() => current && current.notes.filter((n) => !n.dead).forEach((n, i) => pluckNow(n.midi, { delay: i * 0.01, art: current.pm ? 'pm' : 'normal' }))} title="Hedef notayı dinle">
            <Headphones size={16} /> Dinle
          </button>
          <button className="btn" onClick={advance} title="Bu notayı atla">
            <SkipForward size={16} /> Atla
          </button>
          <button className="btn" onClick={() => (setPos(0), setStats({ hit: 0, miss: 0, laps: 0 }), setFeedback(null))}>
            <RotateCcw size={16} /> Baştan
          </button>
          <span className="spacer" />
          <span className="small muted">
            İsabet: <b className="ok">{stats.hit}</b> · Hata: <b style={{ color: 'var(--danger)' }}>{stats.miss}</b>
            {total > 0 && ` · %${Math.round((stats.hit / total) * 100)}`}
            {stats.laps > 0 && ` · ${stats.laps} tur`}
          </span>
        </div>
        {error && <div className="callout warn small">{error}</div>}
      </div>
    </div>
  );
}
