export interface EvolutionDef {
  from: string;
  to: string;
  level: number;
}

export const EVOLUTIONS: EvolutionDef[] = [
  { from: 'emberpup', to: 'flamewyrm', level: 16 },
  { from: 'flamewyrm', to: 'infernox', level: 36 },
  { from: 'aqualet', to: 'tidefin', level: 16 },
  { from: 'tidefin', to: 'aquadel', level: 36 },
  { from: 'leafkit', to: 'vineclaw', level: 16 },
  { from: 'vineclaw', to: 'thornbeast', level: 36 },
  { from: 'sparkbit', to: 'voltwing', level: 18 },
  { from: 'mossling', to: 'bloomoss', level: 18 },
  { from: 'pebblite', to: 'rockord', level: 20 },
  { from: 'shadeling', to: 'shadespecter', level: 28 },
  { from: 'cinderkit', to: 'flamewyrm', level: 16 },
  { from: 'flamewyrm', to: 'emberlord', level: 36 },
  { from: 'tidewisp', to: 'tidefin', level: 16 },
  { from: 'thornling', to: 'vineclaw', level: 16 },
  { from: 'voltite', to: 'voltwing', level: 18 },
  { from: 'frostkit', to: 'glacetail', level: 16 },
  { from: 'glacetail', to: 'arctodon', level: 36 },
  { from: 'mindling', to: 'cerebrain', level: 16 },
  { from: 'cerebrain', to: 'astralyn', level: 36 },
  { from: 'snowpuff', to: 'blizzhound', level: 18 },
  { from: 'dreamwisp', to: 'somnara', level: 28 },
  { from: 'kelpling', to: 'reefguard', level: 22 },
  { from: 'coalemb', to: 'embershell', level: 26 },
  { from: 'frostnip', to: 'glaciara', level: 20 },
  { from: 'murkfox', to: 'shadeprowl', level: 22 },
  { from: 'brinepup', to: 'tidemast', level: 24 },
  { from: 'thornbud', to: 'thornqueen', level: 22 },
  { from: 'crystmite', to: 'prismdon', level: 26 },
];

export function getEvolution(speciesId: string, level: number): string | null {
  const evo = EVOLUTIONS.find(e => e.from === speciesId && level >= e.level);
  return evo?.to ?? null;
}

export function getEvolutionChain(speciesId: string): string[] {
  const chain = [speciesId];
  let current = speciesId;
  while (true) {
    const next = EVOLUTIONS.find(e => e.from === current);
    if (!next) break;
    chain.push(next.to);
    current = next.to;
  }
  return chain;
}

export function getBaseSpecies(speciesId: string): string {
  const parent = EVOLUTIONS.find(e => e.to === speciesId);
  if (!parent) return speciesId;
  return getBaseSpecies(parent.from);
}
