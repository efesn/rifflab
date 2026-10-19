import { useEffect, useMemo, useRef, useState } from 'react';
import { Dumbbell, Pause, Play, SkipForward, SkipBack, Flag, CircleCheck, Gauge, Clock, Trophy, Music } from 'lucide-react';
import { Link } from '../router';
import { ROUTINE_TEMPLATES, buildRoutine, type RoutineBlock } from '../data/routines';
import { allRiffs, findRiff, parseRiff } from '../data/riffs';
import { TUNINGS } from '../data/tunings';
import { LESSONS } from '../data/lessons';
import { useProgress } from '../store/progress';
import { blockElapsed, useRoutine } from '../store/routine';
import { useTimer } from '../store/timer';
import { TabPlayerPanel } from '../components/TabPlayerPanel';
import { Callout, toast } from '../components/ui';
import { playClick } from '../audio/clicks';
import { engine } from '../audio/engine';
import { formatClock, formatDuration } from '../lib/format';
import './routine.css';

function chime() {
  try {
    const t = engine.ctx.currentTime + 0.02;
    playClick('cowbell', 2, t, engine.refBus, 1.4);
    playClick('cowbell', 2, t + 0.18, engine.refBus, 1.4);
  } catch {
    /* ses kapalı */
  }
}

function BlockContent({ block }: { block: RoutineBlock }) {
  const custom = useProgress((s) => s.custom);
  const riff = block.riffId ? findRiff(block.riffId, custom) : undefined;
  const parsed = useMemo(() => (riff ? parseRiff(riff) : null), [riff]);
  if (block.kind === 'tune') {
    return (
      <div className="stack">
        <Link to="/akort" className="btn primary lg" style={{ alignSelf: 'flex-start' }}>
          <Gauge size={18} /> Akort cihazını aç
        </Link>
        <p className="small muted">Akort sayfasına geçsen de antrenman sayacı çalışmaya devam eder; işin bitince bu sayfaya dön.</p>
      </div>
    );
  }
  if (block.kind === 'free') {
    return (
      <div className="stack">
        <p className="text-2">Fikir lazımsa:</p>
        <ul className="text-2" style={{ margin: 0 }}>
          <li>Bugün çalıştığın riffi davulla, orijinal tempoya ne kadar yaklaşabildiğine bak.</li>
          <li>A minör pentatonikle "Rock" davuluna doğaçlama yap.</li>
          <li>Sevdiğin bir şarkının tabını bul ve Tab Stüdyosu'na yapıştır.</li>
        </ul>
        <div className="row">
          <Link to="/riffler" className="btn">
            <Music size={16} /> Riff kütüphanesi
          </Link>
          <Link to="/studyo" className="btn">
            Tab Stüdyosu
          </Link>
        </div>
      </div>
    );
  }
  if (!riff || !parsed) return <p className="muted">Bu blok için riff bulunamadı.</p>;
  return (
    <div className="stack">
      <div className="row">
        <Link to={`/riffler/${riff.id}`} className="routine-riff-title">
          {riff.title}
        </Link>
        <span className="muted small">{riff.artist}</span>
        {riff.tuning !== 'standard' && <span className="tag warn">{TUNINGS[riff.tuning].name}</span>}
      </div>
      <TabPlayerPanel
        sections={parsed.sections}
        tuning={TUNINGS[riff.tuning].notes}
        timeSig={riff.timeSig}
        bpm={riff.bpm}
        startBpm={riff.startBpm}
        drums={riff.drums}
        riffId={riff.id}
        compact
        showFretboard={false}
      />
    </div>
  );
}

