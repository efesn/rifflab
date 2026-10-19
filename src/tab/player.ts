// Tab oynatıcı: gitar notalarını, davulu ve metronomu AudioContext saatine göre ileriye dönük planlar.
// Tempo canlı değiştirilebilir, döngü ve hız antrenörü desteklenir.

import { engine, fadeOutAndDisconnect } from '../audio/engine';
import { playNote, prewarm, type Voice } from '../audio/guitar';
import { drumHits, playDrum, type DrumPatternId } from '../audio/drums';
import { playClick, type ClickSound } from '../audio/clicks';
import { createTicker, type Ticker } from '../audio/ticker';
import { collectNotes, type SeqEvent, type Sequence } from './sequence';

export interface PlayerSettings {
  bpm: number;
  loop: boolean;
  metronome: boolean;
  countIn: boolean;
  drums: DrumPatternId;
  guitarMuted: boolean;
  guitarVol: number;
  drumVol: number;
  clickVol: number;
  clickSound: ClickSound;
  trainer: { enabled: boolean; increment: number; everyPasses: number; target: number };
}

export type PlayerEvent =
  | { type: 'state'; playing: boolean }
  | { type: 'pass'; count: number }
  | { type: 'bpm'; bpm: number }
  | { type: 'end' };

type Item =
  | { kind: 'event'; beat: number; ev: SeqEvent }
  | { kind: 'step'; beat: number; step: number; steps: number; measureIndex: number };

export interface PlayerPosition {
  /** Döngü içindeki vuruş konumu; sayım sırasında negatif */
  beat: number;
  eventIndex: number;
  countIn: boolean;
}

const LOOKAHEAD = 0.14;

export class TabPlayer {
  /** Aynı anda yalnızca bir oynatıcı çalsın */
  static current: TabPlayer | null = null;
  settings: PlayerSettings;
  playing = false;
  private seq: Sequence | null = null;
  private items: Item[] = [];
  private ticker: Ticker | null = null;
  private buses: { guitar: GainNode; drums: GainNode; clicks: GainNode } | null = null;
  private anchorTime = 0;
  private anchorBeat = 0;
  private spb = 0.5;
  private passOffset = 0;
  private pass = 0;
  private nextItem = 0;
  private startAbs = 0;
  private endTimer = 0;
  private voices = new Map<number, Voice>();
  private listeners = new Set<(e: PlayerEvent) => void>();

  constructor(settings: PlayerSettings) {
    this.settings = settings;
  }

