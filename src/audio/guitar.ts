// Karplus–Strong telli çalgı sentezi. Her nota için bir kez tampon üretilir ve önbelleğe alınır;
// amfi simülasyonu (amp.ts) üzerinden geçince elektro gitar sesine dönüşür.

import { engine } from './engine';
import { midiToFreq } from '../lib/music';

export type Articulation = 'normal' | 'pm' | 'legato' | 'harmonic';

interface Pluck {
  buffer: AudioBuffer;
  rate: number;
}

const MAX_CACHE = 140;
const cache = new Map<string, Pluck>();
let deadBuffer: AudioBuffer | null = null;
let variantCounter = 0;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function t60For(freq: number, art: Articulation): number {
  if (art === 'pm') return 0.2;
  if (art === 'harmonic') return 2.4;
  const base = 4.4 * Math.sqrt(82 / freq);
  return Math.min(4.6, Math.max(1.0, art === 'legato' ? base * 0.85 : base));
}

function synthHarmonic(sr: number, freq: number): Pluck {
  const len = Math.floor(sr * 2.6);
  const d = new Float32Array(len);
  const w = (2 * Math.PI * freq) / sr;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const atk = Math.min(1, i / (sr * 0.003));
    d[i] =
      atk *
      0.55 *
      (Math.sin(w * i) * Math.exp(-t / 0.9) +
        0.22 * Math.sin(2 * w * i) * Math.exp(-t / 0.35) +
        0.08 * Math.sin(3 * w * i) * Math.exp(-t / 0.18));
  }
  const buffer = new AudioBuffer({ length: len, numberOfChannels: 1, sampleRate: sr });
  buffer.copyToChannel(d, 0);
  return { buffer, rate: 1 };
}

function synthPluck(sr: number, freq: number, art: Articulation, seed: number): Pluck {
  if (art === 'harmonic') return synthHarmonic(sr, freq);
  const pm = art === 'pm';
  const exact = sr / freq;
  const t60 = t60For(freq, art);
  const dur = pm ? 0.42 : Math.min(3.6, t60 + 0.3);
  const len = Math.ceil(sr * dur);
  const d = new Float32Array(len);
  const rand = rng(seed);

  // 2 vuruşlu ortalama filtre yarım örnek gecikme ekler; palm mute için kullanılan
  // simetrik 3 vuruşlu filtre ise sıfır fazlıdır (daha koyu, daha hızlı sönümlenen ton).
  const N = pm ? Math.max(3, Math.floor(exact)) : Math.max(2, Math.floor(exact - 0.5));
  const period = pm ? N : N + 0.5;
  const rho = Math.pow(10, -3 / (freq * t60));
  const bright = pm ? 0.2 : art === 'legato' ? 0.32 : 0.62;

  // Uyarım: alçak geçiren filtreden geçmiş gürültü + pena konumu taraklaması
  let lp = 0;
  for (let i = 0; i <= N && i < len; i++) {
    lp += bright * (rand() * 2 - 1 - lp);
    d[i] = lp;
  }
  const pick = Math.max(1, Math.round(N * 0.13));
  for (let i = N; i >= pick; i--) d[i] -= 0.6 * d[i - pick];
  let mean = 0;
  for (let i = 0; i <= N; i++) mean += d[i];
  mean /= N + 1;
  let peak = 0;
  for (let i = 0; i <= N; i++) {
    d[i] -= mean;
    peak = Math.max(peak, Math.abs(d[i]));
  }
  const norm = peak > 0 ? 0.9 / peak : 1;
  for (let i = 0; i <= N; i++) d[i] *= norm;

  if (pm) {
    for (let i = N + 1; i < len; i++) d[i] = rho * (0.25 * d[i - N - 1] + 0.5 * d[i - N] + 0.25 * d[i - N + 1]);
  } else {
    for (let i = N + 1; i < len; i++) d[i] = rho * 0.5 * (d[i - N] + d[i - N - 1]);
  }

  // Sonda tıklamayı önlemek için kısa sönüm
  const fade = Math.min(len, Math.floor(sr * 0.03));
  for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;

  const buffer = new AudioBuffer({ length: len, numberOfChannels: 1, sampleRate: sr });
  buffer.copyToChannel(d, 0);
  return { buffer, rate: period / exact };
}

