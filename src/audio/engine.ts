// Uygulamanın tek AudioContext'i ve ses yolları (bus'lar).
//   gitar → amfi → master
//   davul, metronom tıkı, referans ton → master
//   master → limiter → hoparlör

import { Amp, type ToneId } from './amp';

class AudioEngine {
  private _ctx: AudioContext | null = null;
  private _master!: GainNode;
  private _amp!: Amp;
  private _guitar!: GainNode;
  private _drums!: GainNode;
  private _clicks!: GainNode;
  private _ref!: GainNode;
  private volume = 0.8;
  private tone: ToneId = 'distortion';

  get ctx(): AudioContext {
    this.ensure();
    return this._ctx!;
  }

  private ensure() {
    if (!this._ctx) this.init();
  }

  private init() {
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    this._ctx = ctx;
    const limiter = new DynamicsCompressorNode(ctx, { threshold: -4, knee: 2, ratio: 16, attack: 0.002, release: 0.12 });
    this._master = ctx.createGain();
    this._master.gain.value = this.volume;
    this._master.connect(limiter).connect(ctx.destination);

    this._amp = new Amp(ctx);
    this._amp.setTone(this.tone, true);
    this._amp.output.connect(this._master);

    this._guitar = ctx.createGain();
    this._guitar.connect(this._amp.input);
    this._drums = ctx.createGain();
    this._drums.gain.value = 0.7;
    this._drums.connect(this._master);
    this._clicks = ctx.createGain();
    this._clicks.gain.value = 0.8;
    this._clicks.connect(this._master);
    this._ref = ctx.createGain();
    this._ref.gain.value = 0.5;
    this._ref.connect(this._master);
  }

  /** Tarayıcılar sesi ancak bir kullanıcı etkileşiminden sonra başlatır. */
  async resume(): Promise<AudioContext> {
    const ctx = this.ctx;
    if (ctx.state !== 'running') {
      try {
        await ctx.resume();
      } catch {
        /* yok say */
      }
    }
    return ctx;
  }

  get guitarBus(): GainNode {
    this.ensure();
    return this._guitar;
  }
  get drumBus(): GainNode {
    this.ensure();
    return this._drums;
  }
  get clickBus(): GainNode {
    this.ensure();
    return this._clicks;
  }
  get refBus(): GainNode {
    this.ensure();
    return this._ref;
  }

  /** Çıkış gecikmesi (saniye): ekrandaki imleci duyulan sesle hizalamak için. */
  get outputLatency(): number {
    const c = this._ctx;
    if (!c) return 0;
    const o = (c as AudioContext & { outputLatency?: number }).outputLatency ?? 0;
    return (c.baseLatency || 0) + (Number.isFinite(o) ? o : 0);
  }

  setVolume(v: number) {
    this.volume = v;
    if (this._ctx) this._master.gain.setTargetAtTime(v, this._ctx.currentTime, 0.02);
  }

  setTone(t: ToneId) {
    this.tone = t;
    if (this._ctx) this._amp.setTone(t);
  }

  getTone(): ToneId {
    return this.tone;
  }

  /** Belirli bir zamanda başlayıp bittiğinde kendini kapatan geçici bir alt bus oluşturur. */
  createSubBus(dest: AudioNode, gain = 1): GainNode {
    const g = this.ctx.createGain();
    g.gain.value = gain;
    g.connect(dest);
    return g;
  }
}

export const engine = new AudioEngine();

/** Geçici bir bus'ı yumuşakça susturup bağlantısını keser (planlanmış tüm sesleri iptal eder). */
export function fadeOutAndDisconnect(bus: GainNode, seconds = 0.03) {
  const ctx = bus.context;
  const t = ctx.currentTime;
  try {
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(0, t + seconds);
  } catch {
    /* yok say */
  }
  window.setTimeout(() => {
    try {
      bus.disconnect();
    } catch {
      /* yok say */
    }
  }, seconds * 1000 + 80);
}
