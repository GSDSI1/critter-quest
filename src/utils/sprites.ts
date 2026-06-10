import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, TYPE_COLORS, type ElementType } from '../data/types';
import type { CreatureDef } from '../data/creatures';
import type { MapTheme } from '../data/maps';
import { TRAINER_PRESETS, getTrainer, type TrainerPreset } from '../data/characters';

export function playerTextureKey(characterId: string, facing: string, frame: number): string {
  const id = getTrainer(characterId).id;
  return `player_${id}_${facing}_${frame}`;
}

export function playerBackTextureKey(characterId: string): string {
  const id = getTrainer(characterId).id;
  return `player_back_${id}`;
}

export function tileTextureKey(tile: number, theme?: MapTheme, animFrame = 0): string {
  if (tile === 3) return `tile_3_${animFrame % 2}`;
  if (tile === 2) return `tile_2_${animFrame % 2}`;
  if (theme && theme !== 'outdoor') {
    if (tile === 6) return `tile_6_${theme}`;
    if (tile === 5) return `tile_5_${theme}`;
  }
  return `tile_${tile}`;
}

function hex(c: number): string {
  return `#${c.toString(16).padStart(6, '0')}`;
}

function darken(c: number, amt: number): number {
  const r = Math.max(0, ((c >> 16) & 0xff) - amt);
  const g = Math.max(0, ((c >> 8) & 0xff) - amt);
  const b = Math.max(0, (c & 0xff) - amt);
  return (r << 16) | (g << 8) | b;
}

function lighten(c: number, amt: number): number {
  const r = Math.min(255, ((c >> 16) & 0xff) + amt);
  const g = Math.min(255, ((c >> 8) & 0xff) + amt);
  const b = Math.min(255, (c & 0xff) + amt);
  return (r << 16) | (g << 8) | b;
}

