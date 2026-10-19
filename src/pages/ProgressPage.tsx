import { useMemo, useState } from 'react';
import { ChartColumn, Flame, Clock, Trophy, Trash, Plus, GraduationCap, Gamepad2 } from 'lucide-react';
import { Link } from '../router';
import { useProgress, type SessionKind } from '../store/progress';
import { useSettings } from '../store/settings';
import { LESSONS } from '../data/lessons';
import { allRiffs } from '../data/riffs';
import { lastNDays, streak, totalSeconds } from '../lib/stats';
import { formatDate, formatDateTime, formatDuration } from '../lib/format';
import { BarChart, Segmented, toast } from '../components/ui';
import './progress.css';
import './library.css';

const KIND_LABELS: Record<SessionKind, string> = {
  timer: 'Serbest (sayaç)',
  routine: 'Günlük antrenman',
  riff: 'Riff çalışması',
  lesson: 'Dersler',
  tool: 'Metronom / araçlar',
};

const STATUS_LABEL = { new: 'Yeni', learning: 'Çalışıyorum', mastered: 'Ustalaştım' } as const;

export function ProgressPage() {
  const sessions = useProgress((s) => s.sessions);
  const riffProgress = useProgress((s) => s.riffs);
  const lessons = useProgress((s) => s.lessons);
  const games = useProgress((s) => s.games);
  const custom = useProgress((s) => s.custom);
  const addSession = useProgress((s) => s.addSession);
  const deleteSession = useProgress((s) => s.deleteSession);
  const goal = useSettings((s) => s.dailyGoal);
  const [range, setRange] = useState<14 | 30 | 90>(30);
  const [manualMin, setManualMin] = useState(20);
  const [manualNote, setManualNote] = useState('');

  const days = lastNDays(sessions, range);
  const st = streak(sessions);
  const total = totalSeconds(sessions);
  const activeDays = days.filter((d) => d.seconds >= 60).length;
  const avg = days.reduce((a, d) => a + d.seconds, 0) / range;
  const riffs = useMemo(() => allRiffs(custom), [custom]);
  const byKind = useMemo(() => {
    const m = new Map<SessionKind, number>();
    sessions.forEach((s) => m.set(s.kind, (m.get(s.kind) ?? 0) + s.seconds));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [sessions]);
  const maxKind = Math.max(1, ...byKind.map((k) => k[1]));
  const practiced = riffs
    .filter((r) => riffProgress[r.id] && (riffProgress[r.id].seconds > 0 || riffProgress[r.id].bestBpm > 0 || riffProgress[r.id].status !== 'new'))
    .sort((a, b) => (riffProgress[b.id].lastPracticed ?? '').localeCompare(riffProgress[a.id].lastPracticed ?? ''));
  const doneLessons = LESSONS.filter((l) => lessons[l.id]?.completed);
  const recentSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25);

  const labelEvery = range === 14 ? 1 : range === 30 ? 3 : 10;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <ChartColumn size={14} /> İstatistikler
          </div>
          <h1>İlerleme</h1>
          <p className="subtitle">Ne kadar çaldığın, hangi riffleri hangi tempoda temiz çalabildiğin ve derslerdeki yerin.</p>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat">
          <span className="stat-value">{formatDuration(total)}</span>
          <span className="stat-label">
            <Clock size={12} /> Toplam pratik · {sessions.length} oturum
          </span>
        </div>
        <div className="card stat">
          <span className="stat-value">{st.current} gün</span>
          <span className="stat-label">
            <Flame size={12} /> Güncel seri · en iyi {st.best} gün
          </span>
        </div>
        <div className="card stat">
          <span className="stat-value">{formatDuration(avg)}</span>
          <span className="stat-label">
            Günlük ortalama (son {range} gün) · {activeDays} aktif gün
          </span>
        </div>
        <div className="card stat">
          <span className="stat-value">
            {riffs.filter((r) => riffProgress[r.id]?.status === 'mastered').length} / {doneLessons.length}
          </span>
          <span className="stat-label">
            <Trophy size={12} /> Ustalaşılan riff / tamamlanan ders
          </span>
        </div>
      </div>

      <div className="card mt-2">
        <div className="card-head">
          <div className="card-title">Günlük pratik (dakika)</div>
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: 14, label: '14 gün' },
              { value: 30, label: '30 gün' },
              { value: 90, label: '90 gün' },
            ]}
          />
        </div>
        <BarChart
          data={days.map((d, i) => ({
            label: (range - 1 - i) % labelEvery === 0 ? `${d.date.getDate()}` : '',
            value: Math.round(d.seconds / 60),
            highlight: i === days.length - 1,
            title: `${formatDate(d.date)}: ${Math.round(d.seconds / 60)} dk`,
          }))}
          goal={goal}
          height={180}
        />
      </div>

      <div className="progress-grid mt-2">
        <div className="card">
          <div className="card-title">Riff ilerlemesi</div>
          {practiced.length === 0 ? (
            <p className="muted small">
              Henüz kayıt yok. Bir riffi çalıp "BPM'de temiz çaldım" düğmesine bastığında burada görünecek. <Link to="/riffler" className="accent">Riff seç →</Link>
            </p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Riff</th>
                    <th>Durum</th>
                    <th>En iyi tempo</th>
                    <th>Süre</th>
                    <th>Son</th>
                  </tr>
                </thead>
                <tbody>
                  {practiced.map((r) => {
                    const p = riffProgress[r.id];
                    const pct = Math.min(100, (p.bestBpm / r.bpm) * 100);
                    return (
                      <tr key={r.id}>
                        <td>
                          <Link to={`/riffler/${r.id}`} className="accent">
                            {r.title}
                          </Link>
                          <div className="tiny muted">{r.artist}</div>
                        </td>
                        <td>
                          <span className={`riff-status ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                        </td>
                        <td style={{ minWidth: 130 }}>
                          <span className="mono small">
                            {p.bestBpm || '—'} / {r.bpm}
                          </span>
                          <div className={`bar thin${pct >= 100 ? ' ok' : ''}`}>
                            <span style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="small">{p.seconds ? formatDuration(p.seconds) : '—'}</td>
                        <td className="small muted">{p.lastPracticed ? formatDate(p.lastPracticed) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-title">Süre dağılımı</div>
            {byKind.length === 0 && <p className="muted small">Henüz oturum yok.</p>}
            <div className="stack mt-1">
              {byKind.map(([k, v]) => (
                <div key={k}>
                  <div className="row small">
                    <span>{KIND_LABELS[k]}</span>
                    <span className="spacer" />
                    <span className="muted">{formatDuration(v)}</span>
                  </div>
                  <div className="bar thin">
                    <span style={{ width: `${(v / maxKind) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <GraduationCap size={17} /> Dersler ({doneLessons.length}/{LESSONS.length})
            </div>
            <div className="lesson-dots">
              {LESSONS.map((l) => (
                <Link key={l.id} to={`/dersler/${l.id}`} className={`lesson-dot${lessons[l.id]?.completed ? ' done' : ''}`} title={`${l.num}. ${l.title}${lessons[l.id]?.completedAt ? ` — ${formatDate(lessons[l.id].completedAt!)}` : ''}`}>
                  {l.num}
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <Gamepad2 size={17} /> Oyun rekorları
            </div>
            <div className="stack small mt-1">
              {[
                ['note-hunt', 'Nota Avı', '60 sn'],
                ['intervals', 'Aralık Kulağı', '/10'],
                ['chords', 'Akor Kulağı', '/10'],
              ].map(([id, name, unit]) => (
                <div key={id} className="row">
                  <span>{name}</span>
                  <span className="spacer" />
                  <b>{games[id]?.best ?? 0}</b>
                  <span className="muted">
                    {unit} · {games[id]?.plays ?? 0} oyun
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <div className="card-head">
          <div className="card-title">Oturum geçmişi</div>
        </div>
        <div className="row manual-add">
          <span className="small text-2">Uygulama dışında çaldıysan elle ekle:</span>
          <input className="input mini" type="number" min={1} max={600} value={manualMin} onChange={(e) => setManualMin(Math.max(1, Math.min(600, +e.target.value || 1)))} />
          <span className="small">dk</span>
          <input className="input" placeholder="Not (isteğe bağlı)" value={manualNote} onChange={(e) => setManualNote(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <button
            className="btn sm"
            onClick={() => {
              addSession({ seconds: manualMin * 60, kind: 'timer', note: manualNote || 'Elle eklendi' });
              setManualNote('');
              toast(`${manualMin} dk eklendi.`);
            }}
          >
            <Plus size={14} /> Ekle
          </button>
        </div>
        {recentSessions.length === 0 ? (
          <p className="muted small">Henüz oturum yok. Üstteki sayaçla ya da bir riff çalarak başla.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <tbody>
                {recentSessions.map((s) => {
                  const riff = s.kind === 'riff' && s.ref ? riffs.find((r) => r.id === s.ref) : undefined;
                  return (
                    <tr key={s.id}>
                      <td className="small muted">{formatDateTime(s.date)}</td>
                      <td>{KIND_LABELS[s.kind]}</td>
                      <td className="small text-2">{riff ? riff.title : s.note ?? ''}</td>
                      <td className="mono small">{formatDuration(s.seconds)}</td>
                      <td style={{ width: 40 }}>
                        <button className="btn icon sm ghost" onClick={() => deleteSession(s.id)} aria-label="Oturumu sil" title="Sil">
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
