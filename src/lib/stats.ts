// Pratik istatistikleri: günlük dakika, seri (streak), toplamlar.

export interface SessionLike {
  date: string;
  seconds: number;
}

export function dayKey(d: Date | string | number): string {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
}

export function secondsByDay(sessions: SessionLike[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(s.date);
    map.set(k, (map.get(k) ?? 0) + s.seconds);
  }
  return map;
}

export function lastNDays(sessions: SessionLike[], n: number): { key: string; date: Date; seconds: number }[] {
  const map = secondsByDay(sessions);
  const out = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    out.push({ key, date: d, seconds: map.get(key) ?? 0 });
  }
  return out;
}

/** Bugün (ya da bugün henüz çalışılmadıysa dünden geriye) kesintisiz pratik günü sayısı. */
export function streak(sessions: SessionLike[], minSeconds = 60): { current: number; best: number } {
  const map = secondsByDay(sessions);
  const ok = (k: string) => (map.get(k) ?? 0) >= minSeconds;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  if (!ok(dayKey(d))) d.setDate(d.getDate() - 1);
  let current = 0;
  while (ok(dayKey(d))) {
    current++;
    d.setDate(d.getDate() - 1);
  }
  // En iyi seri
  const days = [...map.keys()].filter(ok).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const cur = new Date(`${k}T12:00:00`);
    if (prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return { current, best: Math.max(best, current) };
}

export function totalSeconds(sessions: SessionLike[]): number {
  return sessions.reduce((a, s) => a + s.seconds, 0);
}

export function todaySeconds(sessions: SessionLike[]): number {
  const k = dayKey(new Date());
  return sessions.filter((s) => dayKey(s.date) === k).reduce((a, s) => a + s.seconds, 0);
}
