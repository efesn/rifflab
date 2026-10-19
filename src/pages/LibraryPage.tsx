import { useMemo, useState } from 'react';
import { Flame, Plus, Search, Star, Gauge } from 'lucide-react';
import { Link } from '../router';
import { allRiffs } from '../data/riffs';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, TECHNIQUE_LABELS, categoryLang, type Riff, type RiffCategory, type Technique } from '../data/riffs/types';
import { TUNINGS } from '../data/tunings';
import { useProgress, type RiffProgress } from '../store/progress';
import { Difficulty } from '../components/ui';
import './library.css';

type Filter = 'all' | RiffCategory | 'favorites';

const STATUS_LABEL = { new: 'Yeni', learning: 'Çalışıyorum', mastered: 'Ustalaştım' } as const;

export function RiffCard({ riff, progress }: { riff: Riff; progress?: RiffProgress }) {
  const best = progress?.bestBpm ?? 0;
  const pct = best ? Math.min(100, Math.round((best / riff.bpm) * 100)) : 0;
  const status = progress?.status ?? 'new';
  return (
    <Link to={`/riffler/${riff.id}`} className={`card hoverable riff-card cat-${riff.category}`}>
      <div className="riff-card-top">
        <span className="riff-cat" lang={categoryLang(riff.category)}>
          {riff.category === 'rammstein' ? <Flame size={13} /> : null}
          {CATEGORY_LABELS[riff.category]}
        </span>
        {progress?.favorite && <Star size={15} className="riff-fav" fill="currentColor" />}
      </div>
      <div className="riff-title">{riff.title}</div>
      <div className="riff-artist">
        {riff.artist}
        {riff.year ? ` · ${riff.year}` : ''}
      </div>
      <p className="riff-summary">{riff.summary}</p>
      <div className="riff-meta">
        <span className={`tag${riff.tuning === 'standard' ? '' : ' warn'}`}>{TUNINGS[riff.tuning].name}</span>
        <span className="tag">{riff.bpm} BPM</span>
        <Difficulty level={riff.difficulty} />
      </div>
      <div className="riff-techs">
        {riff.techniques.slice(0, 4).map((t) => (
          <span key={t} className="tag">
            {TECHNIQUE_LABELS[t]}
          </span>
        ))}
      </div>
      <div className="riff-foot">
        <span className={`riff-status ${status}`}>{STATUS_LABEL[status]}</span>
        {best > 0 && (
          <span className="riff-best" title="Temiz çalabildiğin en yüksek tempo">
            <Gauge size={13} /> {best}/{riff.bpm}
          </span>
        )}
      </div>
      {best > 0 && (
        <div className={`bar thin${pct >= 100 ? ' ok' : ''}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
    </Link>
  );
}

export function LibraryPage() {
  const custom = useProgress((s) => s.custom);
  const progress = useProgress((s) => s.riffs);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [tech, setTech] = useState<Technique | ''>('');
  const [maxDiff, setMaxDiff] = useState(5);
  const [sort, setSort] = useState<'default' | 'easy' | 'recent'>('default');

  const riffs = useMemo(() => allRiffs(custom), [custom]);
  const usedTechs = useMemo(() => [...new Set(riffs.flatMap((r) => r.techniques))], [riffs]);

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    let out = riffs.filter((r) => {
      if (filter === 'favorites' ? !progress[r.id]?.favorite : filter !== 'all' && r.category !== filter) return false;
      if (tech && !r.techniques.includes(tech)) return false;
      if (r.difficulty > maxDiff) return false;
      if (q && !`${r.title} ${r.artist} ${r.summary}`.toLocaleLowerCase('tr').includes(q)) return false;
      return true;
    });
    if (sort === 'easy') out = [...out].sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title, 'tr'));
    if (sort === 'recent') out = [...out].sort((a, b) => (progress[b.id]?.lastPracticed ?? '').localeCompare(progress[a.id]?.lastPracticed ?? ''));
    return out;
  }, [riffs, filter, tech, maxDiff, query, sort, progress]);

  const groups: { key: RiffCategory; items: Riff[] }[] =
    filter === 'all' && sort === 'default'
      ? (['rammstein', 'classic', 'exercise', 'custom'] as RiffCategory[]).map((k) => ({ key: k, items: list.filter((r) => r.category === k) })).filter((g) => g.items.length)
      : [];

  const counts = (c: Filter) => (c === 'all' ? riffs.length : c === 'favorites' ? riffs.filter((r) => progress[r.id]?.favorite).length : riffs.filter((r) => r.category === c).length);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Flame size={14} /> Riff kütüphanesi
          </div>
          <h1>Riffler & Tablar</h1>
          <p className="subtitle">Her riff oynatılabilir: yavaşlat, döngüye al, davulla çal, mikrofonla kendini test et. Kendi tablarını da Tab Stüdyosu'ndan ekleyebilirsin.</p>
        </div>
        <Link to="/studyo" className="btn primary">
          <Plus size={17} /> Tab ekle
        </Link>
      </div>

      <div className="library-filters">
        <div className="row">
          {(['all', 'rammstein', 'classic', 'exercise', 'custom', 'favorites'] as Filter[]).map((c) => (
            <button key={c} className={`chip${filter === c ? ' active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'Tümü' : c === 'favorites' ? 'Favoriler' : CATEGORY_LABELS[c]}
              <span className="muted">{counts(c)}</span>
            </button>
          ))}
        </div>
        <div className="row">
          <label className="search">
            <Search size={16} />
            <input className="input" placeholder="Şarkı, sanatçı ara…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="select" value={tech} onChange={(e) => setTech(e.target.value as Technique | '')} aria-label="Teknik">
            <option value="">Tüm teknikler</option>
            {usedTechs.map((t) => (
              <option key={t} value={t}>
                {TECHNIQUE_LABELS[t]}
              </option>
            ))}
          </select>
          <select className="select" value={maxDiff} onChange={(e) => setMaxDiff(+e.target.value)} aria-label="Zorluk">
            {[5, 4, 3, 2, 1].map((d) => (
              <option key={d} value={d}>
                {d === 5 ? 'Tüm zorluklar' : `En fazla: ${DIFFICULTY_LABELS[d]}`}
              </option>
            ))}
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sıralama">
            <option value="default">Kategoriye göre</option>
            <option value="easy">Kolaydan zora</option>
            <option value="recent">Son çalışılan</option>
          </select>
        </div>
      </div>

      {list.length === 0 && <div className="empty">Bu filtrelere uyan riff yok.</div>}

      {groups.length > 0
        ? groups.map((g) => (
            <section key={g.key}>
              <h2 className="section-title" lang={categoryLang(g.key)}>
                {g.key === 'rammstein' && <Flame size={18} color="var(--accent)" />}
                {CATEGORY_LABELS[g.key]} <span className="count">{g.items.length}</span>
              </h2>
              {g.key === 'rammstein' && (
                <p className="muted small rammstein-note">
                  Rammstein riffleri çoğunlukla <b>Drop D</b> ya da <b>Drop C</b> akortta (bazıları standart), palm mute'lu chug'lar ve vurgulu power chord'larla çalınır. Akort, tempo ve akor ilerlemeleri kaynaklara dayanır; ritimler başlangıç seviyesi için sadeleştirilmiştir — orijinal kayıtla kulaktan karşılaştırarak çalış.
                </p>
              )}
              <div className="grid grid-auto">
                {g.items.map((r) => (
                  <RiffCard key={r.id} riff={r} progress={progress[r.id]} />
                ))}
              </div>
            </section>
          ))
        : list.length > 0 && (
            <div className="grid grid-auto mt-2">
              {list.map((r) => (
                <RiffCard key={r.id} riff={r} progress={progress[r.id]} />
              ))}
            </div>
          )}
    </div>
  );
}
