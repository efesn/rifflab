import type { Riff } from './types';
import { EXERCISES } from './exercises';
import { CLASSICS } from './classics';
import { RAMMSTEIN } from './rammstein';
import { TUNINGS } from '../tunings';
import { parseDsl } from '../../tab/dsl';
import { parseAsciiTab } from '../../tab/ascii';
import type { ParsedTab } from '../../tab/types';

export const BUILTIN_RIFFS: Riff[] = [...RAMMSTEIN, ...CLASSICS, ...EXERCISES];

export function allRiffs(custom: Riff[]): Riff[] {
  return [...BUILTIN_RIFFS, ...custom];
}

export function findRiff(id: string, custom: Riff[] = []): Riff | undefined {
  return BUILTIN_RIFFS.find((r) => r.id === id) ?? custom.find((r) => r.id === id);
}

export interface ParsedRiffSection {
  name: string;
  tab: ParsedTab;
  repeat?: number;
  note?: string;
}

const cache = new Map<string, { sections: ParsedRiffSection[]; warnings: string[] }>();

export function parseRiff(riff: Riff): { sections: ParsedRiffSection[]; warnings: string[] } {
  const key = `${riff.id}|${riff.tuning}|${riff.timeSig.join('/')}|${riff.source ?? 'dsl'}|${riff.ascii?.timing}|${riff.ascii?.unit}|${riff.sections.map((s) => s.tab).join('§')}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const tuning = TUNINGS[riff.tuning]?.notes ?? TUNINGS.standard.notes;
  const warnings: string[] = [];
  const sections = riff.sections.map((s) => {
    const tab =
      riff.source === 'ascii'
        ? parseAsciiTab(s.tab, { timing: riff.ascii?.timing ?? 'spacing', unit: riff.ascii?.unit ?? 0.5, timeSig: riff.timeSig })
        : parseDsl(s.tab, { tuning, timeSig: riff.timeSig });
    tab.warnings.forEach((w) => warnings.push(`${s.name}: ${w}`));
    return { name: s.name, tab, repeat: s.repeat, note: s.note };
  });
  const out = { sections, warnings };
  cache.set(key, out);
  if (cache.size > 200) cache.delete(cache.keys().next().value!);
  return out;
}
