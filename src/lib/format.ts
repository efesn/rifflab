export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  if (s < 60) return `${s} sn`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} sa ${rm} dk` : `${h} sa`;
}

const DATE_FMT = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' });
const DATE_TIME_FMT = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const WEEKDAY_FMT = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' });

export const formatDate = (d: Date | string) => DATE_FMT.format(new Date(d));
export const formatDateTime = (d: Date | string) => DATE_TIME_FMT.format(new Date(d));
export const formatWeekday = (d: Date | string) => WEEKDAY_FMT.format(new Date(d));

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}
