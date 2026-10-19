import { describe, expect, it } from 'vitest';
import { detectPitch } from './pitch';

function tone(freq: number, sr: number, n: number, harmonics = [1, 0.6, 0.4, 0.25]) {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    harmonics.forEach((a, h) => (v += a * Math.sin((2 * Math.PI * freq * (h + 1) * i) / sr + h)));
    buf[i] = v * 0.3;
  }
  return buf;
}

describe('YIN perde algılama', () => {
  for (const f of [65.41, 73.42, 82.41, 110, 146.83, 196, 246.94, 329.63, 659.26]) {
    it(`${f} Hz`, () => {
      const r = detectPitch(tone(f, 24000, 2048), 24000);
      expect(r).not.toBeNull();
      const cents = 1200 * Math.log2(r!.freq / f);
      expect(Math.abs(cents)).toBeLessThan(3);
    });
  }

  it('güçlü ikinci harmonikte oktav hatası yapmaz', () => {
    const r = detectPitch(tone(82.41, 24000, 2048, [0.4, 1, 0.5]), 24000);
    expect(Math.abs(1200 * Math.log2(r!.freq / 82.41))).toBeLessThan(5);
  });

  it('gürültüde sonuç döndürmez', () => {
    const buf = new Float32Array(2048).map(() => Math.random() * 2 - 1);
    expect(detectPitch(buf, 24000)).toBeNull();
  });
});
