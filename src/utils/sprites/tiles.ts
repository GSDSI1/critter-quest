import Phaser from 'phaser';
import { COLORS } from '../../data/types';
import type { MapTheme } from '../../data/maps';
import { darken, lighten } from './colors';

export function tileTextureKey(tile: number, theme?: MapTheme, animFrame = 0): string {
  if (tile === 3) return `tile_3_${animFrame % 2}`;
  if (tile === 2) return `tile_2_${animFrame % 2}`;
  if (theme && theme !== 'outdoor') {
    if (tile === 6) return `tile_6_${theme}`;
    if (tile === 5) return `tile_5_${theme}`;
  }
  return `tile_${tile}`;
}

function drawTile(
  g: Phaser.GameObjects.Graphics,
  tile: number,
  x: number,
  y: number,
  ts: number,
  theme: MapTheme = 'outdoor',
  animFrame = 0,
): void {
  const px = x * ts;
  const py = y * ts;

  switch (tile) {
    case 0:
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(lighten(COLORS.grass, 18), 0.55);
      g.fillRect(px, py, ts, 2);
      g.fillStyle(COLORS.grassDark, 0.4);
      if ((x + y) % 3 === 0) g.fillRect(px + 3, py + 5, 2, 2);
      if ((x + y) % 5 === 0) g.fillRect(px + 10, py + 9, 2, 2);
      if ((x + y) % 7 === 0) g.fillRect(px + 7, py + 3, 1, 1);
      break;
    case 1:
      g.fillStyle(COLORS.path, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(lighten(COLORS.path, 22), 0.45);
      g.fillRect(px, py, ts, 2);
      g.fillStyle(darken(COLORS.path, 22), 0.4);
      g.fillRect(px, py + ts - 2, ts, 2);
      g.fillStyle(darken(COLORS.path, 10), 0.25);
      if (x % 2 === 0) g.fillRect(px + 4, py + 6, ts - 8, 1);
      break;
    case 2: {
      g.fillStyle(COLORS.grassDark, 1);
      g.fillRect(px, py, ts, ts);
      const sway = animFrame === 1 ? 1 : 0;
      g.fillStyle(0x4ade80, 1);
      for (let i = 0; i < 3; i++) {
        g.fillRect(px + 2 + i * 5 + sway, py + 2, 2, ts - 4);
        g.fillRect(px + 1 + i * 5, py + 1, 4, 3);
      }
      g.fillStyle(0x22c55e, 0.65);
      g.fillRect(px + 3, py + 8, ts - 6, 2);
      break;
    }
    case 3: {
      g.fillStyle(COLORS.water, 1);
      g.fillRect(px, py, ts, ts);
      const waveY = 4 + (x % 3) * 2 + animFrame * 2;
      g.fillStyle(lighten(COLORS.water, 35), 0.5);
      g.fillRect(px + 2, py + waveY, ts - 4, 2);
      g.fillStyle(lighten(COLORS.water, 15), 0.3);
      g.fillRect(px + 1, py + ts - 4, ts - 2, 1);
      break;
    }
    case 4:
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x14532d, 1);
      g.fillRect(px + ts / 2 - 2, py + ts - 6, 4, 6);
      g.fillStyle(0x166534, 1);
      g.fillCircle(px + ts / 2, py + ts / 2 - 2, ts / 2 - 1);
      g.fillStyle(0x22c55e, 0.5);
      g.fillCircle(px + ts / 2 - 3, py + ts / 2 - 4, 3);
      g.fillStyle(0x0f3d22, 0.4);
      g.fillRect(px, py + ts - 1, ts, 1);
      break;
    case 5: {
      const wallBase = theme === 'lab' ? 0x94a3b8 : theme === 'mart' ? 0x78716c : 0x8b7355;
      g.fillStyle(wallBase, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0xf5f5f4, 1);
      g.fillRect(px, py, ts, 2);
      g.fillStyle(darken(wallBase, 18), 1);
      g.fillRect(px + 1, py + 4, ts - 2, 1);
      g.fillRect(px + 1, py + 9, ts - 2, 1);
      g.fillStyle(darken(wallBase, 28), 1);
      g.fillRect(px, py + ts - 3, ts, 3);
      if (x === 0 || y === 0) {
        g.fillStyle(lighten(wallBase, 12), 0.5);
        g.fillRect(px, py, 2, ts);
      }
      break;
    }
    case 6: {
      if (theme === 'mart') {
        g.fillStyle(0xc4a882, 1);
        g.fillRect(px, py, ts, ts);
        g.fillStyle(0xb8956a, 1);
        for (let i = 0; i < 4; i++) g.fillRect(px + i * 4, py, 3, ts);
        g.fillStyle(0xd4b896, 0.6);
        g.fillRect(px, py + ts - 1, ts, 1);
      } else if (theme === 'lab') {
        g.fillStyle(0xe2e8f0, 1);
        g.fillRect(px, py, ts, ts);
        g.fillStyle(0xcbd5e1, 0.5);
        if ((x + y) % 2 === 0) g.fillRect(px + 1, py + 1, ts - 2, ts - 2);
        g.fillStyle(0x94a3b8, 0.3);
        g.fillRect(px, py + ts - 1, ts, 1);
      } else {
        g.fillStyle(0xe8ddd0, 1);
        g.fillRect(px, py, ts, ts);
        g.fillStyle(0xd4c4b8, 0.55);
        if ((x + y) % 2 === 0) g.fillRect(px, py, ts / 2, ts / 2);
        if ((x + y) % 2 === 1) g.fillRect(px + ts / 2, py + ts / 2, ts / 2, ts / 2);
        g.fillStyle(0xc4b4a8, 0.4);
        g.fillRect(px, py + ts - 1, ts, 1);
      }
      break;
    }
    case 7:
      g.fillStyle(0xd4c4a8, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x57534e, 1);
      g.fillRect(px + 2, py + 1, ts - 4, ts - 2);
      g.fillStyle(0x8b6914, 1);
      g.fillRect(px + 4, py + 3, ts - 8, ts - 5);
      g.fillStyle(0xbae6fd, 0.6);
      g.fillRect(px + 5, py + 4, 3, 3);
      g.fillStyle(COLORS.gold, 1);
      g.fillCircle(px + ts - 5, py + ts / 2, 2);
      g.fillStyle(0x78350f, 1);
      g.fillRect(px + 3, py + ts - 3, ts - 6, 2);
      break;
    case 8:
      g.fillStyle(COLORS.roof, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(COLORS.roofLight, 0.55);
      g.fillTriangle(px, py, px + ts / 2, py + ts / 2, px + ts, py);
      g.fillStyle(darken(COLORS.roof, 20), 0.4);
      g.fillRect(px, py + ts - 2, ts, 2);
      break;
    case 9:
      g.fillStyle(0xe8ddd0, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0xf472b6, 1);
      g.fillRect(px + 2, py + 2, ts - 4, ts - 4);
      g.fillStyle(0xfbcfe8, 0.7);
      g.fillRect(px + 4, py + 4, ts - 8, ts - 8);
      g.fillStyle(0xffffff, 1);
      g.fillRect(px + ts / 2 - 1, py + 4, 2, ts - 8);
      g.fillRect(px + 4, py + ts / 2 - 1, ts - 8, 2);
      g.lineStyle(1, 0xffffff, 0.8);
      g.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
      break;
    case 10:
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      break;
    case 11:
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x15803d, 1);
      g.fillRect(px + 7, py + 8, 2, 5);
      g.fillStyle(0xf472b6, 1);
      g.fillCircle(px + 6, py + 6, 3);
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(px + 10, py + 10, 2);
      g.fillStyle(0xa855f7, 0.8);
      g.fillCircle(px + 11, py + 5, 2);
      break;
    case 12:
      g.fillStyle(COLORS.grassDark, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x78716c, 1);
      g.fillCircle(px + ts / 2, py + ts / 2 + 1, ts / 2 - 2);
      g.fillStyle(0xa8a29e, 0.6);
      g.fillCircle(px + ts / 2 - 2, py + ts / 2 - 1, 3);
      g.fillStyle(0x57534e, 0.5);
      g.fillRect(px, py + ts - 2, ts, 2);
      break;
    case 13:
      g.fillStyle(0x92400e, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x78350f, 1);
      g.fillRect(px + 2, py, 2, ts);
      g.fillRect(px + ts - 4, py, 2, ts);
      g.fillStyle(0xb45309, 0.5);
      g.fillRect(px + 5, py + 3, ts - 10, 1);
      g.fillRect(px + 5, py + 10, ts - 10, 1);
      break;
    case 14:
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x92400e, 1);
      g.fillRect(px + 1, py + 4, ts - 2, 2);
      g.fillRect(px + 3, py + 2, 2, ts - 2);
      g.fillRect(px + ts - 5, py + 2, 2, ts - 2);
      g.fillRect(px + ts / 2 - 1, py + 1, 2, ts - 1);
      g.fillStyle(0x78350f, 0.6);
      g.fillRect(px + 1, py + ts - 2, ts - 2, 1);
      break;
    case 15:
      g.fillStyle(0xfde68a, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0xfbbf24, 0.25);
      if ((x + y) % 2 === 0) g.fillRect(px + 2, py + 2, 3, 2);
      break;
    case 16:
      g.fillStyle(0x44403c, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x57534e, 0.45);
      if ((x + y) % 2 === 0) g.fillRect(px + 2, py + 2, ts - 4, ts - 4);
      g.fillStyle(0x292524, 0.3);
      g.fillRect(px, py + ts - 1, ts, 1);
      break;
    case 17:
      g.fillStyle(0x292524, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x1c1917, 1);
      g.fillRect(px, py + ts - 3, ts, 3);
      g.fillStyle(0x44403c, 0.4);
      g.fillRect(px + 2, py + 3, ts - 4, 2);
      break;
    case 18:
      g.fillStyle(theme === 'mart' ? 0xc4a882 : 0xd4c4a8, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x0369a1, 1);
      g.fillRect(px + 1, py + 5, ts - 2, ts - 7);
      g.fillStyle(0x7dd3fc, 0.5);
      g.fillRect(px + 2, py + 6, ts - 4, 2);
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(px + 3, py + 9, 2, 2);
      g.fillRect(px + 7, py + 9, 2, 2);
      g.fillRect(px + 11, py + 9, 2, 2);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(px + ts - 4, py + 8, 3, 4);
      break;
    default:
      g.fillStyle(0x333333, 1);
      g.fillRect(px, py, ts, ts);
  }
}

