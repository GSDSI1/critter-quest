import { describe, expect, it } from 'vitest';
import { warpGateAllowed } from '../warpGates';

describe('warpGateAllowed', () => {
  const groveWarp = {
    x: 0, y: 0, toMap: 'secret_grove', toX: 10, toY: 14,
    requiresAllBadges: ['verdant', 'ember'] as string[],
  };

  it('blocks secret grove without both badges or champion', () => {
    expect(warpGateAllowed(groveWarp, ['verdant'], {})).toBe(false);
    expect(warpGateAllowed(groveWarp, ['ember'], {})).toBe(false);
    expect(warpGateAllowed(groveWarp, [], {})).toBe(false);
  });

  it('allows secret grove with both badges', () => {
    expect(warpGateAllowed(groveWarp, ['verdant', 'ember'], {})).toBe(true);
  });

  it('allows secret grove for champion without badges', () => {
    expect(warpGateAllowed(groveWarp, [], { champion: true })).toBe(true);
  });

  it('blocks victory road champion flag warp for non-champion', () => {
    const warp = { x: 0, y: 0, toMap: 'victory_road', toX: 1, toY: 1, requiresFlag: 'champion' };
    expect(warpGateAllowed(warp, ['verdant', 'ember', 'frost', 'psyche'], {})).toBe(false);
    expect(warpGateAllowed(warp, [], { champion: true })).toBe(true);
  });

  it('blocks single-badge warps until earned', () => {
    const warp = { x: 0, y: 0, toMap: 'route4', toX: 1, toY: 1, requiresBadge: 'ember' };
    expect(warpGateAllowed(warp, ['verdant'], {})).toBe(false);
    expect(warpGateAllowed(warp, ['verdant', 'ember'], {})).toBe(true);
  });
});
