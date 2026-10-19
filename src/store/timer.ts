// Genel pratik sayacı: sayfa yenilense bile kaldığı yerden devam eder.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProgress } from './progress';
import { useRoutine } from './routine';

interface TimerStore {
  running: boolean;
  startedAt: number | null;
  accumulated: number;
  start: () => void;
  pause: () => void;
  /** Sayacı durdurur, en az 30 sn ise oturum olarak kaydeder. Kaydedilen saniyeyi döndürür. */
  finish: (note?: string) => number;
  discard: () => void;
}

export function timerElapsed(s: Pick<TimerStore, 'running' | 'startedAt' | 'accumulated'>): number {
  return (s.accumulated + (s.running && s.startedAt ? Date.now() - s.startedAt : 0)) / 1000;
}

export const useTimer = create<TimerStore>()(
  persist(
    (set, get) => ({
      running: false,
      startedAt: null,
      accumulated: 0,
      start: () => {
        if (get().running) return;
        set({ running: true, startedAt: Date.now() });
      },
      pause: () => {
        const s = get();
        if (!s.running) return;
        set({ running: false, startedAt: null, accumulated: s.accumulated + (Date.now() - (s.startedAt ?? Date.now())) });
      },
      finish: (note) => {
        const secs = timerElapsed(get());
        if (secs >= 30) useProgress.getState().addSession({ seconds: secs, kind: 'timer', note });
        set({ running: false, startedAt: null, accumulated: 0 });
        return secs >= 30 ? secs : 0;
      },
      discard: () => set({ running: false, startedAt: null, accumulated: 0 }),
    }),
    { name: 'rifflab-timer', version: 1 },
  ),
);

/** Pratik süresi zaten bir yerde sayılıyor mu? (genel sayaç ya da devam eden antrenman) */
export function practiceAlreadyTracked(): boolean {
  const r = useRoutine.getState();
  return useTimer.getState().running || (!!r.templateId && !r.finished);
}
