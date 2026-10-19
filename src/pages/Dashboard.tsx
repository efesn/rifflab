import { useMemo, useState } from 'react';
import { Flame, Gauge, Metronome, Dumbbell, FileMusic, GraduationCap, Clock, Trophy, Lightbulb, PlayCircle, ArrowRight, Guitar, Target } from 'lucide-react';
import { Link } from '../router';
import { useProgress } from '../store/progress';
import { useSettings } from '../store/settings';
import { LESSONS } from '../data/lessons';
import { allRiffs } from '../data/riffs';
import { lastNDays, streak, todaySeconds, totalSeconds } from '../lib/stats';
import { formatDuration, formatWeekday, greeting } from '../lib/format';
import { BarChart, ProgressRing, Segmented, Difficulty } from '../components/ui';
import { tipOfTheDay } from '../data/tips';
import { RiffCard } from './LibraryPage';
import './dashboard.css';

function Onboarding() {
  const set = useSettings((s) => s.set);
  const goal = useSettings((s) => s.dailyGoal);
  const [name, setName] = useState('');
  return (
    <div className="card onboarding">
      <div className="onboarding-glow" />
      <div className="eyebrow">
        <Guitar size={14} /> Hoş geldin
      </div>
      <h2>Elektro gitar yolculuğun burada başlıyor 🤘</h2>
      <p className="text-2">RiffLab; akort cihazı, metronom, oynatılabilir tablar, adım adım dersler ve Rammstein riff'leriyle günlük çalışmanı tek yerde toplar. Başlamadan önce iki küçük şey:</p>
      <div className="grid grid-2 mt-2">
        <div className="field">
          <label>Sana nasıl hitap edelim? (isteğe bağlı)</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın" maxLength={24} />
        </div>
        <div className="field">
          <label>Günlük pratik hedefin</label>
          <Segmented
            value={goal}
            onChange={(v) => set({ dailyGoal: v })}
            options={[10, 20, 30, 45, 60].map((m) => ({ value: m, label: `${m} dk` }))}
          />
        </div>
      </div>
      <ol className="onboarding-steps">
        <li>
          <b>Gitarını akort et</b> — <Link to="/akort" className="accent">Akort cihazı</Link> mikrofonunu kullanır.
        </li>
        <li>
          <b>İlk dersi aç</b> — <Link to="/dersler/gitarini-tani" className="accent">Gitarını Tanı</Link> ile başla.
        </li>
        <li>
          <b>Her gün biraz çal</b> — üstteki sayaç pratik süreni kaydeder; seri (streak) tut!
        </li>
      </ol>
      <button className="btn primary mt-2" onClick={() => set({ onboarded: true, name: name.trim() })}>
        Başlayalım
      </button>
    </div>
  );
}

