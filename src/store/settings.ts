import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NoteNaming } from '../lib/music';
import type { ToneId } from '../audio/amp';
import type { ClickSound } from '../audio/clicks';
import { engine } from '../audio/engine';

export interface Settings {
  naming: NoteNaming;
  leftHanded: boolean;
  a4: number;
  volume: number;
  tone: ToneId;
  clickSound: ClickSound;
  dailyGoal: number;
  micDeviceId: string;
  showRhythm: boolean;
  tabZoom: number;
  name: string;
  onboarded: boolean;
}

interface SettingsStore extends Settings {
  set: (p: Partial<Settings>) => void;
}

export const DEFAULT_SETTINGS: Settings = {
  naming: 'letter',
  leftHanded: false,
  a4: 440,
  volume: 0.8,
  tone: 'distortion',
  clickSound: 'click',
  dailyGoal: 20,
  micDeviceId: '',
  showRhythm: true,
  tabZoom: 52,
  name: '',
  onboarded: false,
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (p) => set(p),
    }),
    { name: 'rifflab-settings', version: 1 },
  ),
);

// Ses motorunu ayarlarla eşitle
function sync(s: Settings) {
  engine.setVolume(s.volume);
  engine.setTone(s.tone);
}
sync(useSettings.getState());
useSettings.subscribe((s, prev) => {
  if (s.volume !== prev.volume || s.tone !== prev.tone) sync(s);
});
