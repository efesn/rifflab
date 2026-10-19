import { describe, expect, it } from 'vitest';
import { OnsetDetector } from './mic';

/** Kare dalga zarfı: verilen anlarda vuruş, üstel sönüm; 16 ms'de bir RMS örneği */
function simulate(plucks: number[], decay: number, durationS: number, peak = 0.25, noise = 0.002) {
  const det = new OnsetDetector(1.8, 0.08);
  const onsets: number[] = [];
  for (let t = 0; t < durationS; t += 0.016) {
    let v = noise;
    for (const p of plucks) {
      const dt = t - p;
      if (dt < 0) continue;
      // RMS penceresi (~20 ms) atak sırasında yavaşça yükselir
      const attack = Math.min(1, dt / 0.02);
      v += peak * attack * Math.exp(-dt / decay);
    }
    if (det.feed(t, v, 0.008)) onsets.push(+t.toFixed(3));
  }
  return onsets;
}

describe('Vuruş (onset) dedektörü', () => {
  it('tek pena vuruşunu bir kez sayar', () => {
    expect(simulate([0.2], 0.3, 2)).toHaveLength(1);
  });

  it('art arda iki vuruşu ayrı sayar', () => {
    expect(simulate([0.2, 0.8], 0.25, 2)).toHaveLength(2);
  });

  it('hızlı palm mute chuglarını (150 ms) tek tek yakalar', () => {
    const plucks = Array.from({ length: 8 }, (_, i) => 0.2 + i * 0.15);
    expect(simulate(plucks, 0.05, 1.8)).toHaveLength(8);
  });

  it('sessizlikte ya da sabit gürültüde vuruş üretmez', () => {
    expect(simulate([], 0.3, 2)).toHaveLength(0);
  });
});
