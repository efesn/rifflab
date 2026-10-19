// YIN perde algılama algoritması (de Cheveigné & Kawahara, 2002).
// Monofonik sinyalde temel frekansı bulur; gitar aralığı için 55–1400 Hz ile sınırlandırılmıştır.

export interface PitchResult {
  freq: number;
  /** 0..1 arası güven değeri (1 - normalize fark) */
  clarity: number;
}

export interface YinOptions {
  threshold?: number;
  minFreq?: number;
  maxFreq?: number;
}

let scratch = new Float32Array(0);

export function detectPitch(buf: Float32Array, sampleRate: number, opts: YinOptions = {}): PitchResult | null {
  const threshold = opts.threshold ?? 0.12;
  const minFreq = opts.minFreq ?? 55;
  const maxFreq = opts.maxFreq ?? 1400;
  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(Math.floor(sampleRate / minFreq), Math.floor(buf.length / 2));
  const W = buf.length - tauMax;
  if (W <= 0 || tauMax <= tauMin) return null;

  if (scratch.length < tauMax + 2) scratch = new Float32Array(tauMax + 2);
  const d = scratch;

  // 1-2. Fark fonksiyonu
  d[0] = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }

  // 3. Birikimli ortalama ile normalize edilmiş fark
  d[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    d[tau] = running > 0 ? (d[tau] * tau) / running : 1;
  }

  // 4. Mutlak eşik: eşiğin altına düşen ilk yerel minimum
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (d[t] < threshold) {
      while (t + 1 <= tauMax && d[t + 1] < d[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau === -1) {
    // Eşik bulunamadı: en küçük değeri al, yeterince iyiyse kabul et
    let best = tauMin;
    for (let t = tauMin + 1; t <= tauMax; t++) if (d[t] < d[best]) best = t;
    if (d[best] > 0.35) return null;
    tau = best;
  }

  // 5. Parabolik interpolasyon
  let better = tau;
  if (tau > 1 && tau < tauMax) {
    const s0 = d[tau - 1];
    const s1 = d[tau];
    const s2 = d[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) better = tau + (s2 - s0) / denom;
  }

  const freq = sampleRate / better;
  if (!Number.isFinite(freq) || freq < minFreq * 0.9 || freq > maxFreq * 1.1) return null;
  return { freq, clarity: Math.max(0, Math.min(1, 1 - d[tau])) };
}

export function rms(buf: Float32Array, from = 0, to = buf.length): number {
  let s = 0;
  for (let i = from; i < to; i++) s += buf[i] * buf[i];
  return Math.sqrt(s / Math.max(1, to - from));
}

/** Kısa süreli kayan medyan: anlık sıçramaları (oktav hatalarını) bastırır. */
export class MedianSmoother {
  private values: number[] = [];
  constructor(private size = 5) {}
  push(v: number): number {
    this.values.push(v);
    if (this.values.length > this.size) this.values.shift();
    const sorted = [...this.values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }
  reset() {
    this.values = [];
  }
}
