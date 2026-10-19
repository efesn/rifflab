import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Riff } from '../data/riffs/types';
import { uid } from '../lib/format';

export type SessionKind = 'timer' | 'routine' | 'riff' | 'lesson' | 'tool';

export interface PracticeSession {
  id: string;
  date: string;
  seconds: number;
  kind: SessionKind;
  ref?: string;
  note?: string;
}

export type RiffStatus = 'new' | 'learning' | 'mastered';

export interface RiffProgress {
  status: RiffStatus;
  bestBpm: number;
  history: { date: string; bpm: number }[];
  seconds: number;
  lastPracticed?: string;
  favorite?: boolean;
}

export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  checks: Record<number, boolean>;
}

export interface GameScore {
  best: number;
  plays: number;
  last?: number;
  lastPlayed?: string;
}

interface ProgressData {
  sessions: PracticeSession[];
  riffs: Record<string, RiffProgress>;
  lessons: Record<string, LessonProgress>;
  custom: Riff[];
  games: Record<string, GameScore>;
}

interface ProgressStore extends ProgressData {
  addSession: (s: Omit<PracticeSession, 'id' | 'date'> & { date?: string }) => void;
  deleteSession: (id: string) => void;
  setRiffStatus: (id: string, status: RiffStatus) => void;
  recordRiffBpm: (id: string, bpm: number) => void;
  addRiffTime: (id: string, seconds: number) => void;
  toggleFavorite: (id: string) => void;
  setLessonCheck: (id: string, idx: number, value: boolean) => void;
  setLessonCompleted: (id: string, completed: boolean) => void;
  saveCustom: (riff: Riff) => void;
  deleteCustom: (id: string) => void;
  recordGame: (id: string, score: number) => void;
  importData: (data: Partial<ProgressData>) => void;
  reset: () => void;
}

const EMPTY: ProgressData = { sessions: [], riffs: {}, lessons: {}, custom: [], games: {} };

const blankRiff = (): RiffProgress => ({ status: 'new', bestBpm: 0, history: [], seconds: 0 });
const blankLesson = (): LessonProgress => ({ completed: false, checks: {} });

export const useProgress = create<ProgressStore>()(
  persist(
    (set) => ({
      ...EMPTY,
      addSession: (s) =>
        set((st) => ({
          sessions: [...st.sessions, { id: uid(), date: s.date ?? new Date().toISOString(), seconds: Math.round(s.seconds), kind: s.kind, ref: s.ref, note: s.note }],
        })),
      deleteSession: (id) => set((st) => ({ sessions: st.sessions.filter((x) => x.id !== id) })),
      setRiffStatus: (id, status) =>
        set((st) => ({ riffs: { ...st.riffs, [id]: { ...(st.riffs[id] ?? blankRiff()), status } } })),
      recordRiffBpm: (id, bpm) =>
        set((st) => {
          const cur = st.riffs[id] ?? blankRiff();
          const date = new Date().toISOString();
          return {
            riffs: {
              ...st.riffs,
              [id]: {
                ...cur,
                status: cur.status === 'new' ? 'learning' : cur.status,
                bestBpm: Math.max(cur.bestBpm, bpm),
                history: [...cur.history, { date, bpm }].slice(-60),
                lastPracticed: date,
              },
            },
          };
        }),
      addRiffTime: (id, seconds) =>
        set((st) => {
          const cur = st.riffs[id] ?? blankRiff();
          return {
            riffs: {
              ...st.riffs,
              [id]: {
                ...cur,
                status: cur.status === 'new' ? 'learning' : cur.status,
                seconds: cur.seconds + Math.round(seconds),
                lastPracticed: new Date().toISOString(),
              },
            },
          };
        }),
      toggleFavorite: (id) =>
        set((st) => {
          const cur = st.riffs[id] ?? blankRiff();
          return { riffs: { ...st.riffs, [id]: { ...cur, favorite: !cur.favorite } } };
        }),
      setLessonCheck: (id, idx, value) =>
        set((st) => {
          const cur = st.lessons[id] ?? blankLesson();
          return { lessons: { ...st.lessons, [id]: { ...cur, checks: { ...cur.checks, [idx]: value } } } };
        }),
      setLessonCompleted: (id, completed) =>
        set((st) => {
          const cur = st.lessons[id] ?? blankLesson();
          return {
            lessons: { ...st.lessons, [id]: { ...cur, completed, completedAt: completed ? new Date().toISOString() : undefined } },
          };
        }),
      saveCustom: (riff) =>
        set((st) => {
          const i = st.custom.findIndex((r) => r.id === riff.id);
          const custom = [...st.custom];
          if (i >= 0) custom[i] = riff;
          else custom.push(riff);
          return { custom };
        }),
      deleteCustom: (id) => set((st) => ({ custom: st.custom.filter((r) => r.id !== id) })),
      recordGame: (id, score) =>
        set((st) => {
          const cur = st.games[id] ?? { best: 0, plays: 0 };
          return {
            games: { ...st.games, [id]: { best: Math.max(cur.best, score), plays: cur.plays + 1, last: score, lastPlayed: new Date().toISOString() } },
          };
        }),
      importData: (data) =>
        set(() => ({
          sessions: Array.isArray(data.sessions) ? data.sessions : [],
          riffs: data.riffs && typeof data.riffs === 'object' ? data.riffs : {},
          lessons: data.lessons && typeof data.lessons === 'object' ? data.lessons : {},
          custom: Array.isArray(data.custom) ? data.custom : [],
          games: data.games && typeof data.games === 'object' ? data.games : {},
        })),
      reset: () => set(() => ({ ...EMPTY })),
    }),
    { name: 'rifflab-progress', version: 1 },
  ),
);
