import { GameState } from './stats';

export type MinigameBestField = 'fishingBest' | 'bugBest';

function readBest(field: MinigameBestField): number {
  return GameState.player[field] ?? 0;
}

/** Persist a new personal best; returns true if the record improved. */
export function tryMinigameBest(field: MinigameBestField, value: number): boolean {
  const prev = readBest(field);
  if (value > prev) {
    GameState.player[field] = value;
    return true;
  }
  return false;
}

export function getMinigameBest(field: MinigameBestField): number {
  return readBest(field);
}

export function formatMinigameBests(): string | null {
  const fish = readBest('fishingBest');
  const bug = readBest('bugBest');
  if (fish <= 0 && bug <= 0) return null;
  const parts: string[] = [];
  if (fish > 0) parts.push(`Fish ${fish}/3`);
  if (bug > 0) parts.push(`Bug ${bug}`);
  return `Best: ${parts.join(' · ')}`;
}
