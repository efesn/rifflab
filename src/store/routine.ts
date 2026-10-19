// Devam eden günlük antrenmanın durumu (sayfadan çıkılsa bile sürer).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoutineBlock } from '../data/routines';

interface RoutineStore {
  templateId: string | null;
  blocks: RoutineBlock[];
  index: number;
  /** Mevcut blokta geçen süre (ms), duraklatmalar hariç */
  blockAccum: number;
  blockStartedAt: number | null;
  totalAccum: number;
  startedAt: string | null;
  finished: boolean;
  logged: boolean;
  markLogged: () => void;
  start: (templateId: string, blocks: RoutineBlock[]) => void;
  pause: () => void;
  resume: () => void;
  goTo: (index: number) => void;
  finish: () => void;
  reset: () => void;
}

export function blockElapsed(s: Pick<RoutineStore, 'blockAccum' | 'blockStartedAt'>): number {
  return (s.blockAccum + (s.blockStartedAt ? Date.now() - s.blockStartedAt : 0)) / 1000;
}

export const useRoutine = create<RoutineStore>()(
  persist(
    (set, get) => ({
      templateId: null,
      blocks: [],
      index: 0,
      blockAccum: 0,
      blockStartedAt: null,
      totalAccum: 0,
      startedAt: null,
      finished: false,
      logged: false,
      markLogged: () => set({ logged: true }),
      start: (templateId, blocks) =>
        set({ templateId, blocks, index: 0, blockAccum: 0, blockStartedAt: Date.now(), totalAccum: 0, startedAt: new Date().toISOString(), finished: false, logged: false }),
      pause: () => {
        const s = get();
        if (!s.blockStartedAt) return;
        set({ blockAccum: s.blockAccum + (Date.now() - s.blockStartedAt), blockStartedAt: null });
      },
      resume: () => {
        if (get().blockStartedAt || get().finished) return;
        set({ blockStartedAt: Date.now() });
      },
      goTo: (index) => {
        const s = get();
        const spent = blockElapsed(s) * 1000;
        if (index >= s.blocks.length) {
          set({ totalAccum: s.totalAccum + spent, blockAccum: 0, blockStartedAt: null, finished: true, index: s.blocks.length - 1 });
          return;
        }
        set({ totalAccum: s.totalAccum + spent, index: Math.max(0, index), blockAccum: 0, blockStartedAt: s.blockStartedAt ? Date.now() : null });
      },
      finish: () => {
        const s = get();
        set({ totalAccum: s.totalAccum + blockElapsed(s) * 1000, blockAccum: 0, blockStartedAt: null, finished: true });
      },
      reset: () => set({ templateId: null, blocks: [], index: 0, blockAccum: 0, blockStartedAt: null, totalAccum: 0, startedAt: null, finished: false, logged: false }),
    }),
    { name: 'rifflab-routine', version: 1 },
  ),
);