const TILE_COUNT = 19;

export function proceduralTilesetKey(theme: MapTheme = 'outdoor'): string {
  return theme === 'outdoor' ? 'proc_tileset' : `proc_tileset_${theme}`;
}

/** Bake 19 procedural tiles into a single spritesheet for tilemap rendering. */
export function bakeProceduralTileset(scene: Phaser.Scene, theme: MapTheme = 'outdoor'): void {
  const key = proceduralTilesetKey(theme);
  if (scene.textures.exists(key)) return;

  const ts = 16;
  const g = scene.make.graphics({ x: 0, y: 0 });
  for (let i = 0; i < TILE_COUNT; i++) {
    drawTile(g, i, 0, i, ts, theme, 0);
  }
  g.generateTexture(key, ts, ts * TILE_COUNT);
  g.destroy();

  const tex = scene.textures.get(key);
  for (let i = 0; i < TILE_COUNT; i++) {
    const frame = String(i);
    if (!tex.has(frame)) tex.add(frame, 0, 0, i * ts, ts, ts);
  }
}

export function generateTileAssets(scene: Phaser.Scene): void {
  const ts = 16;

  for (let i = 0; i < TILE_COUNT; i++) {
    const k = `tile_${i}`;
    if (scene.textures.exists(k)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawTile(g, i, 0, 0, ts, 'outdoor', 0);
    g.generateTexture(k, ts, ts);
    g.destroy();
  }

  for (const frame of [0, 1]) {
    for (const tile of [2, 3]) {
      const k = `tile_${tile}_${frame}`;
      if (scene.textures.exists(k)) continue;
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawTile(g, tile, 0, 0, ts, 'outdoor', frame);
      g.generateTexture(k, ts, ts);
      g.destroy();
    }
  }

  for (const theme of ['heal', 'mart', 'lab'] as const) {
    for (const tile of [5, 6] as const) {
      const k = `tile_${tile}_${theme}`;
      if (scene.textures.exists(k)) continue;
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawTile(g, tile, 0, 0, ts, theme, 0);
      g.generateTexture(k, ts, ts);
      g.destroy();
    }
    bakeProceduralTileset(scene, theme);
  }

  bakeProceduralTileset(scene, 'outdoor');
}
