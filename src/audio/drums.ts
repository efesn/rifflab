// Sentezlenmiş davul makinesi: kick, snare, hi-hat, crash. Desenler 4/4 için 16'lık adımlarla yazılır.

import { engine } from './engine';

export type DrumVoice = 'kick' | 'snare' | 'hat' | 'open' | 'crash';
export type DrumPatternId = 'none' | 'rock' | 'four' | 'metal' | 'halftime' | 'march' | 'gallop' | 'shuffle';

export interface DrumPattern {
  id: DrumPatternId;
  name: string;
  desc: string;
  kick: string;
  snare: string;
  hat: string;
  open?: string;
}

export const DRUM_PATTERNS: DrumPattern[] = [
  { id: 'none', name: 'Davul yok', desc: 'Sadece gitar (ve isteğe bağlı metronom).', kick: '', snare: '', hat: '' },
  {
    id: 'rock',
    name: 'Rock',
    desc: 'Klasik rock ritmi: 1 ve 3 kick, 2 ve 4 snare.',
    kick: 'x.......x.x.....',
    snare: '....x.......x...',
    hat: 'x.x.x.x.x.x.x.x.',
  },
  {
    id: 'four',
    name: 'Endüstriyel (4/4 düz kick)',
    desc: 'Her vuruşta kick — Rammstein’ın sevdiği makine gibi düz ritim.',
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    hat: '..x...x...x...x.',
    open: '',
  },
  {
    id: 'metal',
    name: 'Metal (çift kick)',
    desc: 'Sekizlik çift pedal, 2 ve 4 snare.',
    kick: 'x.x.x.x.x.x.x.x.',
    snare: '....x.......x...',
    hat: 'x...x...x...x...',
  },
  {
    id: 'halftime',
    name: 'Yarım tempo',
    desc: 'Ağır ve geniş: snare sadece 3. vuruşta.',
    kick: 'x.....x...x.....',
    snare: '........x.......',
    hat: 'x.x.x.x.x.x.x.x.',
  },
  {
    id: 'march',
    name: 'Marş',
    desc: 'Askerî trampet ritmi.',
    kick: 'x.......x.......',
    snare: 'x.xxx.x.x.xxx.x.',
    hat: '',
  },
  {
    id: 'gallop',
    name: 'Dörtnala (gallop)',
    desc: '8’lik + iki 16’lık: Iron Maiden tarzı galop.',
    kick: 'x.xxx.xxx.xxx.xx',
    snare: '....x.......x...',
    hat: 'x...x...x...x...',
  },
  {
    id: 'shuffle',
    name: 'Shuffle',
    desc: 'Sallantılı blues/rock hissi.',
    kick: 'x.....x.x.......',
    snare: '....x.......x...',
    hat: 'x..xx..xx..xx..x',
  },
];

const PATTERN_MAP = new Map(DRUM_PATTERNS.map((p) => [p.id, p]));

export function getPattern(id: DrumPatternId): DrumPattern {
  return PATTERN_MAP.get(id) ?? DRUM_PATTERNS[0];
}

/** Ölçü içindeki bir 16'lık adımda çalınacak davul sesleri. */
export function drumHits(id: DrumPatternId, step: number, stepsInBar: number): { voice: DrumVoice; vel: number }[] {
  if (id === 'none') return [];
  const hits: { voice: DrumVoice; vel: number }[] = [];
  if (stepsInBar === 16) {
    const p = getPattern(id);
    const at = (s: string) => s.length > 0 && s[step % s.length] === 'x';
    if (at(p.kick)) hits.push({ voice: 'kick', vel: 1 });
    if (at(p.snare)) hits.push({ voice: 'snare', vel: id === 'march' && step % 4 !== 0 ? 0.55 : 0.95 });
    if (at(p.hat)) hits.push({ voice: 'hat', vel: step % 4 === 0 ? 0.8 : 0.55 });
    if (p.open && at(p.open)) hits.push({ voice: 'open', vel: 0.6 });
    return hits;
  }
  // 4/4 dışındaki ölçüler için genel desen: ilk vuruşta kick, ortada snare, sekizliklerde hi-hat
  const beats = stepsInBar / 4;
  if (step === 0) hits.push({ voice: 'kick', vel: 1 });
  const mid = Math.floor(beats / 2) * 4;
  if (beats >= 2 && step === mid) hits.push({ voice: 'snare', vel: 0.9 });
  if (step % 2 === 0) hits.push({ voice: 'hat', vel: step % 4 === 0 ? 0.75 : 0.5 });
  return hits;
}

let noise: AudioBuffer | null = null;
function noiseBuffer(): AudioBuffer {
  if (noise) return noise;
  const ctx = engine.ctx;
  const len = ctx.sampleRate;
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function noiseBurst(time: number, dest: AudioNode, filter: BiquadFilterOptions, vel: number, decay: number, filter2?: BiquadFilterOptions) {
  const ctx = engine.ctx;
  const src = new AudioBufferSourceNode(ctx, { buffer: noiseBuffer() });
  const f = new BiquadFilterNode(ctx, filter);
  const g = new GainNode(ctx, { gain: 0 });
  let tail: AudioNode = f;
  if (filter2) tail = f.connect(new BiquadFilterNode(ctx, filter2));
  src.connect(f);
  tail.connect(g).connect(dest);
  g.gain.setValueAtTime(vel, time);
  g.gain.exponentialRampToValueAtTime(0.0008, time + decay);
  src.start(time, Math.random() * 0.5);
  src.stop(time + decay + 0.02);
  src.onended = () => g.disconnect();
}

export function playDrum(voice: DrumVoice, time: number, vel: number, dest: AudioNode = engine.drumBus) {
  const ctx = engine.ctx;
  switch (voice) {
    case 'kick': {
      const o = new OscillatorNode(ctx, { type: 'sine', frequency: 150 });
      const g = new GainNode(ctx, { gain: 0 });
      o.connect(g).connect(dest);
      o.frequency.setValueAtTime(155, time);
      o.frequency.exponentialRampToValueAtTime(46, time + 0.12);
      g.gain.setValueAtTime(vel * 1.1, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.42);
      o.start(time);
      o.stop(time + 0.45);
      o.onended = () => g.disconnect();
      noiseBurst(time, dest, { type: 'highpass', frequency: 2500 }, vel * 0.25, 0.012);
      break;
    }
    case 'snare': {
      noiseBurst(time, dest, { type: 'highpass', frequency: 1100 }, vel * 0.55, 0.17, { type: 'peaking', frequency: 4500, gain: 4 });
      const o = new OscillatorNode(ctx, { type: 'triangle', frequency: 190 });
      const g = new GainNode(ctx, { gain: 0 });
      o.connect(g).connect(dest);
      o.frequency.setValueAtTime(220, time);
      o.frequency.exponentialRampToValueAtTime(170, time + 0.06);
      g.gain.setValueAtTime(vel * 0.45, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      o.start(time);
      o.stop(time + 0.12);
      o.onended = () => g.disconnect();
      break;
    }
    case 'hat':
      noiseBurst(time, dest, { type: 'highpass', frequency: 7500 }, vel * 0.28, 0.045, { type: 'peaking', frequency: 10000, gain: 6 });
      break;
    case 'open':
      noiseBurst(time, dest, { type: 'highpass', frequency: 7000 }, vel * 0.24, 0.3, { type: 'peaking', frequency: 9500, gain: 5 });
      break;
    case 'crash':
      noiseBurst(time, dest, { type: 'highpass', frequency: 4200 }, vel * 0.3, 1.5, { type: 'peaking', frequency: 7000, gain: 3 });
      break;
  }
}
