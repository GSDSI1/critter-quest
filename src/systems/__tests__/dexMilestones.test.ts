import { describe, expect, it } from 'vitest';
import { pendingDexMilestone, claimDexMilestone, DEX_MILESTONES } from '../dexMilestones';
import { defaultPlayer } from '../stats';

describe('dexMilestones', () => {
  it('returns highest unclaimed milestone', () => {
    const p = defaultPlayer();
    p.dexCaught = Array.from({ length: 45 }, (_, i) => `species_${i}`);
    const m = pendingDexMilestone(p);
    expect(m?.count).toBe(40);
  });

  it('claims milestone and sets flag', () => {
    const p = defaultPlayer();
    p.dexCaught = Array.from({ length: 25 }, (_, i) => `s${i}`);
    const m = pendingDexMilestone(p)!;
    claimDexMilestone(p, m);
    expect(p.storyFlags.dex_milestone_20).toBe(true);
    expect((p.items.great_orb ?? 0)).toBeGreaterThan(0);
  });

  it('does not re-offer claimed milestones', () => {
    const p = defaultPlayer();
    p.dexCaught = Array.from({ length: 50 }, (_, i) => `s${i}`);
    p.storyFlags.dex_milestone_20 = true;
    p.storyFlags.dex_milestone_40 = true;
    expect(pendingDexMilestone(p)).toBeNull();
  });

  it('has four tiers defined', () => {
    expect(DEX_MILESTONES.length).toBe(5);
  });
});
