import { CircleCheck, Clock, GraduationCap, Lock, PlayCircle } from 'lucide-react';
import { Link } from '../router';
import { LESSONS } from '../data/lessons';
import { useProgress } from '../store/progress';
import './lessons.css';

export function LessonsPage() {
  const lessons = useProgress((s) => s.lessons);
  const done = LESSONS.filter((l) => lessons[l.id]?.completed).length;
  const next = LESSONS.find((l) => !lessons[l.id]?.completed);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <GraduationCap size={14} /> Müfredat
          </div>
          <h1>Sıfırdan Riff'e</h1>
          <p className="subtitle">
            Gitarı tanımaktan Rammstein tarzı ritim gitara uzanan {LESSONS.length} derslik yol. Her derste açıklamalar, çalınabilir egzersizler ve bir kontrol listesi var. Sırayla gitmen önerilir ama istediğin derse atlayabilirsin.
          </p>
        </div>
        <div className="card flat lessons-progress">
          <div className="stat">
            <span className="stat-value">
              {done}/{LESSONS.length}
            </span>
            <span className="stat-label">ders tamamlandı</span>
          </div>
          <div className="bar mt-1" style={{ width: 200 }}>
            <span style={{ width: `${(done / LESSONS.length) * 100}%` }} />
          </div>
          {next && (
            <Link to={`/dersler/${next.id}`} className="btn primary sm mt-2">
              <PlayCircle size={15} /> Devam et: {next.num}. ders
            </Link>
          )}
        </div>
      </div>

      <div className="lesson-path">
        {LESSONS.map((l) => {
          const p = lessons[l.id];
          const completed = !!p?.completed;
          const checks = Object.values(p?.checks ?? {}).filter(Boolean).length;
          const isNext = next?.id === l.id;
          return (
            <Link key={l.id} to={`/dersler/${l.id}`} className={`lesson-item${completed ? ' done' : ''}${isNext ? ' next' : ''}`}>
              <div className="lesson-num">{completed ? <CircleCheck size={22} /> : l.num}</div>
              <div className="lesson-body">
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-sub">{l.subtitle}</div>
                <div className="row mt-1">
                  <span className="tag">{l.level}</span>
                  <span className="tag">
                    <Clock size={12} /> {l.minutes} dk
                  </span>
                  {checks > 0 && !completed && (
                    <span className="tag warn">
                      {checks}/{l.checklist.length} hedef
                    </span>
                  )}
                  {isNext && <span className="tag accent">Sıradaki</span>}
                </div>
              </div>
              {!completed && !isNext && l.num > (next?.num ?? 0) + 2 ? <Lock size={16} className="muted" /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
