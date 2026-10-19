import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, CircleCheck, Clock, Target, Volume2, ExternalLink } from 'lucide-react';
import { Link, navigate } from '../router';
import { LESSONS, getLesson } from '../data/lessons';
import type { LessonBlock } from '../data/lessons/types';
import { useProgress } from '../store/progress';
import { useSettings } from '../store/settings';
import { Markdown } from '../components/Markdown';
import { Callout, toast } from '../components/ui';
import { TabPlayerPanel } from '../components/TabPlayerPanel';
import { ChordDiagram } from '../components/ChordDiagram';
import { Fretboard, type FretMark } from '../components/Fretboard';
import { RiffCard } from './LibraryPage';
import { getChord, chordMidis } from '../data/chords';
import { getScale } from '../data/scales';
import { TUNINGS } from '../data/tunings';
import { findRiff } from '../data/riffs';
import { parseDsl } from '../tab/dsl';
import type { TimeSig } from '../tab/types';
import { pluckNow, strumNow } from '../audio/guitar';
import { engine } from '../audio/engine';
import { mod12, noteName, pcName, INTERVAL_NAMES } from '../lib/music';
import './lessons.css';
import './library.css';

function TabBlock({ block }: { block: Extract<LessonBlock, { type: 'tab' }> }) {
  const tuning = TUNINGS[block.tuning ?? 'standard'];
  const ts = useMemo<TimeSig>(() => block.timeSig ?? [4, 4], [block.timeSig]);
  const sections = useMemo(() => [{ name: block.title ?? 'Egzersiz', tab: parseDsl(block.tab, { tuning: tuning.notes, timeSig: ts }) }], [block.tab, block.title, tuning, ts]);
  return (
    <div className="lesson-tab">
      {block.title && (
        <div className="lesson-tab-title">
          {block.title}
          {block.tuning && block.tuning !== 'standard' && <span className="tag warn">{tuning.name}</span>}
        </div>
      )}
      <TabPlayerPanel sections={sections} tuning={tuning.notes} timeSig={ts} bpm={block.bpm} startBpm={block.startBpm} drums={block.drums} tone={block.tone} compact showFretboard />
      {block.note && <p className="small muted mt-1">{block.note}</p>}
    </div>
  );
}

function ChordsBlock({ ids, caption }: { ids: string[]; caption?: string }) {
  const naming = useSettings((s) => s.naming);
  return (
    <div className="lesson-chords">
      <div className="chord-strip">
        {ids.map((id) => {
          const c = getChord(id);
          if (!c) return null;
          const tuning = TUNINGS[c.tuning ?? 'standard'].notes;
          return (
            <button
              key={id}
              className="chord-mini"
              onClick={async () => {
                await engine.resume();
                strumNow(chordMidis(c.shape, tuning));
              }}
              title={`${c.full} — dinlemek için tıkla`}
            >
              <div className="chord-mini-name">{c.name}</div>
              <ChordDiagram shape={c.shape} size={0.85} highlightRoot={c.rootIndex} />
              <div className="tiny muted">{chordMidis(c.shape, tuning).map((m) => noteName(m, naming)).join(' ')}</div>
            </button>
          );
        })}
      </div>
      {caption && <p className="small muted">{caption}</p>}
    </div>
  );
}

function ScaleBlock({ block }: { block: Extract<LessonBlock, { type: 'scale' }> }) {
  const naming = useSettings((s) => s.naming);
  const tuning = TUNINGS.standard.notes;
  const scale = getScale(block.scale);
  const from = block.from ?? 0;
  const to = block.to ?? 12;
  const marks: FretMark[] = [];
  for (let s = 1; s <= 6; s++) {
    for (let f = from; f <= to; f++) {
      const midi = tuning[6 - s] + f;
      const iv = mod12(midi - block.root);
      if (scale.intervals.includes(iv)) marks.push({ string: s, fret: f, label: pcName(midi, naming), kind: iv === 0 ? 'root' : 'note' });
    }
  }
  return (
    <div className="lesson-figure">
      <Fretboard
        tuning={tuning}
        frets={Math.max(12, to + 2)}
        marks={marks}
        naming={naming}
        dimFrets={[from, to]}
        onFretClick={async (s, f) => {
          await engine.resume();
          pluckNow(tuning[6 - s] + f);
        }}
      />
      <p className="small muted">
        {block.caption ?? `${pcName(block.root, naming)} ${scale.name}`} · Aralıklar: {scale.intervals.map((i) => INTERVAL_NAMES[i].short).join(' – ')}
      </p>
    </div>
  );
}

function TonesBlock({ block }: { block: Extract<LessonBlock, { type: 'tones' }> }) {
  const naming = useSettings((s) => s.naming);
  const t = TUNINGS[block.tuning];
  return (
    <div className="lesson-figure">
      <div className="tone-buttons">
        {t.notes.map((m, i) => (
          <button
            key={i}
            className="btn"
            onClick={async () => {
              await engine.resume();
              pluckNow(m, { duration: 2.5 });
            }}
          >
            <Volume2 size={15} />
            <b>{6 - i}.</b> {noteName(m, naming, true)}
          </button>
        ))}
        <button
          className="btn ghost"
          onClick={async () => {
            await engine.resume();
            t.notes.forEach((m, i) => pluckNow(m, { delay: i * 0.45, duration: 1.2 }));
          }}
        >
          Hepsini çal
        </button>
      </div>
      {block.caption && <p className="small muted">{block.caption}</p>}
    </div>
  );
}

