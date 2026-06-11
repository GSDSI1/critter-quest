import { getCreature } from './creatures';
import { defaultRng, type Rng } from '../systems/rng';
import { isNight } from '../systems/dayNight';

export interface EncounterEntry {
  id: string;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

export const ENCOUNTER_TABLES: Record<string, EncounterEntry[]> = {
  route1: [
    { id: 'mossling', minLevel: 2, maxLevel: 5, weight: 28 },
    { id: 'pebblite', minLevel: 3, maxLevel: 6, weight: 22 },
    { id: 'voltchick', minLevel: 3, maxLevel: 6, weight: 14 },
    { id: 'sparkbit', minLevel: 4, maxLevel: 7, weight: 12 },
    { id: 'leafkit', minLevel: 3, maxLevel: 5, weight: 10 },
    { id: 'shadeling', minLevel: 5, maxLevel: 8, weight: 8 },
    { id: 'emberpup', minLevel: 4, maxLevel: 6, weight: 5 },
    { id: 'aqualet', minLevel: 4, maxLevel: 6, weight: 5 },
  ],
  forest: [
    { id: 'mossling', minLevel: 5, maxLevel: 8, weight: 16 },
    { id: 'shadeling', minLevel: 6, maxLevel: 10, weight: 14 },
    { id: 'murkfox', minLevel: 7, maxLevel: 11, weight: 12 },
    { id: 'thornbud', minLevel: 6, maxLevel: 10, weight: 10 },
    { id: 'thornqueen', minLevel: 10, maxLevel: 14, weight: 4 },
    { id: 'leafkit', minLevel: 6, maxLevel: 9, weight: 10 },
    { id: 'pebblite', minLevel: 7, maxLevel: 10, weight: 12 },
    { id: 'voltwing', minLevel: 10, maxLevel: 14, weight: 8 },
    { id: 'flamewyrm', minLevel: 8, maxLevel: 12, weight: 5 },
    { id: 'tidefin', minLevel: 8, maxLevel: 12, weight: 5 },
    { id: 'crystalynx', minLevel: 12, maxLevel: 16, weight: 2 },
  ],
  route2: [
    { id: 'bloomoss', minLevel: 10, maxLevel: 14, weight: 18 },
    { id: 'thornbud', minLevel: 9, maxLevel: 13, weight: 16 },
    { id: 'sparkbit', minLevel: 9, maxLevel: 13, weight: 16 },
    { id: 'thornling', minLevel: 10, maxLevel: 14, weight: 14 },
    { id: 'rockord', minLevel: 12, maxLevel: 16, weight: 10 },
    { id: 'voltwing', minLevel: 12, maxLevel: 16, weight: 8 },
    { id: 'mistral', minLevel: 11, maxLevel: 15, weight: 12 },
  ],
  route3: [
    { id: 'cinderkit', minLevel: 12, maxLevel: 16, weight: 20 },
    { id: 'voltite', minLevel: 11, maxLevel: 15, weight: 18 },
    { id: 'tidewisp', minLevel: 12, maxLevel: 16, weight: 16 },
    { id: 'kelpling', minLevel: 11, maxLevel: 15, weight: 12 },
    { id: 'brinepup', minLevel: 11, maxLevel: 15, weight: 12 },
    { id: 'tidemast', minLevel: 15, maxLevel: 19, weight: 4 },
    { id: 'coralite', minLevel: 13, maxLevel: 17, weight: 10 },
    { id: 'reefguard', minLevel: 15, maxLevel: 19, weight: 5 },
    { id: 'flamewyrm', minLevel: 14, maxLevel: 18, weight: 8 },
    { id: 'geodeon', minLevel: 14, maxLevel: 18, weight: 5 },
  ],
  crystal_cave: [
    { id: 'pebblite', minLevel: 12, maxLevel: 16, weight: 14 },
    { id: 'crystmite', minLevel: 13, maxLevel: 17, weight: 12 },
    { id: 'prismdon', minLevel: 17, maxLevel: 21, weight: 4 },
    { id: 'rockord', minLevel: 14, maxLevel: 18, weight: 16 },
    { id: 'shadeling', minLevel: 14, maxLevel: 18, weight: 14 },
    { id: 'shadespecter', minLevel: 16, maxLevel: 22, weight: 8 },
    { id: 'crystalynx', minLevel: 15, maxLevel: 20, weight: 12 },
    { id: 'geodeon', minLevel: 15, maxLevel: 20, weight: 8 },
  ],
  volcanic_path: [
    { id: 'cinderkit', minLevel: 16, maxLevel: 20, weight: 14 },
    { id: 'grimlet', minLevel: 17, maxLevel: 22, weight: 16 },
    { id: 'coalemb', minLevel: 16, maxLevel: 21, weight: 12 },
    { id: 'ashpuff', minLevel: 15, maxLevel: 19, weight: 10 },
    { id: 'embershell', minLevel: 20, maxLevel: 26, weight: 6 },
    { id: 'emberlord', minLevel: 18, maxLevel: 24, weight: 8 },
    { id: 'flamewyrm', minLevel: 16, maxLevel: 20, weight: 12 },
    { id: 'infernox', minLevel: 20, maxLevel: 26, weight: 3 },
    { id: 'rockord', minLevel: 16, maxLevel: 20, weight: 10 },
  ],
  route4: [
    { id: 'frostkit', minLevel: 18, maxLevel: 22, weight: 20 },
    { id: 'snowpuff', minLevel: 17, maxLevel: 21, weight: 18 },
    { id: 'frostnip', minLevel: 17, maxLevel: 21, weight: 14 },
    { id: 'glaciara', minLevel: 19, maxLevel: 23, weight: 6 },
    { id: 'frostmoss', minLevel: 18, maxLevel: 22, weight: 12 },
    { id: 'pebblite', minLevel: 17, maxLevel: 21, weight: 10 },
    { id: 'aurorabit', minLevel: 19, maxLevel: 23, weight: 10 },
    { id: 'glacetail', minLevel: 20, maxLevel: 24, weight: 6 },
  ],
  glacier_pass: [
    { id: 'glacetail', minLevel: 22, maxLevel: 26, weight: 16 },
    { id: 'glaciara', minLevel: 22, maxLevel: 26, weight: 10 },
    { id: 'blizzhound', minLevel: 23, maxLevel: 27, weight: 14 },
    { id: 'frosthorn', minLevel: 22, maxLevel: 26, weight: 15 },
    { id: 'chillbite', minLevel: 24, maxLevel: 28, weight: 12 },
    { id: 'arctodon', minLevel: 26, maxLevel: 30, weight: 5 },
    { id: 'rockord', minLevel: 22, maxLevel: 26, weight: 10 },
  ],
  route5: [
    { id: 'mindling', minLevel: 26, maxLevel: 30, weight: 18 },
    { id: 'psychora', minLevel: 27, maxLevel: 31, weight: 14 },
    { id: 'stormhorn', minLevel: 27, maxLevel: 31, weight: 12 },
    { id: 'dreamwisp', minLevel: 25, maxLevel: 29, weight: 16 },
    { id: 'shadeling', minLevel: 26, maxLevel: 30, weight: 10 },
    { id: 'cerebrain', minLevel: 28, maxLevel: 32, weight: 8 },
    { id: 'psyknight', minLevel: 28, maxLevel: 32, weight: 6 },
    { id: 'somnara', minLevel: 30, maxLevel: 34, weight: 4 },
  ],
  /** Night variants — ghost/psychic skew (see dayNight.isNight). */
  forest_night: [
    { id: 'shadeling', minLevel: 6, maxLevel: 10, weight: 22 },
    { id: 'murkfox', minLevel: 7, maxLevel: 11, weight: 14 },
    { id: 'shadeprowl', minLevel: 10, maxLevel: 14, weight: 6 },
    { id: 'shadespecter', minLevel: 8, maxLevel: 12, weight: 16 },
    { id: 'nightmoth', minLevel: 7, maxLevel: 11, weight: 14 },
    { id: 'dreamwisp', minLevel: 9, maxLevel: 13, weight: 16 },
    { id: 'mossling', minLevel: 5, maxLevel: 8, weight: 10 },
    { id: 'somnara', minLevel: 12, maxLevel: 16, weight: 8 },
    { id: 'crystalynx', minLevel: 12, maxLevel: 16, weight: 4 },
  ],
  route3_night: [
    { id: 'shadeling', minLevel: 13, maxLevel: 17, weight: 24 },
    { id: 'dreamwisp', minLevel: 14, maxLevel: 18, weight: 22 },
    { id: 'shadespecter', minLevel: 15, maxLevel: 19, weight: 18 },
    { id: 'cinderkit', minLevel: 12, maxLevel: 16, weight: 14 },
    { id: 'voltite', minLevel: 11, maxLevel: 15, weight: 12 },
    { id: 'somnara', minLevel: 16, maxLevel: 20, weight: 6 },
  ],
  route5_night: [
    { id: 'somnara', minLevel: 28, maxLevel: 34, weight: 26 },
    { id: 'dreamwisp', minLevel: 26, maxLevel: 30, weight: 22 },
    { id: 'shadespecter', minLevel: 28, maxLevel: 32, weight: 18 },
    { id: 'cerebrain', minLevel: 28, maxLevel: 32, weight: 12 },
    { id: 'mindling', minLevel: 26, maxLevel: 30, weight: 10 },
    { id: 'astralyn', minLevel: 30, maxLevel: 34, weight: 6 },
  ],
  victory_road: [
    { id: 'astralyn', minLevel: 34, maxLevel: 40, weight: 10 },
    { id: 'voidseer', minLevel: 34, maxLevel: 40, weight: 12 },
    { id: 'galesprite', minLevel: 35, maxLevel: 41, weight: 8 },
    { id: 'glaciorex', minLevel: 35, maxLevel: 41, weight: 10 },
    { id: 'zenolith', minLevel: 36, maxLevel: 42, weight: 6 },
    { id: 'stormhorn', minLevel: 35, maxLevel: 41, weight: 8 },
    { id: 'reefguard', minLevel: 34, maxLevel: 40, weight: 6 },
    { id: 'shadespecter', minLevel: 34, maxLevel: 40, weight: 12 },
    { id: 'infernox', minLevel: 36, maxLevel: 42, weight: 8 },
    { id: 'arctodon', minLevel: 35, maxLevel: 41, weight: 8 },
  ],
};

export function resolveEncounterTable(tableId: string, playTimeSec = 0): string {
  if (!isNight(playTimeSec)) return tableId;
  const nightId = `${tableId}_night`;
  return ENCOUNTER_TABLES[nightId] ? nightId : tableId;
}

export function pickWildFromTable(tableId: string, rng: Rng = defaultRng): { def: ReturnType<typeof getCreature>; level: number } {
  const table = ENCOUNTER_TABLES[tableId] ?? ENCOUNTER_TABLES.route1;
  const total = table.reduce((s, e) => s + e.weight, 0);
  let roll = rng.next() * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      const level = rng.int(entry.minLevel, entry.maxLevel);
      return { def: getCreature(entry.id), level };
    }
  }
  const fb = table[0];
  return { def: getCreature(fb.id), level: fb.minLevel };
}

export const RIVAL_STARTERS: Record<string, string> = {
  emberpup: 'aqualet',
  aqualet: 'leafkit',
  leafkit: 'emberpup',
};

export function rivalStarter(playerStarter: string): string {
  return RIVAL_STARTERS[playerStarter] ?? 'emberpup';
}

export function rivalEvolved(starter: string, stage: number): string {
  const chains: Record<string, string[]> = {
    emberpup: ['emberpup', 'flamewyrm', 'infernox'],
    aqualet: ['aqualet', 'tidefin', 'aquadel'],
    leafkit: ['leafkit', 'vineclaw', 'thornbeast'],
  };
  const chain = chains[rivalStarter(starter)] ?? chains.emberpup;
  return chain[Math.min(stage, chain.length - 1)];
}
