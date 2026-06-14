import { describe, it, expect } from 'vitest';
import {
  momDialogLines,
  trainerDefeatedLines,
  profChampionLines,
  NPC_SPRITE_TINTS,
} from '../../data/npcDialogs';
import { GameState } from '../stats';

describe('npcDialogs', () => {
  it('mom lines escalate with badges', () => {
    GameState.reset();
    expect(momDialogLines(GameState.player)[0]).toContain('careful');
    GameState.player.badges.push('verdant');
    expect(momDialogLines(GameState.player)[0]).toContain('badge');
    GameState.player.storyFlags.champion = true;
    expect(momDialogLines(GameState.player)[0]).toContain('champion');
  });

  it('trainer defeated lines differ for rematch', () => {
    expect(trainerDefeatedLines(false)[0]).toContain('already defeated');
    expect(trainerDefeatedLines(true)[0]).toContain('again');
  });

  it('prof champion lines include sign-read hint at 10+', () => {
    const lines = profChampionLines('Ash', 12);
    expect(lines.some(l => l.includes('12'))).toBe(true);
  });

  it('gym leader tints defined', () => {
    expect(NPC_SPRITE_TINTS.gym_leader).toBeDefined();
    expect(NPC_SPRITE_TINTS.champion).toBeDefined();
  });
});
