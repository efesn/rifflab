// Hassas metronom: AudioContext saatine göre ileriye dönük planlama ("iki saat" yöntemi).

import { engine, fadeOutAndDisconnect } from './engine';
import { playClick, type ClickSound } from './clicks';
import { createTicker, type Ticker } from './ticker';

export type AccentLevel = 0 | 1 | 2;

export interface MetronomeConfig {
  bpm: number;
  beatsPerBar: number;
  beatUnit: 4 | 8;
  subdivision: 1 | 2 | 3 | 4;
  accents: AccentLevel[];
  sound: ClickSound;
  volume: number;
  trainer: { enabled: boolean; increment: number; everyBars: number; target: number };
  gap: { enabled: boolean; playBars: number; muteBars: number };
}

export interface BeatInfo {
  beat: number;
  bar: number;
  time: number;
  muted: boolean;
  bpm: number;
}

export function defaultAccents(beatsPerBar: number, beatUnit: number): AccentLevel[] {
  const a: AccentLevel[] = Array.from({ length: beatsPerBar }, () => 1 as AccentLevel);
  a[0] = 2;
  if (beatUnit === 8 && beatsPerBar % 3 === 0) for (let i = 3; i < beatsPerBar; i += 3) a[i] = 2;
  return a;
}

const LOOKAHEAD = 0.12;

export class Metronome {
  cfg: MetronomeConfig;
  running = false;
  private ticker: Ticker | null = null;
  private bus: GainNode | null = null;
  private nextTime = 0;
  private beat = 0;
  private sub = 0;
  private bar = 0;
  private queue: BeatInfo[] = [];
  private raf = 0;
  private beatListeners = new Set<(b: BeatInfo) => void>();
  private bpmListeners = new Set<(bpm: number) => void>();

  constructor(cfg: MetronomeConfig) {
    this.cfg = cfg;
  }

  onBeat(fn: (b: BeatInfo) => void) {
    this.beatListeners.add(fn);
    return () => this.beatListeners.delete(fn);
  }

  onBpmChange(fn: (bpm: number) => void) {
    this.bpmListeners.add(fn);
    return () => this.bpmListeners.delete(fn);
  }

  update(partial: Partial<MetronomeConfig>) {
    this.cfg = { ...this.cfg, ...partial };
    if (partial.volume !== undefined && this.bus) this.bus.gain.setTargetAtTime(partial.volume, engine.ctx.currentTime, 0.02);
    if (this.beat >= this.cfg.beatsPerBar) this.beat = 0;
  }

  async start() {
    if (this.running) return;
    const ctx = await engine.resume();
    this.bus = engine.createSubBus(engine.clickBus, this.cfg.volume);
    this.running = true;
    this.beat = 0;
    this.sub = 0;
    this.bar = 0;
    this.queue = [];
    this.nextTime = ctx.currentTime + 0.08;
    this.schedule();
    this.ticker = createTicker(25, () => this.schedule());
    const loop = () => {
      this.dispatch();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.ticker?.stop();
    this.ticker = null;
    cancelAnimationFrame(this.raf);
    if (this.bus) fadeOutAndDisconnect(this.bus, 0.01);
    this.bus = null;
    this.queue = [];
  }

  private schedule() {
    if (!this.running || !this.bus) return;
    const ctx = engine.ctx;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD) {
      const c = this.cfg;
      const cycle = c.gap.playBars + c.gap.muteBars;
      const muted = c.gap.enabled && cycle > 0 && this.bar % cycle >= c.gap.playBars;
      const accent = c.accents[this.beat] ?? 1;
      if (!muted) {
        if (this.sub === 0) {
          if (accent > 0) playClick(c.sound, accent === 2 ? 2 : 1, this.nextTime, this.bus);
        } else {
          playClick(c.sound, 0, this.nextTime, this.bus);
        }
      }
      if (this.sub === 0) this.queue.push({ beat: this.beat, bar: this.bar, time: this.nextTime, muted, bpm: c.bpm });

      this.nextTime += 60 / c.bpm / c.subdivision;
      this.sub++;
      if (this.sub >= c.subdivision) {
        this.sub = 0;
        this.beat++;
        if (this.beat >= c.beatsPerBar) {
          this.beat = 0;
          this.bar++;
          this.barEnded();
        }
      }
    }
  }

  private barEnded() {
    const t = this.cfg.trainer;
    if (t.enabled && t.everyBars > 0 && this.bar % t.everyBars === 0 && this.cfg.bpm < t.target) {
      const bpm = Math.min(t.target, this.cfg.bpm + t.increment);
      this.cfg = { ...this.cfg, bpm };
      // Arayüz bildirimini sesin duyulduğu ana yakın yap
      const delay = Math.max(0, (this.nextTime - engine.ctx.currentTime) * 1000);
      window.setTimeout(() => this.bpmListeners.forEach((fn) => fn(bpm)), delay);
    }
  }

  private dispatch() {
    const now = engine.ctx.currentTime - engine.outputLatency;
    while (this.queue.length && this.queue[0].time <= now) {
      const b = this.queue.shift()!;
      this.beatListeners.forEach((fn) => fn(b));
    }
  }
}
