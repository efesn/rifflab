// Günlük antrenman şablonları. Riff blokları kullanıcının ilerlemesine göre seçilir.

import type { RiffProgress } from '../store/progress';
import type { Riff } from './riffs/types';

export type BlockKind = 'tune' | 'riff' | 'free' | 'chords';

export interface RoutineBlock {
  title: string;
  minutes: number;
  desc: string;
  kind: BlockKind;
  riffId?: string;
  link?: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  minutes: number;
  desc: string;
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  { id: 'kisa', name: 'Hızlı', minutes: 15, desc: 'Yoğun günler için: ısın, bir teknik çalış, bir riff çal.' },
  { id: 'standart', name: 'Standart', minutes: 30, desc: 'Dengeli program: ısınma, teknik, akor/gam ve riff.' },
  { id: 'yogun', name: 'Yoğun', minutes: 45, desc: 'Dayanıklılık bloğu ve iki riff ile tam çalışma.' },
];

const TECHNIQUE_ORDER = ['palm-mute-temelleri', 'power-chord-gecis', 'alternate-tek-tel', 'drop-d-tek-parmak', 'galop', 'legato', 'bend-vibrato'];

function pickRiffs(all: Riff[], progress: Record<string, RiffProgress>, lessonsDone: number) {
  const notMastered = (id: string) => progress[id]?.status !== 'mastered';
  const technique = TECHNIQUE_ORDER.find(notMastered) ?? 'galop';
  const maxDiff = Math.min(5, 1 + Math.floor(lessonsDone / 3));
  const learning = all
    .filter((r) => r.category !== 'exercise' && progress[r.id]?.status === 'learning')
    .sort((a, b) => (progress[b.id]?.lastPracticed ?? '').localeCompare(progress[a.id]?.lastPracticed ?? ''));
  const candidates = all.filter((r) => (r.category === 'rammstein' || r.category === 'classic') && r.difficulty <= maxDiff && notMastered(r.id));
  const day = new Date().getDate();
  const fresh = candidates.length ? candidates[day % candidates.length] : all.find((r) => r.category === 'classic');
  const main = learning[0] ?? fresh;
  const second = learning[1] ?? candidates.find((r) => r.id !== main?.id) ?? fresh;
  const warmup = lessonsDone >= 4 && notMastered('orumcek') ? 'orumcek' : 'kromatik-isinma';
  const harmony = lessonsDone >= 10 ? 'pentatonik-am' : 'acik-akor-gecis';
  return { technique, main: main?.id, second: second?.id, warmup, harmony };
}

export function buildRoutine(templateId: string, all: Riff[], progress: Record<string, RiffProgress>, lessonsDone: number): RoutineBlock[] {
  const p = pickRiffs(all, progress, lessonsDone);
  const tune: RoutineBlock = { title: 'Akort', minutes: 1, kind: 'tune', desc: 'Gitarını akort et. Mikrofonu açıp altı teli de yeşile getir.', link: '/akort' };
  const warm = (m: number): RoutineBlock => ({ title: 'Isınma', minutes: m, kind: 'riff', riffId: p.warmup, desc: 'Yavaş başla; her nota temiz ve eşit olsun. Elin ısınınca tempoyu biraz artır.' });
  const tech = (m: number): RoutineBlock => ({ title: 'Teknik', minutes: m, kind: 'riff', riffId: p.technique, desc: 'Bugünün teknik çalışması. Metronomu açık tut, temiz çaldığın tempoyu kaydet.' });
  const riff = (m: number, id?: string, second = false): RoutineBlock => ({
    title: second ? 'İkinci riff' : 'Riff çalışması',
    minutes: m,
    kind: 'riff',
    riffId: id,
    desc: 'Önce yavaş ve döngüde, sonra davulla. Zor ölçüleri Shift + tık ile seçip ayrıca çalış.',
  });
  const harmony = (m: number): RoutineBlock => ({ title: 'Akor / gam', minutes: m, kind: 'riff', riffId: p.harmony, desc: 'Sol elin hafızası için akor geçişleri ya da gam kalıbı.' });
  const free = (m: number): RoutineBlock => ({ title: 'Serbest çalma', minutes: m, kind: 'free', desc: 'Bildiğin riffleri çal, doğaçlama yap ya da sadece eğlen. Müzik yapmak için buradasın!' });
  const stamina = (m: number): RoutineBlock => ({ title: 'Dayanıklılık', minutes: m, kind: 'riff', riffId: 'downpicking-dayaniklilik', desc: 'Sadece aşağı vuruş. Kolun yanarsa tempoyu düşür, gerginleşme.' });

  switch (templateId) {
    case 'kisa':
      return [tune, warm(3), tech(4), riff(5, p.main), free(2)];
    case 'yogun':
      return [tune, warm(5), tech(7), stamina(5), harmony(6), riff(10, p.main), riff(7, p.second, true), free(4)];
    default:
      return [tune, warm(4), tech(6), harmony(5), riff(10, p.main), free(4)];
  }
}
