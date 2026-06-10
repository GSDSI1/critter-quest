import { getCreature } from './creatures';

export interface EncounterEntry {
  id: string;
  minLevel: number;
  maxLevel: number;
  weight: number;
}

export const ENCOUNTER_TABLES: Record<string, EncounterEntry[]> = {
  route1: [
    { id: 'mossling', minLevel: 2, maxLevel: 5, weight: 30 },
    { id: 'pebblite', minLevel: 3, maxLevel: 6, weight: 25 },
    { id: 'sparkbit', minLevel: 4, maxLevel: 7, weight: 15 },
    { id: 'leafkit', minLevel: 3, maxLevel: 5, weight: 10 },
    { id: 'shadeling', minLevel: 5, maxLevel: 8, weight: 8 },
    { id: 'emberpup', minLevel: 4, maxLevel: 6, weight: 5 },
    { id: 'aqualet', minLevel: 4, maxLevel: 6, weight: 5 },
  ],
  forest: [
    { id: 'mossling', minLevel: 5, maxLevel: 8, weight: 20 },
    { id: 'shadeling', minLevel: 6, maxLevel: 10, weight: 18 },
    { id: 'leafkit', minLevel: 6, maxLevel: 9, weight: 15 },
    { id: 'pebblite', minLevel: 7, maxLevel: 10, weight: 12 },
    { id: 'voltwing', minLevel: 10, maxLevel: 14, weight: 8 },
    { id: 'flamewyrm', minLevel: 8, maxLevel: 12, weight: 5 },
    { id: 'tidefin', minLevel: 8, maxLevel: 12, weight: 5 },
    { id: 'crystalynx', minLevel: 12, maxLevel: 16, weight: 2 },
  ],
  route2: [
    { id: 'bloomoss', minLevel: 10, maxLevel: 14, weight: 20 },
    { id: 'sparkbit', minLevel: 9, maxLevel: 13, weight: 18 },
    { id: 'thornling', minLevel: 10, maxLevel: 14, weight: 15 },
    { id: 'rockord', minLevel: 12, maxLevel: 16, weight: 10 },
    { id: 'voltwing', minLevel: 12, maxLevel: 16, weight: 8 },
    { id: 'mistral', minLevel: 11, maxLevel: 15, weight: 12 },
  ],
  route3: [
    { id: 'cinderkit', minLevel: 12, maxLevel: 16, weight: 22 },
    { id: 'voltite', minLevel: 11, maxLevel: 15, weight: 20 },
    { id: 'tidewisp', minLevel: 12, maxLevel: 16, weight: 18 },
    { id: 'coralite', minLevel: 13, maxLevel: 17, weight: 12 },
    { id: 'flamewyrm', minLevel: 14, maxLevel: 18, weight: 8 },
    { id: 'geodeon', minLevel: 14, maxLevel: 18, weight: 6 },
  ],
  crystal_cave: [
    { id: 'pebblite', minLevel: 12, maxLevel: 16, weight: 15 },
    { id: 'rockord', minLevel: 14, maxLevel: 18, weight: 20 },
    { id: 'shadeling', minLevel: 14, maxLevel: 18, weight: 15 },
    { id: 'shadespecter', minLevel: 16, maxLevel: 22, weight: 10 },
    { id: 'crystalynx', minLevel: 15, maxLevel: 20, weight: 12 },
    { id: 'geodeon', minLevel: 15, maxLevel: 20, weight: 10 },
  ],
  volcanic_path: [
    { id: 'cinderkit', minLevel: 16, maxLevel: 20, weight: 18 },
    { id: 'grimlet', minLevel: 17, maxLevel: 22, weight: 20 },
    { id: 'emberlord', minLevel: 18, maxLevel: 24, weight: 8 },
    { id: 'flamewyrm', minLevel: 16, maxLevel: 20, weight: 15 },
    { id: 'infernox', minLevel: 20, maxLevel: 26, weight: 3 },
    { id: 'rockord', minLevel: 16, maxLevel: 20, weight: 12 },
  ],
};

export function pickWildFromTable(tableId: string): { def: ReturnType<typeof getCreature>; level: number } {
  const table = ENCOUNTER_TABLES[tableId] ?? ENCOUNTER_TABLES.route1;
  const total = table.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) {
      const level = entry.minLevel + Math.floor(Math.random() * (entry.maxLevel - entry.minLevel + 1));
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
