import { describe, it, expect } from 'vitest';
import { QUESTS, claimableQuests, isQuestClaimed, questClaimFlag, questRewardLabel } from '../../data/quests';
import { GameState } from '../stats';

function freshPlayer(): typeof GameState.player {
  GameState.reset();
  return GameState.player;
}

describe('quests', () => {
  it('defines 10 quests with unique ids and rewards', () => {
    expect(QUESTS.length).toBe(10);
    const ids = new Set(QUESTS.map(q => q.id));
    expect(ids.size).toBe(10);
    for (const q of QUESTS) expect(questRewardLabel(q).length).toBeGreaterThan(0);
  });

  it('first_badge completes when a badge is earned', () => {
    const p = freshPlayer();
    const q = QUESTS.find(x => x.id === 'first_badge')!;
    expect(q.isComplete(p)).toBe(false);
    p.badges.push('verdant');
    expect(q.isComplete(p)).toBe(true);
  });

  it('claimableQuests excludes claimed quests', () => {
    const p = freshPlayer();
    p.badges.push('verdant');
    expect(claimableQuests(p).some(q => q.id === 'first_badge')).toBe(true);
    p.storyFlags[questClaimFlag('first_badge')] = true;
    expect(claimableQuests(p).some(q => q.id === 'first_badge')).toBe(false);
    expect(isQuestClaimed(p, 'first_badge')).toBe(true);
  });

  it('explorer counts visited maps', () => {
    const p = freshPlayer();
    const q = QUESTS.find(x => x.id === 'explorer')!;
    p.visitedMaps = Array.from({ length: 15 }, (_, i) => `map${i}`);
    expect(q.isComplete(p)).toBe(true);
  });
});
