import { describe, expect, it, beforeEach } from 'vitest';
import { GameState } from '../stats';
import { regionNodeVisibility, momDiscoverabilityLine } from '../regionDiscovery';

describe('regionDiscovery', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('hides pier until verdant badge or route3 visit', () => {
    expect(regionNodeVisibility('fishing_pier', GameState.player, 'town')).toBe('hidden');
    GameState.player.badges.push('verdant');
    expect(regionNodeVisibility('fishing_pier', GameState.player, 'town')).toBe('hinted');
    GameState.player.visitedMaps.push('fishing_pier');
    expect(regionNodeVisibility('fishing_pier', GameState.player, 'town')).toBe('known');
  });

  it('hints secret grove with both badges', () => {
    GameState.player.badges.push('verdant', 'ember');
    expect(regionNodeVisibility('secret_grove', GameState.player, 'forest')).toBe('hinted');
  });

  it('mom mentions pier after verdant badge', () => {
    GameState.player.badges.push('verdant');
    expect(momDiscoverabilityLine(GameState.player)).toContain('Pier');
  });
});
