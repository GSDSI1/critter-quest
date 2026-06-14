import { describe, it, expect } from 'vitest';
import { gateOpen } from '../npcGates';
import type { MapNpc } from '../../data/maps';
import { GameState } from '../stats';

function gateNpc(badge?: string, flag?: keyof typeof GameState.player.storyFlags): MapNpc {
  return {
    id: 'gate_test',
    name: 'Gate',
    x: 0,
    y: 0,
    lines: [],
    gate: {
      blockLines: ['Blocked'],
      requiresBadge: badge,
      requiresFlag: flag,
    },
  };
}

describe('gateOpen', () => {
  it('allows passage when no gate', () => {
    expect(gateOpen({ id: 'x', name: 'X', x: 0, y: 0, lines: [] })).toBe(true);
  });

  it('blocks without required badge', () => {
    GameState.reset();
    expect(gateOpen(gateNpc('verdant'))).toBe(false);
    GameState.player.badges.push('verdant');
    expect(gateOpen(gateNpc('verdant'))).toBe(true);
  });

  it('blocks without required story flag', () => {
    GameState.reset();
    expect(gateOpen(gateNpc(undefined, 'league_ready'))).toBe(false);
    GameState.player.storyFlags.league_ready = true;
    expect(gateOpen(gateNpc(undefined, 'league_ready'))).toBe(true);
  });
});