function getPluck(midi: number, art: Articulation, variant: number): Pluck {
  const key = `${midi}|${art}|${variant}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const sr = engine.ctx.sampleRate;
  const p = synthPluck(sr, midiToFreq(midi), art, midi * 7919 + variant * 104729 + art.length * 13);
  cache.set(key, p);
  if (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  return p;
}

function getDead(): AudioBuffer {
  if (deadBuffer) return deadBuffer;
  const sr = engine.ctx.sampleRate;
  const len = Math.floor(sr * 0.06);
  const d = new Float32Array(len);
  const rand = rng(99);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    lp += 0.35 * (rand() * 2 - 1 - lp);
    d[i] = lp * Math.exp(-i / (sr * 0.012)) * 1.6;
  }
  deadBuffer = new AudioBuffer({ length: len, numberOfChannels: 1, sampleRate: sr });
  deadBuffer.copyToChannel(d, 0);
  return deadBuffer;
}

/** Bir parçada kullanılacak notaların tamponlarını önceden üretir (çalarken takılma olmasın). */
export function prewarm(notes: Iterable<{ midi: number; art: Articulation }>, variants = 1) {
  for (const n of notes) for (let v = 0; v < variants; v++) getPluck(n.midi, n.art, v);
}

export interface NoteSpec {
  midi: number;
  time: number;
  /** Saniye cinsinden süre; Infinity → doğal sönüm */
  duration: number;
  art: Articulation;
  velocity: number;
  dead?: boolean;
  slideFrom?: number;
  bend?: number;
  vibrato?: boolean;
}

export interface Voice {
  stop(at: number): void;
}

export function playNote(spec: NoteSpec, dest: AudioNode): Voice {
  const ctx = engine.ctx;
  const g = ctx.createGain();
  g.connect(dest);

  if (spec.dead) {
    const src = new AudioBufferSourceNode(ctx, { buffer: getDead() });
    g.gain.value = spec.velocity * 0.9;
    src.connect(g);
    src.start(spec.time);
    src.onended = () => g.disconnect();
    return { stop: () => {} };
  }

  const pl = getPluck(spec.midi, spec.art, variantCounter++ % 2);
  const src = new AudioBufferSourceNode(ctx, { buffer: pl.buffer });
  const rate = pl.rate * (1 + (Math.random() - 0.5) * 0.0006);
  const t = spec.time;
  const p = src.playbackRate;

  if (spec.slideFrom !== undefined && spec.slideFrom !== spec.midi) {
    p.setValueAtTime(rate * Math.pow(2, (spec.slideFrom - spec.midi) / 12), t);
    p.linearRampToValueAtTime(rate, t + 0.075);
  } else {
    p.setValueAtTime(rate, t);
  }
  if (spec.bend) {
    const rise = Math.min(0.2, Math.max(0.06, (Number.isFinite(spec.duration) ? spec.duration : 1) * 0.45));
    p.setValueAtTime(rate, t + 0.03);
    p.linearRampToValueAtTime(rate * Math.pow(2, spec.bend / 12), t + 0.03 + rise);
  }

  const natural = pl.buffer.duration / rate;
  const end = t + Math.min(Number.isFinite(spec.duration) ? spec.duration : natural, natural);
  const rel = spec.art === 'pm' ? 0.025 : 0.05;

  let lfo: OscillatorNode | null = null;
  if (spec.vibrato) {
    lfo = new OscillatorNode(ctx, { frequency: 5.6 });
    const depth = new GainNode(ctx, { gain: rate * (spec.bend ? 0.006 : 0.011) });
    lfo.connect(depth).connect(p);
    lfo.start(t + 0.12);
    lfo.stop(end + rel);
  }

  g.gain.setValueAtTime(spec.velocity, t);
  g.gain.setValueAtTime(spec.velocity, end);
  g.gain.linearRampToValueAtTime(0, end + rel);
  src.connect(g);
  src.start(t);
  src.stop(end + rel + 0.02);
  src.onended = () => g.disconnect();

  return {
    stop(at: number) {
      if (at >= end) return;
      const when = Math.max(at, t);
      try {
        g.gain.cancelScheduledValues(when);
        g.gain.setValueAtTime(spec.velocity, when);
        g.gain.linearRampToValueAtTime(0, when + 0.02);
        src.stop(when + 0.04);
        lfo?.stop(when + 0.04);
      } catch {
        /* zaten durmuş */
      }
    },
  };
}

/** Tek bir notayı hemen çalar (klavye/akor tıklamaları için). */
export function pluckNow(midi: number, opts: { art?: Articulation; duration?: number; delay?: number; velocity?: number } = {}) {
  const ctx = engine.ctx;
  return playNote(
    {
      midi,
      time: ctx.currentTime + 0.02 + (opts.delay ?? 0),
      duration: opts.duration ?? 1.6,
      art: opts.art ?? 'normal',
      velocity: opts.velocity ?? 0.85,
    },
    engine.guitarBus,
  );
}

/** Akoru aşağı vuruşla (kalından inceye) çalar. */
export function strumNow(midis: number[], opts: { spread?: number; duration?: number; art?: Articulation } = {}) {
  const spread = opts.spread ?? 0.022;
  midis.forEach((m, i) => pluckNow(m, { delay: i * spread, duration: opts.duration ?? 2.2, art: opts.art, velocity: 0.75 }));
}
