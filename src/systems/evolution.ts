import { getEvolution } from '../data/evolutions';
import { getMove } from '../data/moves';
import { movesKnownAtLevel, newMovesOnLevelUp } from '../data/learnsets';
import { getCreature } from '../data/creatures';
import type { CritterInstance } from './stats';
import { recalcStats, displayName } from './stats';

export function checkEvolution(c: CritterInstance): string | null {
  return getEvolution(c.speciesId, c.level);
}

export function evolveCritter(c: CritterInstance, toSpecies: string): void {
  c.speciesId = toSpecies;
  recalcStats(c);
  const moveIds = movesKnownAtLevel(toSpecies, c.level);
  c.moves = moveIds.map(id => {
    const m = getMove(id);
    const existing = c.moves.find(x => x.id === id);
    return { id, pp: existing?.pp ?? m.pp, maxPp: m.pp };
  });
}

export function processLevelUp(c: CritterInstance, oldLevel: number): { messages: string[]; movesToLearn: string[] } {
  const messages: string[] = [];
  const movesToLearn = newMovesOnLevelUp(c.speciesId, oldLevel, c.level).filter(
    id => !c.moves.some(m => m.id === id),
  );
  return { messages, movesToLearn };
}

export function evolutionMessage(fromId: string, toId: string): string {
  return `What? ${getCreature(fromId).name} is evolving! ... It evolved into ${getCreature(toId).name}!`;
}
