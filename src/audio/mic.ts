// Mikrofon / ses kartı girişi: perde algılama ve vuruş (onset) tespiti için örnekleri okur.

import { engine } from './engine';
import { detectPitch, rms, type PitchResult } from './pitch';

export interface MicFrame {
  pitch: PitchResult | null;
  /** Tüm penceredeki RMS seviye (0..1) */
  level: number;
  /** Son ~20 ms'nin RMS seviyesi (vuruş tespiti için) */
  recent: number;
}

export class MicInput {
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buf = new Float32Array(4096);
  private half = new Float32Array(2048);
  gate = 0.008;

  get active() {
    return !!this.stream;
  }

  async start(deviceId?: string) {
    this.stop();
    const ctx = await engine.resume();
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Bu tarayıcı mikrofon erişimini desteklemiyor.');
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    this.source = ctx.createMediaStreamSource(this.stream);
    this.analyser = new AnalyserNode(ctx, { fftSize: 4096, smoothingTimeConstant: 0 });
    this.source.connect(this.analyser);
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    try {
      this.source?.disconnect();
    } catch {
      /* yok say */
    }
    this.stream = null;
    this.source = null;
    this.analyser = null;
  }

  read(): MicFrame {
    if (!this.analyser) return { pitch: null, level: 0, recent: 0 };
    const buf = this.buf;
    this.analyser.getFloatTimeDomainData(buf);
    const level = rms(buf);
    const recent = rms(buf, buf.length - 1024);
    let pitch: PitchResult | null = null;
    if (level > this.gate) {
      let sr = engine.ctx.sampleRate;
      let data: Float32Array = buf;
      if (sr > 40000) {
        // 2 kat seyreltme: hesap yükünü 4 kat azaltır, gitar aralığı için yeterli çözünürlük
        const h = this.half;
        for (let i = 0; i < h.length; i++) h[i] = 0.5 * (buf[2 * i] + buf[2 * i + 1]);
        data = h;
        sr /= 2;
      }
      pitch = detectPitch(data, sr);
    }
    return { pitch, level, recent };
  }

  static async listInputs(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const all = await navigator.mediaDevices.enumerateDevices();
    return all.filter((d) => d.kind === 'audioinput');
  }
}

/**
 * Ani seviye artışlarından yeni bir pena vuruşunu tespit eder.
 * Histerezis: bir vuruştan sonra seviye tepe değerinin %70'inin altına inmeden (nota sönümlenmeye
 * başlamadan) yeni vuruş kabul edilmez; böylece aynı notanın kuyruğu tekrar vuruş sayılmaz.
 */
export class OnsetDetector {
  private lastOnset = -1;
  private armed = true;
  private peak = 0;
  private minSince = Infinity;
  constructor(
    private ratio = 2.0,
    private minGap = 0.09,
  ) {}

  feed(t: number, v: number, gate: number): boolean {
    if (!this.armed) {
      this.peak = Math.max(this.peak, v);
      if (v < this.peak * 0.7 || v < gate) {
        this.armed = true;
        this.minSince = v;
      }
      return false;
    }
    this.minSince = Math.min(this.minSince, v);
    if (v > gate * 1.5 && v > Math.max(this.minSince, gate * 0.5) * this.ratio && t - this.lastOnset > this.minGap) {
      this.lastOnset = t;
      this.armed = false;
      this.peak = v;
      return true;
    }
    return false;
  }

  reset() {
    this.lastOnset = -1;
    this.armed = true;
    this.peak = 0;
    this.minSince = Infinity;
  }
}
