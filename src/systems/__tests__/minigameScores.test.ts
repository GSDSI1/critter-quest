import { describe, expect, it, beforeEach } from 'vitest';
import { GameState } from '../stats';
import { getMinigameBest, tryMinigameBest, formatMinigameBests } from '../minigameScores';

describe('minigameScores', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('tracks fishing best on player state', () => {
    expect(tryMinigameBest('fishingBest', 2)).toBe(true);
    expect(getMinigameBest('fishingBest')).toBe(2);
    expect(tryMinigameBest('fishingBest', 1)).toBe(false);
    expect(tryMinigameBest('fishingBest', 3)).toBe(true);
  });

  it('formats bests for pause menu', () => {
    expect(formatMinigameBests()).toBeNull();
    tryMinigameBest('bugBest', 15);
    expect(formatMinigameBests()).toContain('Bug 15');
  });
});