function Block({ block }: { block: LessonBlock }) {
  const naming = useSettings((s) => s.naming);
  const custom = useProgress((s) => s.custom);
  switch (block.type) {
    case 'md':
      return <Markdown text={block.text} />;
    case 'tip':
      return (
        <Callout tone={block.tone ?? 'info'} title={block.title}>
          <p>{block.text}</p>
        </Callout>
      );
    case 'tab':
      return <TabBlock block={block} />;
    case 'chords':
      return <ChordsBlock ids={block.ids} caption={block.caption} />;
    case 'scale':
      return <ScaleBlock block={block} />;
    case 'tones':
      return <TonesBlock block={block} />;
    case 'fretboard': {
      const tuning = TUNINGS[block.tuning ?? 'standard'].notes;
      return (
        <div className="lesson-figure">
          <Fretboard
            tuning={tuning}
            frets={block.frets ?? 12}
            marks={block.marks.map((m) => ({ ...m, label: m.label ? pcName(tuning[6 - m.string] + m.fret, naming) : undefined }))}
            naming={naming}
            onFretClick={async (s, f) => {
              await engine.resume();
              pluckNow(tuning[6 - s] + f);
            }}
          />
          {block.caption && <p className="small muted">{block.caption}</p>}
        </div>
      );
    }
    case 'link':
      return (
        <Link to={block.to} className="lesson-link">
          <ExternalLink size={18} />
          <span>
            <b>{block.label}</b>
            {block.desc && <span className="small muted"> — {block.desc}</span>}
          </span>
          <ArrowRight size={16} className="spacer-left" />
        </Link>
      );
    case 'riffs': {
      const riffs = block.ids.map((id) => findRiff(id, custom)).filter((r): r is NonNullable<typeof r> => !!r);
      if (!riffs.length) return null;
      return (
        <div className="lesson-figure">
          <h3 className="section-title" style={{ marginTop: 10 }}>
            {block.caption ?? 'Bu konuyu çalıştıran riffler'}
          </h3>
          <div className="grid grid-auto">
            {riffs.map((r) => (
              <RiffCard key={r.id} riff={r} />
            ))}
          </div>
        </div>
      );
    }
  }
}

export function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const progress = useProgress((s) => (lesson ? s.lessons[lesson.id] : undefined));
  const setCheck = useProgress((s) => s.setLessonCheck);
  const setCompleted = useProgress((s) => s.setLessonCompleted);
  const addSession = useProgress((s) => s.addSession);

  if (!lesson) {
    return (
      <div className="empty">
        <h2>Ders bulunamadı</h2>
        <Link to="/dersler" className="accent">
          Derslere dön
        </Link>
      </div>
    );
  }
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const checks = progress?.checks ?? {};
  const allChecked = lesson.checklist.every((_, i) => checks[i]);

  const complete = () => {
    const was = progress?.completed;
    setCompleted(lesson.id, !was);
    if (!was) {
      addSession({ seconds: 60, kind: 'lesson', ref: lesson.id, note: `${lesson.num}. ders tamamlandı` });
      toast(`${lesson.num}. ders tamamlandı! 🤘`);
      if (next) window.setTimeout(() => navigate(`/dersler/${next.id}`), 900);
    }
  };

  return (
    <div className="lesson-page">
      <Link to="/dersler" className="back-link">
        <ArrowLeft size={15} /> Tüm dersler
      </Link>
      <div className="lesson-hero">
        <div className="lesson-hero-num">{lesson.num}</div>
        <div>
          <div className="eyebrow">
            {lesson.level} · <Clock size={13} /> {lesson.minutes} dk
          </div>
          <h1>{lesson.title}</h1>
          <p className="subtitle">{lesson.subtitle}</p>
        </div>
      </div>

      <div className="card goals">
        <div className="card-title">
          <Target size={17} color="var(--accent)" /> Bu derste
        </div>
        <ul>
          {lesson.goals.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </div>

      <div className="lesson-content">
        {lesson.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      <div className="card checklist">
        <div className="card-title">
          <CircleCheck size={18} color="var(--ok)" /> Kontrol listesi
        </div>
        <p className="small muted">Dersi tamamlamadan önce bunları yapabildiğinden emin ol.</p>
        {lesson.checklist.map((c, i) => (
          <label key={i} className={`check-item${checks[i] ? ' on' : ''}`}>
            <input type="checkbox" checked={!!checks[i]} onChange={(e) => setCheck(lesson.id, i, e.target.checked)} />
            <span>{c}</span>
          </label>
        ))}
        <div className="row mt-2">
          <button className={`btn ${progress?.completed ? 'ok' : 'primary'}`} onClick={complete} disabled={!allChecked && !progress?.completed}>
            <CircleCheck size={17} /> {progress?.completed ? 'Tamamlandı' : 'Dersi tamamla'}
          </button>
          {!allChecked && !progress?.completed && <span className="small muted">Tüm maddeleri işaretleyince açılır.</span>}
        </div>
      </div>

      <div className="lesson-nav">
        {prev ? (
          <Link to={`/dersler/${prev.id}`} className="btn">
            <ArrowLeft size={16} /> {prev.num}. {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dersler/${next.id}`} className="btn">
            {next.num}. {next.title} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
