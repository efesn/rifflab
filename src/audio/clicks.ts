// Metronom tık sesleri. level: 2 = vurgulu, 1 = normal vuruş, 0 = ara bölüm (subdivision)

import { engine } from './engine';

export type ClickSound = 'click' | 'wood' | 'beep' | 'cowbell';

export const CLICK_LABELS: Record<ClickSound, string> = {
  click: 'Klasik tık',
  wood: 'Tahta blok',
  beep: 'Elektronik bip',
  cowbell: 'İnek çanı',
};

export function playClick(sound: ClickSound, level: 0 | 1 | 2, time: number, dest: AudioNode = engine.clickBus, gainMul = 1) {
  const ctx = engine.ctx;
  const vel = (level === 2 ? 1 : level === 1 ? 0.72 : 0.38) * gainMul;
  const g = new GainNode(ctx, { gain: 0 });
  g.connect(dest);
  const stopAt = (o: AudioScheduledSourceNode, t: number) => {
    o.start(time);
    o.stop(time + t);
    o.onended = () => g.disconnect();
  };

  switch (sound) {
    case 'click': {
      const f = level === 2 ? 1760 : level === 1 ? 1320 : 990;
      const o = new OscillatorNode(ctx, { type: 'sine', frequency: f });
      o.connect(g);
      g.gain.setValueAtTime(vel, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
      stopAt(o, 0.05);
      break;
    }
    case 'wood': {
      const f = level === 2 ? 1250 : level === 1 ? 950 : 750;
      const o = new OscillatorNode(ctx, { type: 'triangle', frequency: f });
      const bp = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: f * 1.5, Q: 3 });
      o.connect(bp).connect(g);
      g.gain.setValueAtTime(vel * 1.4, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      stopAt(o, 0.08);
      break;
    }
    case 'beep': {
      const f = level === 2 ? 880 : level === 1 ? 660 : 520;
      const o = new OscillatorNode(ctx, { type: 'square', frequency: f });
      const lp = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 2400 });
      o.connect(lp).connect(g);
      g.gain.setValueAtTime(vel * 0.35, time);
      g.gain.setValueAtTime(vel * 0.35, time + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      stopAt(o, 0.08);
      break;
    }
    case 'cowbell': {
      const base = level === 2 ? 1 : level === 1 ? 0.9 : 0.8;
      const bp = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: 2600 * base, Q: 1.2 });
      bp.connect(g);
      for (const f of [540, 800]) {
        const o = new OscillatorNode(ctx, { type: 'square', frequency: f * base });
        o.connect(bp);
        o.start(time);
        o.stop(time + 0.3);
        o.onended = () => g.disconnect();
      }
      g.gain.setValueAtTime(vel * 0.5, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
      break;
    }
  }
}
