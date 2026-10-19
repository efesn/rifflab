import type { Lesson } from './types';
import { LESSONS_PART1 } from './part1';
import { LESSONS_PART2 } from './part2';
import type { Technique } from '../riffs/types';

export const LESSONS: Lesson[] = [...LESSONS_PART1, ...LESSONS_PART2].sort((a, b) => a.num - b.num);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsForTechniques(techs: Technique[]): Lesson[] {
  return LESSONS.filter((l) => l.techniques?.some((t) => techs.includes(t)));
}
