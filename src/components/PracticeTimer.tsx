import { useEffect, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { timerElapsed, useTimer } from '../store/timer';
import { formatClock, formatDuration } from '../lib/format';
import { toast } from './ui';

export function PracticeTimer() {
  const timer = useTimer();
  const [, force] = useState(0);

  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => force((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [timer.running]);

  const elapsed = timerElapsed(timer);
  const hasTime = elapsed > 0;

  return (
    <div className={`pill-timer${timer.running ? ' running' : ''}`} title="Pratik sayacı — çalıştığın süreyi kaydeder">
      <span className="dot" />
      <span className="time">{formatClock(elapsed)}</span>
      {timer.running ? (
        <button className="btn ghost icon sm round" onClick={timer.pause} aria-label="Duraklat">
          <Pause size={16} />
        </button>
      ) : (
        <button className="btn ghost icon sm round" onClick={timer.start} aria-label="Pratiğe başla">
          <Play size={16} />
        </button>
      )}
      {hasTime && (
        <button
          className="btn ghost icon sm round"
          aria-label="Bitir ve kaydet"
          title="Bitir ve kaydet"
          onClick={() => {
            const saved = timer.finish();
            toast(saved ? `${formatDuration(saved)} pratik kaydedildi. Harika!` : '30 saniyeden kısa oturumlar kaydedilmez.');
          }}
        >
          <Square size={14} />
        </button>
      )}
    </div>
  );
}
