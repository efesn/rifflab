// Basit amfi + kabin simülasyonu: ön filtre → sürüş (waveshaper) → ton katı → kabin → çıkış.

export type ToneId = 'clean' | 'crunch' | 'distortion';

interface ToneSpec {
  drive: number;
  preHp: number;
  midBoostDb: number;
  lowDb: number;
  scoopDb: number;
  presenceDb: number;
  cabHz: number;
  out: number;
  reverb: number;
}

const TONES: Record<ToneId, ToneSpec> = {
  clean: { drive: 1.4, preHp: 50, midBoostDb: 0, lowDb: 2, scoopDb: 0, presenceDb: 2, cabHz: 8000, out: 1.15, reverb: 0.24 },
  crunch: { drive: 7, preHp: 90, midBoostDb: 4, lowDb: 3, scoopDb: -2, presenceDb: 3, cabHz: 5600, out: 0.6, reverb: 0.14 },
  distortion: { drive: 32, preHp: 115, midBoostDb: 6, lowDb: 5, scoopDb: -4, presenceDb: 4, cabHz: 4900, out: 0.4, reverb: 0.09 },
};

export const TONE_LABELS: Record<ToneId, string> = {
  clean: 'Temiz',
  crunch: 'Crunch',
  distortion: 'Distorsiyon',
};

function makeCurve(drive: number): Float32Array<ArrayBuffer> {
  const n = 4096;
  const curve = new Float32Array(n);
  // Hafif asimetri (tüp benzeri çift harmonikler). Kayma sürüşten bağımsız tutulur ve
  // eğri [-1, 1] aralığına normalize edilir; oluşan DC'yi amfi çıkışındaki yüksek geçiren filtre siler.
  const b = Math.min(0.25, drive * 0.1);
  const off = Math.tanh(b);
  const norm = Math.max(Math.abs(Math.tanh(-drive + b) - off), Math.abs(Math.tanh(drive + b) - off));
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = (Math.tanh(drive * x + b) - off) / norm;
  }
  return curve;
}

function makeImpulse(ctx: BaseAudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const pre = Math.floor(ctx.sampleRate * 0.012);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / len;
      lp += 0.45 * (Math.random() * 2 - 1 - lp);
      d[i] = lp * Math.pow(1 - t, decay);
    }
  }
  return buf;
}

export class Amp {
  readonly input: GainNode;
  readonly output: GainNode;
  private preHp: BiquadFilterNode;
  private midBoost: BiquadFilterNode;
  private shaper: WaveShaperNode;
  private low: BiquadFilterNode;
  private scoop: BiquadFilterNode;
  private presence: BiquadFilterNode;
  private cab1: BiquadFilterNode;
  private cab2: BiquadFilterNode;
  private postHp: BiquadFilterNode;
  private outGain: GainNode;
  private reverbSend: GainNode;
  private ctx: BaseAudioContext;
  tone: ToneId = 'distortion';

  constructor(ctx: BaseAudioContext) {
    this.ctx = ctx;
    this.input = ctx.createGain();
    this.input.gain.value = 0.38;
    this.preHp = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 100, Q: 0.6 });
    this.midBoost = new BiquadFilterNode(ctx, { type: 'peaking', frequency: 800, Q: 0.8, gain: 0 });
    this.shaper = new WaveShaperNode(ctx, { oversample: '4x' });
    this.low = new BiquadFilterNode(ctx, { type: 'lowshelf', frequency: 130, gain: 0 });
    this.scoop = new BiquadFilterNode(ctx, { type: 'peaking', frequency: 520, Q: 1.0, gain: 0 });
    this.presence = new BiquadFilterNode(ctx, { type: 'peaking', frequency: 2600, Q: 1.0, gain: 0 });
    this.cab1 = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 5000, Q: 0.75 });
    this.cab2 = new BiquadFilterNode(ctx, { type: 'lowpass', frequency: 7000, Q: 0.5 });
    this.postHp = new BiquadFilterNode(ctx, { type: 'highpass', frequency: 65, Q: 0.7 });
    this.outGain = ctx.createGain();
    this.output = ctx.createGain();

    this.input
      .connect(this.preHp)
      .connect(this.midBoost)
      .connect(this.shaper)
      .connect(this.low)
      .connect(this.scoop)
      .connect(this.presence)
      .connect(this.cab1)
      .connect(this.cab2)
      .connect(this.postHp)
      .connect(this.outGain)
      .connect(this.output);

    const convolver = new ConvolverNode(ctx, { buffer: makeImpulse(ctx, 1.8, 3.2) });
    this.reverbSend = ctx.createGain();
    this.outGain.connect(this.reverbSend).connect(convolver).connect(this.output);

    this.setTone('distortion', true);
  }

  setTone(id: ToneId, immediate = false) {
    this.tone = id;
    const s = TONES[id];
    const t = this.ctx.currentTime;
    const set = (p: AudioParam, v: number) => (immediate ? (p.value = v) : p.setTargetAtTime(v, t, 0.02));
    this.shaper.curve = makeCurve(s.drive);
    set(this.preHp.frequency, s.preHp);
    set(this.midBoost.gain, s.midBoostDb);
    set(this.low.gain, s.lowDb);
    set(this.scoop.gain, s.scoopDb);
    set(this.presence.gain, s.presenceDb);
    set(this.cab1.frequency, s.cabHz);
    set(this.cab2.frequency, s.cabHz * 1.45);
    set(this.outGain.gain, s.out);
    set(this.reverbSend.gain, s.reverb);
  }
}
