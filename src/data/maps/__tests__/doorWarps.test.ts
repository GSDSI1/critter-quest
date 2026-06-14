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

  it('town mart and lab warps align with WHMHWR row', () => {
    const town = getMap('town');
    expect(town.warps.find(w => w.toMap === 'mart')?.x).toBe(10);
    expect(town.warps.find(w => w.toMap === 'lab')?.x).toBe(14);
  });

  it('forest secret grove warp sits on east path tile', () => {
    const forest = getMap('forest');
    const warp = forest.warps.find(w => w.toMap === 'secret_grove');
    expect(warp).toEqual(expect.objectContaining({ x: 20, y: 8 }));
    expect(getTile(forest, warp!.x, warp!.y)).toBe(1);
  });
});