  on(fn: (e: PlayerEvent) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(e: PlayerEvent) {
    this.listeners.forEach((fn) => fn(e));
  }

  load(seq: Sequence) {
    const wasPlaying = this.playing;
    if (wasPlaying) this.stop();
    this.seq = seq;
    const items: Item[] = [];
    seq.measures.forEach((m, mi) => {
      const steps = Math.max(1, Math.round(m.beats * 4));
      for (let k = 0; k < steps; k++) items.push({ kind: 'step', beat: m.beat + k / 4, step: k, steps, measureIndex: mi });
    });
    for (const ev of seq.events) items.push({ kind: 'event', beat: ev.beat, ev });
    items.sort((a, b) => a.beat - b.beat || (a.kind === 'step' ? -1 : 1));
    this.items = items;
    // Tamponları boşta üret: sayfa açılışını yavaşlatmasın
    window.setTimeout(() => {
      if (this.seq !== seq) return;
      try {
        prewarm(collectNotes(seq));
      } catch {
        /* AudioContext henüz yok */
      }
    }, 60);
  }

  get sequence() {
    return this.seq;
  }

  update(partial: Partial<PlayerSettings>) {
    const prevBpm = this.settings.bpm;
    this.settings = { ...this.settings, ...partial };
    if (partial.bpm !== undefined && partial.bpm !== prevBpm && this.playing) this.reanchor(partial.bpm);
    else if (partial.bpm !== undefined) this.spb = 60 / partial.bpm;
    if (this.buses) {
      const t = engine.ctx.currentTime;
      if (partial.guitarVol !== undefined || partial.guitarMuted !== undefined)
        this.buses.guitar.gain.setTargetAtTime(this.settings.guitarMuted ? 0 : this.settings.guitarVol, t, 0.02);
      if (partial.drumVol !== undefined) this.buses.drums.gain.setTargetAtTime(this.settings.drumVol, t, 0.02);
      if (partial.clickVol !== undefined) this.buses.clicks.gain.setTargetAtTime(this.settings.clickVol, t, 0.02);
    }
  }

  private timeOf(absBeat: number) {
    return this.anchorTime + (absBeat - this.anchorBeat) * this.spb;
  }

  private reanchor(bpm: number) {
    const frontier = this.passOffset + (this.items[this.nextItem]?.beat ?? this.seq?.totalBeats ?? 0);
    const t = this.timeOf(frontier);
    this.anchorBeat = frontier;
    this.anchorTime = t;
    this.spb = 60 / bpm;
  }

  async play(fromBeat = 0) {
    if (!this.seq || !this.seq.events.length) return;
    if (this.playing) this.stop();
    if (TabPlayer.current && TabPlayer.current !== this) TabPlayer.current.stop();
    TabPlayer.current = this;
    const ctx = await engine.resume();
    prewarm(collectNotes(this.seq));
    const s = this.settings;
    this.buses = {
      guitar: engine.createSubBus(engine.guitarBus, s.guitarMuted ? 0 : s.guitarVol),
      drums: engine.createSubBus(engine.drumBus, s.drumVol),
      clicks: engine.createSubBus(engine.clickBus, s.clickVol),
    };
    this.spb = 60 / s.bpm;
    const ts = this.seq.timeSig;
    const countBeats = s.countIn ? (ts[0] * 4) / ts[1] : 0;
    const start = ctx.currentTime + 0.12;
    this.anchorBeat = fromBeat;
    this.anchorTime = start + countBeats * this.spb;
    this.startAbs = fromBeat;
    this.passOffset = 0;
    this.pass = 0;
    this.nextItem = this.items.findIndex((it) => it.beat >= fromBeat - 1e-9);
    if (this.nextItem < 0) this.nextItem = 0;
    this.voices.clear();
    this.endTimer = 0;

    if (countBeats > 0) {
      const step = ts[1] === 8 ? 0.5 : 1;
      for (let b = 0, k = 0; b < countBeats - 1e-9; b += step, k++) {
        playClick(s.clickSound, k === 0 ? 2 : 1, start + b * this.spb, this.buses.clicks, 1.3 / Math.max(0.2, s.clickVol));
      }
    }

    this.playing = true;
    this.emit({ type: 'state', playing: true });
    this.tick();
    this.ticker = createTicker(25, () => this.tick());
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    this.ticker?.stop();
    this.ticker = null;
    window.clearTimeout(this.endTimer);
    this.endTimer = 0;
    if (this.buses) {
      fadeOutAndDisconnect(this.buses.guitar);
      fadeOutAndDisconnect(this.buses.drums);
      fadeOutAndDisconnect(this.buses.clicks);
    }
    this.buses = null;
    this.voices.clear();
    this.emit({ type: 'state', playing: false });
  }

  /** Şu anda duyulan konum. */
  getPosition(): PlayerPosition | null {
    if (!this.playing || !this.seq) return null;
    const now = engine.ctx.currentTime - engine.outputLatency;
    const abs = this.anchorBeat + (now - this.anchorTime) / this.spb;
    if (abs < this.startAbs) return { beat: abs - this.startAbs, eventIndex: -1, countIn: true };
    const total = this.seq.totalBeats;
    let beat = abs;
    if (this.settings.loop && total > 0) beat = abs - Math.floor(abs / total) * total;
    else if (abs >= total) beat = total - 1e-6;
    const evs = this.seq.events;
    let lo = 0;
    let hi = evs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (evs[mid].beat <= beat + 1e-9) lo = mid;
      else hi = mid - 1;
    }
    return { beat, eventIndex: lo, countIn: false };
  }

