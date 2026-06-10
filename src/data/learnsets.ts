export interface LearnEntry {
  level: number;
  move: string;
}

export const LEARNSETS: Record<string, LearnEntry[]> = {
  emberpup: [
    { level: 1, move: 'scratch' }, { level: 1, move: 'growl' },
    { level: 5, move: 'ember' }, { level: 9, move: 'blaze' },
  ],
  flamewyrm: [
    { level: 1, move: 'ember' }, { level: 1, move: 'blaze' },
    { level: 20, move: 'inferno' }, { level: 26, move: 'shadowclaw' },
  ],
  infernox: [
    { level: 1, move: 'blaze' }, { level: 1, move: 'inferno' },
    { level: 40, move: 'darkpulse' }, { level: 46, move: 'thunderbolt' },
  ],
  aqualet: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'growl' },
    { level: 5, move: 'splash' }, { level: 9, move: 'tidal' },
  ],
  tidefin: [
    { level: 1, move: 'splash' }, { level: 1, move: 'tidal' },
    { level: 20, move: 'tsunami' }, { level: 24, move: 'icebeam' },
  ],
  aquadel: [
    { level: 1, move: 'tidal' }, { level: 1, move: 'tsunami' },
    { level: 38, move: 'icebeam' }, { level: 44, move: 'darkpulse' },
  ],
  leafkit: [
    { level: 1, move: 'scratch' }, { level: 1, move: 'vine' },
    { level: 6, move: 'leafblade' }, { level: 10, move: 'photosynthesis' },
  ],
  vineclaw: [
    { level: 1, move: 'vine' }, { level: 1, move: 'leafblade' },
    { level: 19, move: 'rockthrow' }, { level: 22, move: 'sleep_powder' },
  ],
  thornbeast: [
    { level: 1, move: 'leafblade' }, { level: 1, move: 'boulder' },
    { level: 38, move: 'earthquake' }, { level: 42, move: 'photosynthesis' },
  ],
  sparkbit: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'spark' },
    { level: 7, move: 'thunderbolt' }, { level: 12, move: 'growl' },
  ],
  voltwing: [
    { level: 1, move: 'spark' }, { level: 1, move: 'thunderbolt' },
    { level: 22, move: 'vine' }, { level: 28, move: 'thunderwave' },
  ],
  mossling: [
    { level: 1, move: 'tackle' }, { level: 4, move: 'vine' },
    { level: 8, move: 'photosynthesis' },
  ],
  bloomoss: [
    { level: 1, move: 'vine' }, { level: 1, move: 'leafblade' },
    { level: 22, move: 'sleep_powder' }, { level: 26, move: 'photosynthesis' },
  ],
  pebblite: [
    { level: 1, move: 'tackle' }, { level: 5, move: 'rockthrow' },
    { level: 10, move: 'boulder' },
  ],
  rockord: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'boulder' },
    { level: 24, move: 'earthquake' },
  ],
  shadeling: [
    { level: 1, move: 'scratch' }, { level: 6, move: 'shadowclaw' },
    { level: 12, move: 'darkpulse' },
  ],
  shadespecter: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'darkpulse' },
    { level: 32, move: 'hypnosis' },
  ],
  crystalynx: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'spark' },
    { level: 14, move: 'thunderbolt' }, { level: 18, move: 'boulder' },
  ],
  cinderkit: [
    { level: 1, move: 'scratch' }, { level: 5, move: 'ember' }, { level: 9, move: 'blaze' },
  ],
  emberlord: [
    { level: 1, move: 'blaze' }, { level: 1, move: 'inferno' }, { level: 38, move: 'darkpulse' },
  ],
  geodeon: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'spark' }, { level: 22, move: 'earthquake' },
  ],
  mistral: [
    { level: 1, move: 'spark' }, { level: 1, move: 'vine' }, { level: 20, move: 'thunderbolt' },
  ],
  grimlet: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'rockthrow' }, { level: 24, move: 'darkpulse' },
  ],
  coralite: [
    { level: 1, move: 'splash' }, { level: 1, move: 'rockthrow' }, { level: 18, move: 'tidal' },
  ],
  tidewisp: [
    { level: 1, move: 'splash' }, { level: 5, move: 'tackle' }, { level: 9, move: 'tidal' },
  ],
  thornling: [
    { level: 1, move: 'vine' }, { level: 5, move: 'tackle' }, { level: 10, move: 'leer' },
  ],
  voltite: [
    { level: 1, move: 'spark' }, { level: 5, move: 'tackle' }, { level: 10, move: 'thunderwave' },
  ],
};

export function movesKnownAtLevel(speciesId: string, level: number): string[] {
  const entries = LEARNSETS[speciesId] ?? LEARNSETS.mossling;
  const moves: string[] = [];
  for (const e of entries) {
    if (e.level <= level && !moves.includes(e.move)) moves.push(e.move);
  }
  return moves.slice(-4);
}

export function newMovesOnLevelUp(speciesId: string, oldLevel: number, newLevel: number): string[] {
  const entries = LEARNSETS[speciesId] ?? [];
  const learned: string[] = [];
  for (const e of entries) {
    if (e.level > oldLevel && e.level <= newLevel) learned.push(e.move);
  }
  return learned;
}

export function tryLearnMove(currentMoves: string[], moveId: string): { moves: string[]; learned: boolean; replaced?: string } {
  if (currentMoves.includes(moveId)) return { moves: currentMoves, learned: false };
  if (currentMoves.length < 4) return { moves: [...currentMoves, moveId], learned: true };
  const replaced = currentMoves[0];
  return { moves: [...currentMoves.slice(1), moveId], learned: true, replaced };
}