function drawCreature(g: Phaser.GameObjects.Graphics, def: CreatureDef, cx: number, cy: number, size: number): void {
  const c = def.color;
  const dark = darken(c, 40);
  const light = lighten(c, 50);
  const s = size;

  g.fillStyle(c, 1);
  g.fillStyle(dark, 1);
  g.fillStyle(light, 1);

  switch (def.shape) {
    case 'blob':
      g.fillStyle(c, 1);
      g.fillCircle(cx, cy, s * 0.35);
      g.fillStyle(light, 1);
      g.fillCircle(cx - s * 0.1, cy - s * 0.12, s * 0.08);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx - s * 0.08, cy - s * 0.05, s * 0.06);
      g.fillCircle(cx + s * 0.1, cy - s * 0.05, s * 0.06);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx - s * 0.06, cy - s * 0.04, s * 0.03);
      g.fillCircle(cx + s * 0.12, cy - s * 0.04, s * 0.03);
      break;
    case 'quadruped':
      g.fillStyle(c, 1);
      g.fillEllipse(cx, cy + s * 0.05, s * 0.45, s * 0.3);
      g.fillCircle(cx + s * 0.22, cy - s * 0.05, s * 0.18);
      g.fillStyle(dark, 1);
      g.fillRect(cx - s * 0.15, cy + s * 0.15, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.05, cy + s * 0.15, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.2, cy + s * 0.12, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.32, cy + s * 0.12, s * 0.06, s * 0.12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.28, cy - s * 0.08, s * 0.05);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.29, cy - s * 0.07, s * 0.025);
      break;
    case 'serpent':
      g.fillStyle(c, 1);
      for (let i = 0; i < 5; i++) {
        g.fillCircle(cx - s * 0.2 + i * s * 0.1, cy + Math.sin(i) * s * 0.05, s * 0.12);
      }
      g.fillCircle(cx + s * 0.28, cy - s * 0.08, s * 0.14);
      g.fillStyle(0xff4444, 1);
      g.fillCircle(cx + s * 0.34, cy - s * 0.1, s * 0.025);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.3, cy - s * 0.1, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.31, cy - s * 0.09, s * 0.02);
      break;
    case 'avian':
      g.fillStyle(c, 1);
      g.fillEllipse(cx, cy, s * 0.35, s * 0.25);
      g.fillCircle(cx + s * 0.15, cy - s * 0.12, s * 0.12);
      g.fillStyle(light, 1);
      g.fillTriangle(cx - s * 0.1, cy - s * 0.05, cx - s * 0.35, cy - s * 0.2, cx - s * 0.15, cy + s * 0.05);
      g.fillTriangle(cx + s * 0.05, cy - s * 0.05, cx + s * 0.3, cy - s * 0.15, cx + s * 0.1, cy + s * 0.05);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.18, cy - s * 0.14, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.19, cy - s * 0.13, s * 0.02);
      break;
    case 'humanoid':
      g.fillStyle(c, 1);
      g.fillCircle(cx, cy - s * 0.12, s * 0.14);
      g.fillRect(cx - s * 0.1, cy, s * 0.2, s * 0.22);
      g.fillRect(cx - s * 0.18, cy + s * 0.02, s * 0.08, s * 0.18);
      g.fillRect(cx + s * 0.1, cy + s * 0.02, s * 0.08, s * 0.18);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx - s * 0.05, cy - s * 0.14, s * 0.04);
      g.fillCircle(cx + s * 0.05, cy - s * 0.14, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx - s * 0.04, cy - s * 0.13, s * 0.02);
      g.fillCircle(cx + s * 0.06, cy - s * 0.13, s * 0.02);
      break;
    case 'crystalline':
      g.fillStyle(c, 1);
      g.fillTriangle(cx, cy - s * 0.3, cx + s * 0.2, cy - s * 0.05, cx + s * 0.15, cy + s * 0.25);
      g.fillTriangle(cx, cy - s * 0.3, cx - s * 0.2, cy - s * 0.05, cx - s * 0.15, cy + s * 0.25);
      g.fillTriangle(cx + s * 0.15, cy + s * 0.25, cx - s * 0.15, cy + s * 0.25, cx, cy + s * 0.32);
      g.fillStyle(light, 1);
      g.fillTriangle(cx, cy - s * 0.3, cx + s * 0.08, cy - s * 0.08, cx - s * 0.05, cy - s * 0.05);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(cx - s * 0.03, cy - s * 0.1, s * 0.04);
      break;
  }

  // Type badge
  const typeColor = TYPE_COLORS[def.types[0] as ElementType];
  g.fillStyle(typeColor, 0.6);
  g.fillCircle(cx, cy + s * 0.28, s * 0.06);
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
    case 0: // grass
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(lighten(COLORS.grass, 18), 0.55);
      g.fillRect(px, py, ts, 2);
      g.fillStyle(COLORS.grassDark, 0.4);
      if ((x + y) % 3 === 0) g.fillRect(px + 3, py + 5, 2, 2);
      if ((x + y) % 5 === 0) g.fillRect(px + 10, py + 9, 2, 2);
      if ((x + y) % 7 === 0) g.fillRect(px + 7, py + 3, 1, 1);
      break;
    case 1: // path
      g.fillStyle(COLORS.path, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(lighten(COLORS.path, 22), 0.45);
      g.fillRect(px, py, ts, 2);
      g.fillStyle(darken(COLORS.path, 22), 0.4);
      g.fillRect(px, py + ts - 2, ts, 2);
      g.fillStyle(darken(COLORS.path, 10), 0.25);
      if (x % 2 === 0) g.fillRect(px + 4, py + 6, ts - 8, 1);
      break;
    case 2: { // tall grass
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
    case 3: { // water
      g.fillStyle(COLORS.water, 1);
      g.fillRect(px, py, ts, ts);
      const waveY = 4 + (x % 3) * 2 + animFrame * 2;
      g.fillStyle(lighten(COLORS.water, 35), 0.5);
      g.fillRect(px + 2, py + waveY, ts - 4, 2);
      g.fillStyle(lighten(COLORS.water, 15), 0.3);
      g.fillRect(px + 1, py + ts - 4, ts - 2, 1);
      break;
    }
    case 4: // tree
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
    case 5: { // wall
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
    case 6: { // floor — theme variants
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
    case 7: // door
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
    case 8: // roof
      g.fillStyle(COLORS.roof, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(COLORS.roofLight, 0.55);
      g.fillTriangle(px, py, px + ts / 2, py + ts / 2, px + ts, py);
      g.fillStyle(darken(COLORS.roof, 20), 0.4);
      g.fillRect(px, py + ts - 2, ts, 2);
      break;
    case 9: // heal pad
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
    case 10: // sign base tile
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(px, py, ts, ts);
      break;
    case 11: // flower
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
    case 12: // rock
      g.fillStyle(COLORS.grassDark, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x78716c, 1);
      g.fillCircle(px + ts / 2, py + ts / 2 + 1, ts / 2 - 2);
      g.fillStyle(0xa8a29e, 0.6);
      g.fillCircle(px + ts / 2 - 2, py + ts / 2 - 1, 3);
      g.fillStyle(0x57534e, 0.5);
      g.fillRect(px, py + ts - 2, ts, 2);
      break;
    case 13: // bridge
      g.fillStyle(0x92400e, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x78350f, 1);
      g.fillRect(px + 2, py, 2, ts);
      g.fillRect(px + ts - 4, py, 2, ts);
      g.fillStyle(0xb45309, 0.5);
      g.fillRect(px + 5, py + 3, ts - 10, 1);
      g.fillRect(px + 5, py + 10, ts - 10, 1);
      break;
    case 14: // fence
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
    case 15: // sand
      g.fillStyle(0xfde68a, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0xfbbf24, 0.25);
      if ((x + y) % 2 === 0) g.fillRect(px + 2, py + 2, 3, 2);
      break;
    case 16: // cave floor
      g.fillStyle(0x44403c, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x57534e, 0.45);
      if ((x + y) % 2 === 0) g.fillRect(px + 2, py + 2, ts - 4, ts - 4);
      g.fillStyle(0x292524, 0.3);
      g.fillRect(px, py + ts - 1, ts, 1);
      break;
    case 17: // cave wall
      g.fillStyle(0x292524, 1);
      g.fillRect(px, py, ts, ts);
      g.fillStyle(0x1c1917, 1);
      g.fillRect(px, py + ts - 3, ts, 3);
      g.fillStyle(0x44403c, 0.4);
      g.fillRect(px + 2, py + 3, ts - 4, 2);
      break;
    case 18: // mart counter
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

function drawNpc32(
  g: Phaser.GameObjects.Graphics,
  body: number,
  hair: number,
  accent: number,
  prop?: string,
): void {
  g.fillStyle(0x0f172a, 0.3);
  g.fillEllipse(16, 30, 20, 6);
  g.fillStyle(body, 1);
  g.fillRoundedRect(10, 14, 12, 14, 3);
  g.fillStyle(hair, 1);
  g.fillCircle(16, 10, 8);
  g.fillStyle(0x1a1a2e, 1);
  g.fillRect(12, 9, 3, 3);
  g.fillRect(18, 9, 3, 3);
  g.fillStyle(0xffffff, 0.8);
  g.fillRect(13, 10, 1, 1);
  g.fillRect(19, 10, 1, 1);
  g.fillStyle(accent, 1);
  g.fillRect(9, 26, 5, 4);
  g.fillRect(18, 26, 5, 4);
  g.fillStyle(darken(body, 20), 1);
  g.fillRect(12, 28, 8, 2);

  if (prop === 'nurse') {
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(8, 14, 16, 12, 2);
    g.fillStyle(0xf472b6, 1);
    g.fillRect(8, 14, 16, 4);
    g.fillStyle(0xef4444, 1);
    g.fillRect(14, 20, 4, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(15, 21, 2, 2);
  } else if (prop === 'clerk') {
    g.fillStyle(0x22c55e, 1);
    g.fillRect(9, 16, 14, 8);
    g.fillStyle(0xffffff, 1);
    g.fillRect(11, 18, 10, 3);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(12, 8, 8, 3);
  } else if (prop === 'leader') {
    g.fillStyle(COLORS.gold, 1);
    g.fillCircle(16, 4, 3);
    g.fillRect(8, 8, 16, 3);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(10, 14, 12, 2);
  } else if (prop === 'prof') {
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 14, 16, 4);
    g.fillStyle(0x4338ca, 1);
    g.fillRoundedRect(7, 22, 18, 8, 2);
    g.fillStyle(0xe5e7eb, 1);
    g.fillRect(11, 7, 10, 3);
    g.lineStyle(1, 0x1a1a2e, 1);
    g.lineBetween(10, 11, 14, 11);
    g.lineBetween(18, 11, 22, 11);
    g.fillStyle(0xfbbf24, 0.8);
    g.fillCircle(22, 18, 2);
  } else if (prop === 'rival') {
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(10, 4, 12, 4);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(12, 5, 8, 2);
    g.fillStyle(0xef4444, 0.6);
    g.fillTriangle(24, 12, 28, 16, 24, 20);
  } else if (prop === 'trainer') {
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(11, 15, 10, 2);
    g.fillStyle(accent, 0.8);
    g.fillRect(9, 24, 14, 3);
  }
}

function drawAllNpcSprites(scene: Phaser.Scene): void {
  const roles: { role: string; body: number; hair: number; accent: number; prop?: string }[] = [
    { role: 'generic', body: 0x9333ea, hair: 0xfca5a5, accent: 0x4c1d95 },
    { role: 'nurse', body: 0xf472b6, hair: 0xfff1f2, accent: 0xdb2777, prop: 'nurse' },
    { role: 'clerk', body: 0x3b82f6, hair: 0x1e3a5f, accent: 0x1d4ed8, prop: 'clerk' },
    { role: 'trainer_m', body: 0x22c55e, hair: 0xfbbf24, accent: 0x15803d, prop: 'trainer' },
    { role: 'trainer_f', body: 0xec4899, hair: 0x831843, accent: 0xbe185d, prop: 'trainer' },
    { role: 'rival', body: 0xef4444, hair: 0x1a1a2e, accent: 0xb91c1c, prop: 'rival' },
    { role: 'leader', body: 0xf59e0b, hair: 0xfef3c7, accent: 0xd97706, prop: 'leader' },
    { role: 'prof', body: 0x6366f1, hair: 0xe5e7eb, accent: 0x4338ca, prop: 'prof' },
  ];
  for (const { role, body, hair, accent, prop } of roles) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawNpc32(g, body, hair, accent, prop);
    g.generateTexture(`npc_${role}`, 32, 32);
    g.destroy();
  }
}

function drawBiomeBattleBg(
  g: Phaser.GameObjects.Graphics,
  b: { sky: number; ground: number; accent: number },
  variant: string,
): void {
  g.fillGradientStyle(b.sky, b.sky, b.ground, b.ground, 1);
  g.fillRect(0, 0, 640, 480);
  g.fillStyle(darken(b.sky, 30), 0.3);
  g.fillRect(0, 280, 640, 2);

  if (variant === 'forest') {
    g.fillStyle(darken(b.accent, 40), 0.7);
    g.fillTriangle(0, 280, 80, 180, 160, 280);
    g.fillTriangle(120, 280, 200, 160, 280, 280);
    g.fillTriangle(400, 280, 480, 170, 560, 280);
  } else if (variant === 'cave') {
    g.fillStyle(0x1c1917, 0.8);
    for (let i = 0; i < 8; i++) {
      g.fillTriangle(i * 90, 0, i * 90 + 30, 80 + (i % 3) * 20, i * 90 + 60, 0);
    }
    g.fillStyle(0x57534e, 0.5);
    g.fillRect(0, 250, 640, 30);
  } else if (variant === 'gym') {
    g.fillStyle(COLORS.gold, 0.25);
    g.fillRect(0, 0, 640, 40);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(40, 60, 560, 8);
    g.fillRect(40, 200, 560, 8);
  } else if (variant === 'volcano') {
    g.fillStyle(0xef4444, 0.3);
    g.fillCircle(520, 100, 40);
    g.fillStyle(0xfbbf24, 0.2);
    g.fillCircle(100, 80, 25);
  } else {
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(120, 60, 80, 30);
    g.fillEllipse(400, 90, 100, 35);
    g.fillEllipse(550, 50, 60, 25);
  }

  g.fillStyle(b.accent, 1);
  g.fillEllipse(320, 420, 700, 120);
  g.fillStyle(darken(b.accent, 25), 0.8);
  g.fillEllipse(320, 435, 520, 60);
}

export function generateAssets(scene: Phaser.Scene): void {
  const ts = 16;

  // Base tileset (outdoor theme)
  for (let i = 0; i < 19; i++) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawTile(g, i, 0, 0, ts, 'outdoor', 0);
    g.generateTexture(`tile_${i}`, ts, ts);
    g.destroy();
  }

  // Animated water + tall grass
  for (const frame of [0, 1]) {
    for (const tile of [2, 3]) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      drawTile(g, tile, 0, 0, ts, 'outdoor', frame);
      g.generateTexture(`tile_${tile}_${frame}`, ts, ts);
      g.destroy();
    }
  }

  // Themed floor tiles
  for (const theme of ['heal', 'mart', 'lab'] as const) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawTile(g, 6, 0, 0, ts, theme, 0);
    g.generateTexture(`tile_6_${theme}`, ts, ts);
    g.destroy();
    const wg = scene.make.graphics({ x: 0, y: 0 });
    drawTile(wg, 5, 0, 0, ts, theme, 0);
    wg.generateTexture(`tile_5_${theme}`, ts, ts);
    wg.destroy();
  }

  // Interior decorations
  const lightG = scene.make.graphics({ x: 0, y: 0 });
  lightG.fillStyle(0xf5f5f4, 0.3);
  lightG.fillRect(0, 0, 16, 16);
  lightG.fillStyle(0xfbbf24, 1);
  lightG.fillRect(4, 2, 8, 4);
  lightG.fillStyle(0xfde68a, 0.6);
  lightG.fillRect(2, 6, 12, 6);
  lightG.generateTexture('decor_light', 16, 16);
  lightG.destroy();

  const plantG = scene.make.graphics({ x: 0, y: 0 });
  plantG.fillStyle(0x166534, 1);
  plantG.fillRect(6, 10, 4, 6);
  plantG.fillStyle(0x22c55e, 1);
  plantG.fillCircle(8, 7, 5);
  plantG.fillStyle(0x15803d, 0.8);
  plantG.fillCircle(5, 9, 3);
  plantG.fillCircle(11, 9, 3);
  plantG.generateTexture('decor_plant', 16, 16);
  plantG.destroy();

  const posterG = scene.make.graphics({ x: 0, y: 0 });
  posterG.fillStyle(0x92400e, 1);
  posterG.fillRect(5, 2, 6, 8);
  posterG.fillStyle(0x3b82f6, 1);
  posterG.fillRect(6, 3, 4, 4);
  posterG.fillStyle(0xfbbf24, 1);
  posterG.fillRect(7, 5, 2, 2);
  posterG.generateTexture('decor_poster', 16, 16);
  posterG.destroy();

  // Lab bench + starter orbs for starter select scene
  const benchG = scene.make.graphics({ x: 0, y: 0 });
  benchG.fillStyle(0x6366f1, 0.15);
  benchG.fillRect(0, 0, 640, 480);
  benchG.fillStyle(0x4338ca, 1);
  benchG.fillRoundedRect(80, 280, 480, 24, 4);
  benchG.fillStyle(0x312e81, 1);
  benchG.fillRect(80, 304, 480, 8);
  benchG.fillStyle(0x57534e, 1);
  for (let i = 0; i < 3; i++) {
    const px = 160 + i * 160;
    benchG.fillRect(px - 20, 260, 40, 20);
    benchG.fillRect(px - 8, 250, 16, 10);
  }
  benchG.generateTexture('lab_bench', 640, 480);
  benchG.destroy();

  for (const [type, color] of [['flame', 0xff6b35], ['tide', 0x3b82f6], ['leaf', 0x22c55e]] as const) {
    const og = scene.make.graphics({ x: 0, y: 0 });
    const c = color as number;
    // Pedestal
    og.fillStyle(0x44403c, 1);
    og.fillRoundedRect(14, 52, 36, 10, 3);
    og.fillStyle(0x57534e, 1);
    og.fillRoundedRect(18, 48, 28, 6, 2);
    // Outer glow ring
    og.fillStyle(c, 0.25);
    og.fillCircle(32, 30, 28);
    // Shell
    og.fillStyle(0xffffff, 1);
    og.fillCircle(32, 28, 24);
    og.fillStyle(0xf0f0f0, 1);
    og.fillCircle(32, 30, 22);
    // Colored core
    og.fillStyle(c, 1);
    og.fillCircle(32, 28, 17);
    og.fillStyle(lighten(c, 50), 0.7);
    og.fillCircle(24, 20, 7);
    og.fillStyle(0xffffff, 0.35);
    og.fillEllipse(38, 22, 8, 5);
    // Band + button
    og.lineStyle(4, 0x1a1a2e, 1);
    og.strokeCircle(32, 28, 22);
    og.fillStyle(0x1a1a2e, 1);
    og.fillRect(8, 26, 48, 4);
    og.fillStyle(lighten(c, 30), 1);
    og.fillCircle(32, 28, 6);
    og.fillStyle(0xffffff, 0.5);
    og.fillCircle(30, 26, 2);
    og.generateTexture(`starter_orb_${type}`, 64, 64);
    og.destroy();
  }

  // Player sprites per trainer preset (4 dirs × 2 frames)
  for (const preset of TRAINER_PRESETS) {
    drawPlayerWalkSprites(scene, preset);
    drawPlayerBackSprite(scene, preset);
  }

  // NPC sprites by role — 32×32 with role-specific detail
  drawAllNpcSprites(scene);

  // Legacy 16px npc alias
  if (!scene.textures.exists('npc')) {
    scene.textures.addImage('npc', scene.textures.get('npc_generic').getSourceImage() as HTMLImageElement);
  }

  // Sign post
  const signG = scene.make.graphics({ x: 0, y: 0 });
  signG.fillStyle(COLORS.grass, 1);
  signG.fillRect(0, 0, 16, 16);
  signG.fillStyle(0x92400e, 1);
  signG.fillRect(7, 8, 2, 8);
  signG.fillStyle(0xb45309, 1);
  signG.fillRect(2, 4, 12, 6);
  signG.fillStyle(0xfbbf24, 1);
  signG.fillRect(4, 5, 8, 2);
  signG.generateTexture('sign_post', 16, 16);
  signG.destroy();

  // Type icons 16x16
  for (const [type, color] of Object.entries(TYPE_COLORS)) {
    const tg = scene.make.graphics({ x: 0, y: 0 });
    tg.fillStyle(color, 1);
    tg.fillCircle(8, 8, 7);
    tg.fillStyle(lighten(color as number, 40), 1);
    tg.fillCircle(6, 6, 2);
    tg.generateTexture(`type_${type}`, 16, 16);
    tg.destroy();
  }

  // Footprint icons per shape
  const footprintShapes: Record<string, number> = {
    blob: 0xc0c0c0, quadruped: 0xa89070, serpent: 0x8899aa, avian: 0x667788,
    humanoid: 0x996633, crystalline: 0xb794f6,
  };
  for (const [shape, color] of Object.entries(footprintShapes)) {
    const fg = scene.make.graphics({ x: 0, y: 0 });
    fg.fillStyle(color, 1);
    if (shape === 'avian') {
      fg.fillTriangle(8, 2, 4, 12, 12, 12);
    } else if (shape === 'serpent') {
      fg.fillEllipse(8, 8, 12, 6);
    } else {
      fg.fillCircle(5, 10, 3);
      fg.fillCircle(11, 10, 3);
      fg.fillEllipse(8, 6, 8, 5);
    }
    fg.generateTexture(`footprint_${shape}`, 16, 16);
    fg.destroy();
  }

  // Biome battle backgrounds
  const biomes: { key: string; sky: number; ground: number; accent: number; variant: string }[] = [
    { key: 'battle_bg', sky: 0x87ceeb, ground: 0x6bbf59, accent: 0x5a9e4a, variant: 'default' },
    { key: 'battle_bg_forest', sky: 0x6b9080, ground: 0x40916c, accent: 0x2d6a4f, variant: 'forest' },
    { key: 'battle_bg_cave', sky: 0x44403c, ground: 0x292524, accent: 0x1c1917, variant: 'cave' },
    { key: 'battle_bg_gym', sky: 0xd4c4a8, ground: 0xc4b498, accent: 0xa89070, variant: 'gym' },
    { key: 'battle_bg_volcano', sky: 0x7f1d1d, ground: 0x44403c, accent: 0x991b1b, variant: 'volcano' },
  ];
  for (const b of biomes) {
    const bg = scene.make.graphics({ x: 0, y: 0 });
    drawBiomeBattleBg(bg, b, b.variant);
    bg.generateTexture(b.key, 640, 480);
    bg.destroy();
  }

  // Legacy npc - remove old single npc block below if replaced
  const npcG = scene.make.graphics({ x: 0, y: 0 });
  npcG.fillStyle(0x9333ea, 1);
  npcG.fillRect(4, 6, 8, 7);
  npcG.fillStyle(0xfca5a5, 1);
  npcG.fillCircle(8, 5, 4);
  npcG.fillStyle(0x1a1a2e, 1);
  npcG.fillRect(6, 4, 2, 2);
  npcG.fillRect(9, 4, 2, 2);
  npcG.fillStyle(0x4c1d95, 1);
  npcG.fillRect(5, 13, 3, 3);
  npcG.fillRect(9, 13, 3, 3);
  if (!scene.textures.exists('npc')) npcG.generateTexture('npc', 16, 16);
  npcG.destroy();

  // UI panel
  const panelG = scene.make.graphics({ x: 0, y: 0 });
  panelG.fillStyle(COLORS.panel, 0.95);
  panelG.fillRoundedRect(0, 0, 200, 80, 8);
  panelG.lineStyle(2, COLORS.panelBorder, 1);
  panelG.strokeRoundedRect(0, 0, 200, 80, 8);
  panelG.generateTexture('panel', 200, 80);
  panelG.destroy();

  // Menu button textures
  for (const [key, fill, border] of [
    ['btn_normal', COLORS.panel, COLORS.panelBorder],
    ['btn_selected', COLORS.panelBorder, COLORS.gold],
    ['btn_hover', lighten(COLORS.panel, 12), COLORS.gold],
  ] as const) {
    const btn = scene.make.graphics({ x: 0, y: 0 });
    btn.fillStyle(fill, 0.95);
    btn.fillRoundedRect(0, 0, 200, 36, 6);
    btn.lineStyle(2, border, 1);
    btn.strokeRoundedRect(0, 0, 200, 36, 6);
    if (key === 'btn_hover') {
      btn.fillStyle(COLORS.gold, 0.15);
      btn.fillRect(4, 4, 192, 4);
    }
    btn.generateTexture(key, 200, 36);
    btn.destroy();
  }

  const dialogG = scene.make.graphics({ x: 0, y: 0 });
  dialogG.fillStyle(COLORS.panel, 0.97);
  dialogG.fillRoundedRect(0, 0, GAME_WIDTH - 32, 96, 10);
  dialogG.lineStyle(3, COLORS.gold, 0.9);
  dialogG.strokeRoundedRect(0, 0, GAME_WIDTH - 32, 96, 10);
  dialogG.fillStyle(COLORS.accent, 0.12);
  dialogG.fillRect(8, 8, GAME_WIDTH - 48, 3);
  dialogG.generateTexture('dialog_frame', GAME_WIDTH - 32, 96);
  dialogG.destroy();

  // Controls panel backdrop
  const ctrlG = scene.make.graphics({ x: 0, y: 0 });
  ctrlG.fillStyle(COLORS.panel, 0.97);
  ctrlG.fillRoundedRect(0, 0, 560, 320, 12);
  ctrlG.lineStyle(3, COLORS.gold, 1);
  ctrlG.strokeRoundedRect(0, 0, 560, 320, 12);
  ctrlG.generateTexture('controls_panel', 560, 320);
  ctrlG.destroy();

  const titleG = scene.make.graphics({ x: 0, y: 0 });
  titleG.fillStyle(COLORS.panel, 0.95);
  titleG.fillRoundedRect(0, 0, 420, 72, 10);
  titleG.lineStyle(3, COLORS.gold, 1);
  titleG.strokeRoundedRect(0, 0, 420, 72, 10);
  titleG.fillStyle(COLORS.accent, 0.4);
  titleG.fillTriangle(0, 0, 40, 0, 0, 40);
  titleG.fillTriangle(420, 0, 380, 0, 420, 40);
  titleG.fillStyle(COLORS.panelBorder, 0.6);
  titleG.fillRect(12, 60, 396, 4);
  titleG.generateTexture('title_banner', 420, 72);
  titleG.destroy();

  const platG = scene.make.graphics({ x: 0, y: 0 });
  platG.fillStyle(0x000000, 0.2);
  platG.fillEllipse(60, 20, 118, 38);
  platG.fillStyle(0x4ade80, 0.15);
  platG.fillEllipse(60, 18, 100, 28);
  platG.lineStyle(1, 0xffffff, 0.1);
  platG.strokeEllipse(60, 20, 118, 38);
  platG.generateTexture('battle_platform', 120, 40);
  platG.destroy();

  // Battle background - default generated in biomes loop; skip duplicate
  if (!scene.textures.exists('battle_bg')) {
    const bgG = scene.make.graphics({ x: 0, y: 0 });
    bgG.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x98d8aa, 0x98d8aa, 1);
    bgG.fillRect(0, 0, 640, 480);
    bgG.fillStyle(0x6bbf59, 1);
    bgG.fillEllipse(320, 420, 700, 120);
    bgG.generateTexture('battle_bg', 640, 480);
    bgG.destroy();
  }

  // Capture orb
  const orbG = scene.make.graphics({ x: 0, y: 0 });
  orbG.fillStyle(0xffffff, 1);
  orbG.fillCircle(8, 8, 7);
  orbG.fillStyle(COLORS.accent, 1);
  orbG.fillCircle(8, 8, 5);
  orbG.lineStyle(2, 0x333333, 1);
  orbG.strokeCircle(8, 8, 7);
  orbG.lineBetween(2, 8, 14, 8);
  orbG.generateTexture('capture_orb', 16, 16);
  orbG.destroy();
}