  private tick() {
    if (!this.playing || !this.seq || !this.buses) return;
    const ctx = engine.ctx;
    const horizon = ctx.currentTime + LOOKAHEAD;
    const total = this.seq.totalBeats;
    let guard = 0;
    while (guard++ < 2000) {
      if (this.nextItem >= this.items.length) {
        if (this.settings.loop) {
          this.pass++;
          this.passOffset += total;
          this.nextItem = 0;
          const passCount = this.pass;
          const at = this.timeOf(this.passOffset);
          const delay = Math.max(0, (at - ctx.currentTime) * 1000);
          window.setTimeout(() => this.playing && this.emit({ type: 'pass', count: passCount }), delay);
          this.applyTrainer();
          continue;
        }
        const endAt = this.timeOf(this.passOffset + total);
        if (!this.endTimer) {
          const delay = Math.max(0, (endAt - ctx.currentTime + engine.outputLatency) * 1000 + 60);
          this.endTimer = window.setTimeout(() => {
            this.endTimer = 0;
            if (this.playing) {
              this.stop();
              this.emit({ type: 'end' });
            }
          }, delay);
        }
        return;
      }
      const it = this.items[this.nextItem];
      const t = this.timeOf(this.passOffset + it.beat);
      if (t >= horizon) break;
      if (t >= ctx.currentTime - 0.05) {
        if (it.kind === 'event') this.scheduleEvent(it.ev, t);
        else this.scheduleStep(it, t);
      }
      this.nextItem++;
    }
  }

  private applyTrainer() {
    const tr = this.settings.trainer;
    if (!tr.enabled || tr.everyPasses <= 0 || this.pass % tr.everyPasses !== 0) return;
    if (this.settings.bpm >= tr.target) return;
    const bpm = Math.min(tr.target, this.settings.bpm + tr.increment);
    this.settings = { ...this.settings, bpm };
    this.reanchor(bpm);
    this.emit({ type: 'bpm', bpm });
  }

  private scheduleEvent(ev: SeqEvent, t: number) {
    if (!this.buses || ev.tie || !ev.notes.length) return;
    const strum = ev.pm ? 0.003 : ev.notes.length > 3 ? 0.012 : 0.007;
    ev.notes.forEach((n, i) => {
      const at = t + i * strum;
      this.voices.get(n.string)?.stop(at);
      const v = playNote(
        {
          midi: n.midi,
          time: at,
          duration: Math.max(0.03, n.durBeats * this.spb - i * strum - 0.01),
          art: n.art,
          velocity: n.velocity,
          dead: n.dead,
          slideFrom: n.slideFrom,
          bend: n.bend,
          vibrato: n.vibrato,
        },
        this.buses!.guitar,
      );
      this.voices.set(n.string, v);
    });
  }

  private scheduleStep(it: Extract<Item, { kind: 'step' }>, t: number) {
    if (!this.buses || !this.seq) return;
    const s = this.settings;
    const eighthBased = this.seq.timeSig[1] === 8;
    const clickEvery = eighthBased ? 2 : 4;
    if (s.metronome && it.step % clickEvery === 0) {
      const accent = it.step === 0 || (eighthBased && it.steps % 6 === 0 && it.step % 6 === 0);
      playClick(s.clickSound, accent ? 2 : 1, t, this.buses.clicks);
    }
    if (s.drums !== 'none') {
      if (it.step === 0 && it.measureIndex === 0) playDrum('crash', t, 0.8, this.buses.drums);
      for (const h of drumHits(s.drums, it.step, it.steps)) playDrum(h.voice, t, h.vel, this.buses.drums);
    }
  }
}

export const DEFAULT_PLAYER_SETTINGS: PlayerSettings = {
  bpm: 100,
  loop: true,
  metronome: false,
  countIn: true,
  drums: 'none',
  guitarMuted: false,
  guitarVol: 1,
  drumVol: 0.8,
  clickVol: 0.8,
  clickSound: 'click',
  trainer: { enabled: false, increment: 4, everyPasses: 2, target: 140 },
};