export function Dashboard() {
  const sessions = useProgress((s) => s.sessions);
  const lessons = useProgress((s) => s.lessons);
  const riffProgress = useProgress((s) => s.riffs);
  const custom = useProgress((s) => s.custom);
  const { name, dailyGoal, onboarded } = useSettings();

  const today = todaySeconds(sessions);
  const st = streak(sessions);
  const total = totalSeconds(sessions);
  const days = lastNDays(sessions, 14);
  const doneLessons = LESSONS.filter((l) => lessons[l.id]?.completed).length;
  const nextLesson = LESSONS.find((l) => !lessons[l.id]?.completed);
  const riffs = useMemo(() => allRiffs(custom), [custom]);
  const mastered = riffs.filter((r) => riffProgress[r.id]?.status === 'mastered').length;

  const riffOfDay = useMemo(() => {
    const maxDiff = Math.min(5, 1 + Math.floor(doneLessons / 3));
    const pool = riffs.filter((r) => r.category !== 'custom' && r.difficulty <= maxDiff && riffProgress[r.id]?.status !== 'mastered');
    if (!pool.length) return riffs[0];
    const d = new Date();
    const idx = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % pool.length;
    return pool[idx];
  }, [riffs, riffProgress, doneLessons]);

  const recent = useMemo(
    () =>
      riffs
        .filter((r) => riffProgress[r.id]?.lastPracticed)
        .sort((a, b) => (riffProgress[b.id]!.lastPracticed ?? '').localeCompare(riffProgress[a.id]!.lastPracticed ?? ''))
        .slice(0, 3),
    [riffs, riffProgress],
  );

  const goalPct = today / 60 / dailyGoal;

  return (
    <div className="dashboard">
      {!onboarded && <Onboarding />}

      <div className="dash-hero">
        <div>
          <div className="eyebrow">
            <Flame size={14} /> {greeting()}
            {name ? `, ${name}` : ''}
          </div>
          <h1>{goalPct >= 1 ? 'Bugünün hedefi tamam!' : today > 0 ? 'Devam, iyi gidiyorsun.' : 'Bugün çalmaya hazır mısın?'}</h1>
          <p className="subtitle">{goalPct >= 1 ? 'Harika iş. İstersen yeni bir riff dene ya da dinlen — ikisi de gelişimin parçası.' : `Günlük hedefin ${dailyGoal} dakika. Akort et, ısın ve bir riff seç.`}</p>
        </div>
        <Link to="/antrenman" className="btn primary lg">
          <Dumbbell size={18} /> Antrenmanı başlat
        </Link>
      </div>

      <div className="grid grid-4">
        <div className="card stat-card">
          <ProgressRing value={goalPct} size={84}>
            <div>
              <div className="ring-value">{Math.round(today / 60)}</div>
              <div className="tiny muted">/ {dailyGoal} dk</div>
            </div>
          </ProgressRing>
          <div className="stat">
            <span className="stat-label">Bugün</span>
            <span className="text-2 small">{goalPct >= 1 ? 'Hedef tamamlandı ✓' : `${Math.max(0, Math.ceil(dailyGoal - today / 60))} dk kaldı`}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon fire">
            <Flame size={26} />
          </div>
          <div className="stat">
            <span className="stat-value">{st.current} gün</span>
            <span className="stat-label">Seri · en iyi {st.best}</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat">
            <span className="stat-value">{formatDuration(total)}</span>
            <span className="stat-label">Toplam pratik</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat">
            <span className="stat-value">
              {doneLessons}/{LESSONS.length}
            </span>
            <span className="stat-label">Ders · {mastered} riff ustalaşıldı</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="stack">
          {nextLesson && (
            <Link to={`/dersler/${nextLesson.id}`} className="card hoverable next-lesson">
              <div className="next-lesson-num">{nextLesson.num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow">
                  <GraduationCap size={13} /> Sıradaki ders
                </div>
                <div className="next-lesson-title">{nextLesson.title}</div>
                <div className="muted small">
                  {nextLesson.subtitle} · {nextLesson.minutes} dk
                </div>
              </div>
              <PlayCircle size={30} className="accent" />
            </Link>
          )}

          <div className="card">
            <div className="card-head">
              <div className="card-title">Son 14 gün</div>
              <span className="small muted">dakika / gün</span>
            </div>
            <BarChart
              data={days.map((d, i) => ({ label: i % 2 === 1 || days.length < 10 ? formatWeekday(d.date) : '', value: Math.round(d.seconds / 60), highlight: i === days.length - 1 }))}
              goal={dailyGoal}
              height={160}
              formatValue={(v) => `${v} dk`}
            />
          </div>

          {recent.length > 0 && (
            <div>
              <h2 className="section-title">Son çalıştıkların</h2>
              <div className="grid grid-3">
                {recent.map((r) => (
                  <RiffCard key={r.id} riff={r} progress={riffProgress[r.id]} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="stack">
          {riffOfDay && (
            <Link to={`/riffler/${riffOfDay.id}`} className="card hoverable riff-of-day">
              <div className="eyebrow">
                <Target size={13} /> Bugünün riffi
              </div>
              <div className="rod-title">{riffOfDay.title}</div>
              <div className="muted small">{riffOfDay.artist}</div>
              <p className="small text-2 mt-1">{riffOfDay.summary}</p>
              <div className="row">
                <Difficulty level={riffOfDay.difficulty} />
                <span className="tag">{riffOfDay.bpm} BPM</span>
                <span className="spacer" />
                <ArrowRight size={18} />
              </div>
            </Link>
          )}

          <div className="card">
            <div className="card-title">Hızlı araçlar</div>
            <div className="quick-tools">
              <Link to="/akort" className="quick-tool">
                <Gauge size={22} /> Akort
              </Link>
              <Link to="/metronom" className="quick-tool">
                <Metronome size={22} /> Metronom
              </Link>
              <Link to="/riffler" className="quick-tool">
                <Flame size={22} /> Riffler
              </Link>
              <Link to="/studyo" className="quick-tool">
                <FileMusic size={22} /> Tab ekle
              </Link>
            </div>
          </div>

          <div className="card tip-card">
            <div className="card-title">
              <Lightbulb size={17} color="var(--warn)" /> Günün ipucu
            </div>
            <p className="text-2" style={{ margin: 0 }}>
              {tipOfTheDay()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