export function generateCreatureTexture(scene: Phaser.Scene, def: CreatureDef, key: string, size = 64): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  drawCreature(g, def, size / 2, size / 2, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

export function ensureAllCreatureTextures(scene: Phaser.Scene, speciesIds: string[], getDef: (id: string) => CreatureDef): void {
  for (const id of speciesIds) {
    generateCreatureTexture(scene, getDef(id), `creature_${id}`, 64);
    generateCreatureTexture(scene, getDef(id), `creature_${id}_sm`, 32);
  }
}

export { hex, darken, lighten };

function drawPlayerWalkSprites(scene: Phaser.Scene, preset: TrainerPreset): void {
  const dirs = ['down', 'up', 'left', 'right'] as const;
  for (const dir of dirs) {
    for (let frame = 0; frame < 2; frame++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const legOffset = frame === 1 ? 1 : 0;
      g.fillStyle(0x0f172a, 1);
      g.fillRect(2, 5, 12, 11);
      g.fillStyle(preset.accent, 1);
      g.fillRect(3, 7, 10, 8);
      g.fillStyle(preset.body, 1);
      g.fillRect(4, 6, 8, 7);
      g.fillStyle(lighten(preset.body, 30), 0.5);
      g.fillRect(4, 6, 3, 4);
      g.fillStyle(preset.skin, 1);
      g.fillCircle(8, 5, 4);
      g.fillStyle(preset.hair, 1);
      g.fillCircle(8, 4, 4);
      if (preset.hat !== undefined) {
        g.fillStyle(preset.hat, 1);
        g.fillRect(5, 2, 6, 3);
      }
      g.fillStyle(0x1a1a2e, 1);
      if (dir === 'down') {
        g.fillRect(6, 4, 2, 2);
        g.fillRect(9, 4, 2, 2);
      } else if (dir === 'up') {
        g.fillStyle(preset.hair, 1);
        g.fillCircle(8, 4, 4);
        if (preset.hat !== undefined) {
          g.fillStyle(preset.hat, 1);
          g.fillRect(5, 2, 6, 3);
        }
      } else if (dir === 'left') {
        g.fillRect(5, 4, 2, 2);
      } else {
        g.fillRect(9, 4, 2, 2);
      }
      g.fillStyle(darken(preset.accent, 20), 1);
      g.fillRect(5 + legOffset, 13, 3, 3);
      g.fillRect(9 - legOffset, 13, 3, 3);
      g.fillStyle(preset.accent, 1);
      g.fillRect(2, 8, 2, 5);
      g.generateTexture(`player_${preset.id}_${dir}_${frame}`, 16, 16);
      g.destroy();
    }
  }
}

function drawPlayerBackSprite(scene: Phaser.Scene, preset: TrainerPreset): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const s = 32;
  g.fillStyle(0x0f172a, 1);
  g.fillRect(4, 8, s - 8, s - 10);
  g.fillStyle(preset.body, 1);
  g.fillRect(6, 12, s - 12, s - 16);
  g.fillStyle(preset.accent, 1);
  g.fillRect(8, 14, s - 16, 6);
  g.fillStyle(preset.hair, 1);
  g.fillCircle(s / 2, 10, 7);
  if (preset.hat !== undefined) {
    g.fillStyle(preset.hat, 1);
    g.fillRect(10, 3, 12, 5);
  }
  g.fillStyle(preset.accent, 1);
  g.fillRect(10, s - 8, 5, 6);
  g.fillRect(s - 15, s - 8, 5, 6);
  g.generateTexture(`player_back_${preset.id}`, s, s);
  g.destroy();
}
