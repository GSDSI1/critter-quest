import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../data/types';
import type { GameMap } from '../data/maps';

export function isSmallInterior(map: GameMap): boolean {
  return map.width <= 12 && map.height <= 12;
}

export function computeOverworldZoom(map: GameMap): number {
  const mapPxW = map.width * TILE_SIZE;
  const mapPxH = map.height * TILE_SIZE;

  if (isSmallInterior(map)) {
    const fit = Math.min(GAME_WIDTH / mapPxW, GAME_HEIGHT / mapPxH) * 0.88;
    return Phaser.Math.Clamp(fit, 1.5, 2.5);
  }

  const mapPx = Math.max(mapPxW, mapPxH);
  const zoom = Math.min(GAME_WIDTH, GAME_HEIGHT) / mapPx * 1.6;
  return Phaser.Math.Clamp(zoom, 1.5, 2.5);
}

export function applyOverworldCamera(
  cam: Phaser.Cameras.Scene2D.Camera,
  map: GameMap,
  player: Phaser.GameObjects.Sprite,
): void {
  cam.setBounds(0, 0, map.width * TILE_SIZE, map.height * TILE_SIZE);
  cam.setZoom(computeOverworldZoom(map));

  if (isSmallInterior(map)) {
    cam.stopFollow();
    cam.centerOn(map.width * TILE_SIZE / 2, map.height * TILE_SIZE / 2);
  } else {
    cam.startFollow(player, true, 0.12, 0.12);
  }
}
