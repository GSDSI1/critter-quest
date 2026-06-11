import { describe, expect, it } from 'vitest';
import { getMap, getTile, isWalkable, heal_center, mart, lab, contest_hall, fishing_pier } from '../index';

const INTERIOR_MAPS = [heal_center, mart, lab, contest_hall, fishing_pier];

describe('interior door warps', () => {
  for (const map of INTERIOR_MAPS) {
    it(`${map.id} exit warps sit on walkable door tiles`, () => {
      for (const warp of map.warps) {
        const tile = getTile(map, warp.x, warp.y);
        expect(isWalkable(tile)).toBe(true);
      }
    });
  }

  it('town building entrances are walkable', () => {
    const town = getMap('town');
    for (const warp of town.warps.filter((w) => ['heal_center', 'mart', 'lab'].includes(w.toMap))) {
      const tile = getTile(town, warp.x, warp.y);
      expect(isWalkable(tile)).toBe(true);
    }
  });
});
