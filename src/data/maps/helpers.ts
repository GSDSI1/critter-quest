import { rivalStarter, rivalEvolved } from '../encounters';
import type { GameMap, TrainerMon } from './types';

export function isWalkable(tile: number): boolean {
  return [0, 1, 2, 6, 7, 9, 11, 13, 15, 16, 18].includes(tile);
}

export function isEncounterTile(tile: number): boolean {
  return tile === 2;
}

export function isWarpTile(map: GameMap, x: number, y: number) {
  return map.warps.find(w => w.x === x && w.y === y);
}

export function getTile(map: GameMap, x: number, y: number): number {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return 4;
  return map.tiles[y * map.width + x] ?? 4;
}

export function resolveTrainerParty(party: TrainerMon[], playerStarter: string): TrainerMon[] {
  return party.map(m => {
    let creatureId = m.creatureId;
    if (creatureId === '__RIVAL__') creatureId = rivalStarter(playerStarter);
    else if (creatureId === '__RIVAL_EVO__') creatureId = rivalEvolved(playerStarter, 1);
    else if (creatureId === '__RIVAL_EVO2__') creatureId = rivalEvolved(playerStarter, 2);
    return { creatureId, level: m.level };
  });
}