export function RoutinePage() {
  const routine = useRoutine();
  const progress = useProgress((s) => s.riffs);
  const lessons = useProgress((s) => s.lessons);
  const custom = useProgress((s) => s.custom);
  const addSession = useProgress((s) => s.addSession);
  const [, tick] = useState(0);
  const notified = useRef(-1);

  const lessonsDone = LESSONS.filter((l) => lessons[l.id]?.completed).length;
  const riffs = useMemo(() => allRiffs(custom), [custom]);
  const previews = useMemo(() => ROUTINE_TEMPLATES.map((t) => ({ t, blocks: buildRoutine(t.id, riffs, progress, lessonsDone) })), [riffs, progress, lessonsDone]);

  const active = !!routine.templateId && !routine.finished;
  const running = active && !!routine.blockStartedAt;
  const block = routine.blocks[routine.index];
  const elapsed = active ? blockElapsed(routine) : 0;
  const blockTotal = (block?.minutes ?? 0) * 60;
  const remaining = Math.max(0, blockTotal - elapsed);
  const totalPlanned = routine.blocks.reduce((a, b) => a + b.minutes * 60, 0);
  const doneBefore = routine.blocks.slice(0, routine.index).reduce((a, b) => a + b.minutes * 60, 0);
  const overall = totalPlanned ? Math.min(1, (doneBefore + Math.min(elapsed, blockTotal)) / totalPlanned) : 0;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [running]);

  // Blok süresi dolunca otomatik ilerle
  useEffect(() => {
    if (!running || !block) return;
    if (elapsed >= blockTotal && notified.current !== routine.index) {
      notified.current = routine.index;
      chime();
      const next = routine.blocks[routine.index + 1];
      toast(next ? `Süre doldu! Sıradaki: ${next.title}` : 'Antrenman tamamlandı!');
      routine.goTo(routine.index + 1);
    }
  });

  // Bitince oturumu kaydet
  useEffect(() => {
    if (routine.finished && !routine.logged && routine.templateId) {
      routine.markLogged();
      const secs = routine.totalAccum / 1000;
      if (secs >= 30 && !useTimer.getState().running) addSession({ seconds: secs, kind: 'routine', ref: routine.templateId });
    }
  }, [routine, addSession]);

  if (routine.finished && routine.templateId) {
    const secs = routine.totalAccum / 1000;
    return (
      <div className="routine-done card">
        <Trophy size={54} className="accent" />
        <h1>Antrenman tamamlandı!</h1>
        <p className="text-2">
          {formatDuration(secs)} boyunca {routine.blocks.length} blok çalıştın. Düzenli pratik, yeteneğin en büyük kaynağıdır — yarın görüşmek üzere. 🤘
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={routine.reset}>
            Yeni antrenman
          </button>
          <Link to="/ilerleme" className="btn">
            İlerlemeni gör
          </Link>
        </div>
      </div>
    );
  }

  if (!active) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="eyebrow">
              <Dumbbell size={14} /> Günlük antrenman
            </div>
            <h1>Bugünün Programı</h1>
            <p className="subtitle">Bir süre seç: RiffLab ısınmadan riff çalışmasına kadar her bloğu zamanlar, süre dolunca seni bir sonrakine geçirir. Riffler ilerlemene göre seçilir.</p>
          </div>
        </div>
        <div className="grid grid-3">
          {previews.map(({ t, blocks }) => (
            <div key={t.id} className={`card routine-template${t.id === 'standart' ? ' featured' : ''}`}>
              <div className="routine-min">
                {t.minutes}
                <small>dk</small>
              </div>
              <div className="card-title">{t.name}</div>
              <p className="small muted">{t.desc}</p>
              <ol className="routine-preview">
                {blocks.map((b, i) => {
                  const r = b.riffId ? findRiff(b.riffId, custom) : undefined;
                  return (
                    <li key={i}>
                      <span>{b.title}</span>
                      <span className="muted">{r ? r.title : ''}</span>
                      <span className="mono small">{b.minutes}′</span>
                    </li>
                  );
                })}
              </ol>
              <button
                className={`btn ${t.id === 'standart' ? 'primary' : ''}`}
                onClick={async () => {
                  await engine.resume();
                  notified.current = -1;
                  routine.start(t.id, blocks);
                }}
              >
                <Play size={16} /> Başlat
              </button>
            </div>
          ))}
        </div>
        <Callout tone="tip" title="Neden zamanlı program?">
          <p className="small">Ne çalışacağına karar vermek bile enerji harcatır. Program, her gün tüm temel becerilere biraz dokunmanı sağlar: ısınma sakatlığı önler, teknik blok temeli güçlendirir, riff bloğu ise motivasyonu yüksek tutar.</p>
        </Callout>
      </div>
    );
  }

  return (
    <div className="routine-run">
      <div className="routine-top card">
        <div className="routine-progress">
          <div className="bar">
            <span style={{ width: `${overall * 100}%` }} />
          </div>
          <div className="small muted">
            Blok {routine.index + 1}/{routine.blocks.length} · toplam %{Math.round(overall * 100)}
          </div>
        </div>
        <div className="routine-steps">
          {routine.blocks.map((b, i) => (
            <button key={i} className={`routine-step${i === routine.index ? ' current' : ''}${i < routine.index ? ' done' : ''}`} onClick={() => routine.goTo(i)} title={b.title}>
              {i < routine.index ? <CircleCheck size={14} /> : i + 1}
              <span>{b.title}</span>
            </button>
          ))}
        </div>
      </div>

      {block && (
        <div className="card routine-block">
          <div className="routine-block-head">
            <div>
              <div className="eyebrow">
                <Clock size={13} /> {block.minutes} dakika
              </div>
              <h2>{block.title}</h2>
              <p className="text-2">{block.desc}</p>
            </div>
            <div className={`routine-clock${remaining < 10 && running ? ' ending' : ''}`}>
              <div className="mono">{formatClock(remaining)}</div>
              <div className="routine-clock-bar">
                <span style={{ width: `${Math.min(100, (elapsed / blockTotal) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="row">
            <button className="btn icon" onClick={() => routine.goTo(routine.index - 1)} disabled={routine.index === 0} aria-label="Önceki blok">
              <SkipBack size={16} />
            </button>
            {running ? (
              <button className="btn" onClick={routine.pause}>
                <Pause size={16} /> Duraklat
              </button>
            ) : (
              <button className="btn primary" onClick={routine.resume}>
                <Play size={16} /> Devam et
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                notified.current = routine.index;
                routine.goTo(routine.index + 1);
              }}
            >
              <SkipForward size={16} /> Sonraki blok
            </button>
            <span className="spacer" />
            <button className="btn ghost" onClick={routine.finish}>
              <Flag size={16} /> Bitir
            </button>
          </div>
          <div className="divider" />
          <BlockContent key={`${routine.index}-${block.riffId ?? block.kind}`} block={block} />
        </div>
      )}
    </div>
  );
}
