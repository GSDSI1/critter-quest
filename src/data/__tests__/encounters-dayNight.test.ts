import { describe, expect, it } from 'vitest';
import { resolveEncounterTable, ENCOUNTER_TABLES } from '../encounters';
import { isNight } from '../../systems/dayNight';
import {
  AUTOTILE_GRASS_PATH_BASE,
  grassPathAutotileFrame,
  grassPathNeighborMask,
} from '../../utils/tileAutotile';
import type { GameMap } from '../maps/types';

describe('resolveEncounterTable', () => {
  it('returns night tables during night window', () => {
    const nightTime = 264; // mid-night window in 480s cycle
    expect(isNight(nightTime)).toBe(true);
    expect(resolveEncounterTable('forest', nightTime)).toBe('forest_night');
    expect(resolveEncounterTable('route3', nightTime)).toBe('route3_night');
    expect(resolveEncounterTable('route5', nightTime)).toBe('route5_night');
  });

  it('falls back to day table when no night variant exists', () => {
    expect(resolveEncounterTable('route1', 264)).toBe('route1');
    expect(resolveEncounterTable('route1', 0)).toBe('route1');
  });

  it('night tables are registered', () => {
    for (const id of ['forest_night', 'route3_night', 'route5_night']) {
      expect(ENCOUNTER_TABLES[id]?.length).toBeGreaterThan(0);
    }
  });
});

describe('grassPathAutotile', () => {
  const miniMap: GameMap = {
    id: 'test', name: 'Test', width: 3, height: 3,
    spawn: { x: 1, y: 1 }, encounterRate: 0,
    warps: [], npcs: [],
    tiles: [
      0, 1, 0,
      1, 0, 1,
      0, 1, 0,
    ],
  };

  it('computes neighbor mask from path adjacency', () => {
    expect(grassPathNeighborMask(miniMap, 1, 1)).toBe(1 | 2 | 4 | 8);
    expect(grassPathNeighborMask(miniMap, 0, 0)).toBe(2 | 4);
  });

  it('maps mask to autotile frame', () => {
    const frame = grassPathAutotileFrame(miniMap, 1, 1);
    expect(frame).toBe(AUTOTILE_GRASS_PATH_BASE + 15 - 1);
    expect(grassPathAutotileFrame(miniMap, 1, 0)).toBeNull();
  });
});
