import type { CritterInstance } from '../systems/stats';
import { getCreature } from '../data/creatures';
import { createCritter } from '../systems/stats';

/** Two-line battle stat summary for UI panels. */
export function formatStatLines(c: CritterInstance): [string, string] {
  const s = c.stats;
  return [
    `HP ${c.maxHp}   ATK ${s.atk}   DEF ${s.def}`,
    `SPA ${s.spa}   SPD ${s.spd}   SPE ${s.spe}`,
  ];
}

/** Single compact row for battle HUD. */
export function formatStatCompact(c: CritterInstance): string {
  const s = c.stats;
  return `ATK ${s.atk}  DEF ${s.def}  SPA ${s.spa}  SPD ${s.spd}  SPE ${s.spe}`;
}

/** Preview stats at a given level (starter select). Uses average IVs via createCritter. */
export function previewStatsAtLevel(speciesId: string, level: number): [string, string] {
  const preview = createCritter(speciesId, level, undefined, {
    ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
    nature: 'hardy',
  });
  return formatStatLines(preview);
}

/** Base stat reference from species def (critterdex-style). */
export function formatBaseStats(speciesId: string): [string, string] {
  const b = getCreature(speciesId).baseStats;
  return [
    `HP ${b.hp}   ATK ${b.atk}   DEF ${b.def}`,
    `SPA ${b.spa}   SPD ${b.spd}   SPE ${b.spe}`,
  ];
}

/** Four core base stats for starter comparison (species totals, not battle values). */
export function starterBaseStats(speciesId: string): { hp: number; atk: number; def: number; spd: number } {
  const b = getCreature(speciesId).baseStats;
  return { hp: b.hp, atk: b.atk, def: b.def, spd: b.spe };
}
