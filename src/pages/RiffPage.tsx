import { useMemo } from 'react';
import { ArrowLeft, ChevronRight, Flame, Gauge, Lightbulb, Pencil, Star, TriangleAlert } from 'lucide-react';
import { Link } from '../router';
import { findRiff, parseRiff } from '../data/riffs';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, TECHNIQUE_LABELS, categoryLang, riffLang } from '../data/riffs/types';
import { TUNINGS } from '../data/tunings';
import { lessonsForTechniques } from '../data/lessons';
import { useProgress, type RiffStatus } from '../store/progress';
import { TabPlayerPanel } from '../components/TabPlayerPanel';
import { Markdown } from '../components/Markdown';
import { Callout, Difficulty, Segmented } from '../components/ui';
import { formatDuration, formatDate } from '../lib/format';
import { noteName } from '../lib/music';
import { useSettings } from '../store/settings';
import './library.css';

export function RiffPage({ id }: { id: string }) {
  const custom = useProgress((s) => s.custom);
  const riff = useMemo(() => findRiff(id, custom), [id, custom]);
  const prog = useProgress((s) => s.riffs[id]);
  const setStatus = useProgress((s) => s.setRiffStatus);
  const toggleFav = useProgress((s) => s.toggleFavorite);
  const naming = useSettings((s) => s.naming);
  const parsed = useMemo(() => (riff ? parseRiff(riff) : null), [riff]);

  if (!riff || !parsed) {
    return (
      <div className="empty">
        <h2>Riff bulunamadı</h2>
        <p>
          <Link to="/riffler" className="accent">
            Kütüphaneye dön
          </Link>
        </p>
      </div>
    );
  }

  const tuning = TUNINGS[riff.tuning];
  const related = lessonsForTechniques(riff.techniques).slice(0, 3);
  const history = prog?.history ?? [];
  const best = prog?.bestBpm ?? 0;
  const maxH = Math.max(riff.bpm, ...history.map((h) => h.bpm));

  return (
    <div>
      <Link to="/riffler" className="back-link">
        <ArrowLeft size={15} /> Riffler
      </Link>
      <div className="riff-hero">
        <div>
          <div className="eyebrow" lang={categoryLang(riff.category)}>
            {riff.category === 'rammstein' && <Flame size={14} />}
            {CATEGORY_LABELS[riff.category]}
          </div>
          <h1 lang={riffLang(riff)}>{riff.title}</h1>
          <div className="by">
            {riff.artist}
            {riff.album ? ` · ${riff.album}` : ''}
            {riff.year ? ` · ${riff.year}` : ''}
          </div>
          <div className="riff-tags">
            <Link to={`/akort/${riff.tuning}`} className={`tag${riff.tuning === 'standard' ? '' : ' warn'}`} title="Bu akort için akort cihazını aç">
              {tuning.name}: {tuning.notes.map((m) => noteName(m, naming)).join(' ')}
            </Link>
            <span className="tag">{riff.bpm} BPM</span>
            <span className="tag">
              {riff.timeSig[0]}/{riff.timeSig[1]}
            </span>
            <span className="tag">
              <Difficulty level={riff.difficulty} /> {DIFFICULTY_LABELS[riff.difficulty]}
            </span>
            {riff.techniques.map((t) => (
              <span key={t} className="tag info">
                {TECHNIQUE_LABELS[t]}
              </span>
            ))}
          </div>
        </div>
        <div className="row">
          <Segmented<RiffStatus>
            value={prog?.status ?? 'new'}
            onChange={(v) => setStatus(riff.id, v)}
            options={[
              { value: 'new', label: 'Yeni' },
              { value: 'learning', label: 'Çalışıyorum' },
              { value: 'mastered', label: 'Ustalaştım' },
            ]}
          />
          <button className={`btn icon${prog?.favorite ? ' on' : ''}`} onClick={() => toggleFav(riff.id)} aria-label="Favori" title="Favorilere ekle">
            <Star size={17} fill={prog?.favorite ? 'currentColor' : 'none'} />
          </button>
          {riff.category === 'custom' && (
            <Link to={`/studyo/${riff.id}`} className="btn">
              <Pencil size={16} /> Düzenle
            </Link>
          )}
        </div>
      </div>

      {riff.tuning !== 'standard' && (
        <Callout tone="warn" title={`Bu riff ${tuning.name} akortta`}>
          <p>
            {tuning.description}{' '}
            <Link to={`/akort/${riff.tuning}`} className="accent">
              Akort cihazında {tuning.name} düzenini aç →
            </Link>
          </p>
        </Callout>
      )}
      {riff.approx && riff.category === 'rammstein' && (
        <Callout tone="metal" title="Sadeleştirilmiş çalışma düzenlemesi">
          <p>
            Akort, tempo, ton ve akor ilerlemesi kaynaklardaki ortak bilgiye dayanır; ritim ve parmaklama ise riffin karakterini öğretmek için sadeleştirilmiştir, yani kayıttaki notalarla birebir aynı değildir. Orijinal kaydı dinleyerek
            kulaktan karşılaştır. Birebir bir tab bulursan <Link to="/studyo" className="accent">Tab Stüdyosu</Link>'na yapıştırıp aynı oynatıcıyla çalışabilirsin.
          </p>
        </Callout>
      )}
      {parsed.warnings.length > 0 && riff.category === 'custom' && (
        <Callout tone="warn" title="Tab uyarıları">
          <ul className="small">
            {parsed.warnings.slice(0, 6).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Callout>
      )}

      <TabPlayerPanel
        sections={parsed.sections}
        tuning={tuning.notes}
        timeSig={riff.timeSig}
        bpm={riff.bpm}
        startBpm={riff.startBpm}
        drums={riff.drums}
        tone={riff.tone}
        riffId={riff.id}
      />

      <div className="riff-layout">
        <div className="card">
          <h3 className="card-title">Nasıl çalınır?</h3>
          <Markdown text={riff.description} />
          {riff.tips.length > 0 && (
            <>
              <div className="divider" />
              <h3 className="card-title">
                <Lightbulb size={17} color="var(--warn)" /> İpuçları
              </h3>
              <ul className="tips-list">
                {riff.tips.map((t, i) => (
                  <li key={i}>
                    <ChevronRight size={15} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="stack">
          <div className="card">
            <h3 className="card-title">
              <Gauge size={17} /> İlerlemen
            </h3>
            <div className="grid grid-2 mt-1">
              <div className="stat">
                <span className="stat-value">{best || '—'}</span>
                <span className="stat-label">En iyi temiz tempo (BPM)</span>
              </div>
              <div className="stat">
                <span className="stat-value">{prog?.seconds ? formatDuration(prog.seconds) : '—'}</span>
                <span className="stat-label">Toplam çalışma</span>
              </div>
            </div>
            <div className="mt-2 small muted">Hedef: orijinal tempo {riff.bpm} BPM</div>
            <div className={`bar mt-1${best >= riff.bpm ? ' ok' : ''}`}>
              <span style={{ width: `${Math.min(100, (best / riff.bpm) * 100)}%` }} />
            </div>
            {history.length > 1 && (
              <>
                <div className="mini-history" title="Kaydedilen tempolar">
                  {history.slice(-16).map((h, i) => (
                    <span key={i} style={{ height: `${(h.bpm / maxH) * 100}%` }} title={`${formatDate(h.date)}: ${h.bpm} BPM`} />
                  ))}
                </div>
                <div className="tiny muted mt-1">Son {Math.min(16, history.length)} kayıt</div>
              </>
            )}
            {!history.length && <p className="small muted mt-2">Oynatıcıda bir tempoda hatasız çaldığında "BPM'de temiz çaldım" düğmesine bas; ilerlemen burada görünür.</p>}
            {prog?.lastPracticed && <div className="tiny muted mt-1">Son çalışma: {formatDate(prog.lastPracticed)}</div>}
          </div>
          {related.length > 0 && (
            <div className="card">
              <h3 className="card-title">İlgili dersler</h3>
              <div className="stack mt-1">
                {related.map((l) => (
                  <Link key={l.id} to={`/dersler/${l.id}`} className="related-lesson">
                    <span className="related-num">{l.num}</span>
                    <span>
                      <b>{l.title}</b>
                      <br />
                      <span className="small muted">{l.subtitle}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Callout tone="tip" title="Çalışma önerisi">
            <p className="small">
              Önce %50–60 tempoda, davul kapalı ve metronom açık çalış. Zorlandığın ölçüleri <b>Shift + tık</b> ile döngüye al. Temiz çalınca hız antrenörünü aç ve hedef olarak {riff.bpm} BPM gir.
            </p>
          </Callout>
          {riff.tuning !== 'standard' && (
            <div className="card flat small">
              <TriangleAlert size={15} color="var(--warn)" /> Akort değiştirmek istemiyorsan riffi standart akortta da çalabilirsin ama 6. teldeki tek parmak power chord'lar yerine normal power chord şekli gerekir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
