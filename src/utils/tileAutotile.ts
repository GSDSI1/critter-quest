import { getTile, type GameMap } from '../data/maps';

export const TILE_GRASS = 0;
export const TILE_PATH = 1;
export const TILE_WATER = 3;

/** First tileset frame for grass↔path 16-case autotile (masks 1–15). */
export const AUTOTILE_GRASS_PATH_BASE = 21;

/** 4-bit mask: N=1, E=2, S=4, W=8 — set when that neighbor is path. */
export function grassPathNeighborMask(map: GameMap, x: number, y: number): number {
  let mask = 0;
  if (getTile(map, x, y - 1) === TILE_PATH) mask |= 1;
  if (getTile(map, x + 1, y) === TILE_PATH) mask |= 2;
  if (getTile(map, x, y + 1) === TILE_PATH) mask |= 4;
  if (getTile(map, x - 1, y) === TILE_PATH) mask |= 8;
  return mask;
}

/** Returns autotile frame index or null when base grass tile should stay. */
export function grassPathAutotileFrame(map: GameMap, x: number, y: number): number | null {
  if (getTile(map, x, y) !== TILE_GRASS) return null;
  const mask = grassPathNeighborMask(map, x, y);
  if (mask === 0) return null;
  return AUTOTILE_GRASS_PATH_BASE + mask - 1;
}

export function applyGrassPathAutotiles(map: GameMap, layer: Phaser.Tilemaps.TilemapLayer): number {
  let count = 0;
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const frame = grassPathAutotileFrame(map, x, y);
      if (frame !== null) {
        layer.putTileAt(frame, x, y);
        count++;
      }
    }
  }
  return count;
}
