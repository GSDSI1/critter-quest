import type Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../data/types';
import type { GameMap } from '../data/maps';

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function isSmallInterior(map: GameMap): boolean {
  return map.width <= 15 && map.height <= 15;
}

export function computeOverworldZoom(map: GameMap): number {
  const mapPxW = map.width * TILE_SIZE;
  const mapPxH = map.height * TILE_SIZE;

  if (isSmallInterior(map)) {
    const fit = Math.min(GAME_WIDTH / mapPxW, GAME_HEIGHT / mapPxH) * 0.88;
    return clamp(fit, 1.5, 2.5);
  }

  const mapPx = Math.max(mapPxW, mapPxH);
  const zoom = Math.min(GAME_WIDTH, GAME_HEIGHT) / mapPx * 1.45;
  return clamp(zoom, 1.4, 2.2);
}

/** Keep the viewport inside the map so out-of-bounds areas never show as black void. */
export function clampOverworldCamera(cam: Phaser.Cameras.Scene2D.Camera, map: GameMap): void {
  if (isSmallInterior(map)) return;

  const zoom = cam.zoom;
  const vw = GAME_WIDTH / zoom;
  const vh = GAME_HEIGHT / zoom;
  const mapW = map.width * TILE_SIZE;
  const mapH = map.height * TILE_SIZE;

  if (vw >= mapW) {
    cam.scrollX = (mapW - vw) / 2;
  } else {
    cam.scrollX = clamp(cam.scrollX, 0, mapW - vw);
  }

  if (vh >= mapH) {
    cam.scrollY = (mapH - vh) / 2;
  } else {
    cam.scrollY = clamp(cam.scrollY, 0, mapH - vh);
  }
}

export function applyOverworldCamera(
  cam: Phaser.Cameras.Scene2D.Camera,
  map: GameMap,
  player: Phaser.GameObjects.Sprite,
): void {
  const mapW = map.width * TILE_SIZE;
  const mapH = map.height * TILE_SIZE;
  const zoom = computeOverworldZoom(map);
  cam.setBounds(0, 0, mapW, mapH);
  cam.setZoom(zoom);

  const vw = GAME_WIDTH / zoom;
  const vh = GAME_HEIGHT / zoom;
  const fitsInView = vw >= mapW && vh >= mapH;

  if (isSmallInterior(map) || fitsInView) {
    cam.stopFollow();
    cam.centerOn(mapW / 2, mapH / 2);
  } else {
    cam.startFollow(player, true, 0.12, 0.12);
    clampOverworldCamera(cam, map);
  }
}
