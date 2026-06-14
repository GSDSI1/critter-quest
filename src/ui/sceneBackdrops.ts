import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { battleBgForMap } from '../utils/assetLoader';
import type { MapTheme } from '../data/maps/types';
import { pinContainerChildren } from './screenUi';

/** Shared rounded panel chrome for menus. */
export function buildMenuPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  depth = 5,
): Phaser.GameObjects.Graphics | Phaser.GameObjects.NineSlice {
  if (scene.textures.exists('ui_panel')) {
    return scene.add.nineslice(x, y, 'ui_panel', undefined, w, h, 12, 12, 12, 12).setDepth(depth);
  }
  const panel = scene.add.graphics().setDepth(depth);
  panel.fillStyle(COLORS.panel, 0.94);
  panel.fillRoundedRect(x, y, w, h, 12);
  panel.lineStyle(2, COLORS.gold, 0.85);
  panel.strokeRoundedRect(x, y, w, h, 12);
  panel.fillStyle(COLORS.accent, 0.15);
  panel.fillRect(x + 8, y + 8, w - 16, 3);
  return panel;
}

/** Semi-transparent full-screen overlay. */
export function buildScreenOverlay(
  scene: Phaser.Scene,
  alpha = 0.65,
  depth = 4,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0x000000, alpha);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  return g;
}

/** Research lab interior — bookshelves, window light, floor tiles. */
export function buildLabInterior(scene: Phaser.Scene, depth = -5): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);

  const wall = scene.add.graphics();
  wall.fillGradientStyle(0x2d3748, 0x2d3748, 0x4a5568, 0x553c9a, 1);
  wall.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(wall);

  const floor = scene.add.graphics();
  floor.fillStyle(0xe2e8f0, 1);
  floor.fillRect(0, 340, GAME_WIDTH, GAME_HEIGHT - 340);
  for (let x = 0; x < GAME_WIDTH; x += 32) {
    floor.fillStyle((x / 32) % 2 === 0 ? 0xcbd5e1 : 0xe2e8f0, 0.6);
    floor.fillRect(x, 340, 32, GAME_HEIGHT - 340);
  }
  floor.lineStyle(2, 0x94a3b8, 0.5);
  floor.lineBetween(0, 340, GAME_WIDTH, 340);
  c.add(floor);

  const shelves = scene.add.graphics();
  shelves.fillStyle(0x78350f, 1);
  shelves.fillRect(24, 60, 80, 200);
  shelves.fillRect(GAME_WIDTH - 104, 60, 80, 200);
  shelves.fillStyle(0x92400e, 1);
  for (let row = 0; row < 5; row++) {
    shelves.fillRect(28, 80 + row * 38, 72, 4);
    shelves.fillRect(GAME_WIDTH - 100, 80 + row * 38, 72, 4);
    shelves.fillStyle(0x6366f1, 0.7);
    shelves.fillRect(32 + (row % 3) * 18, 88 + row * 38, 14, 22);
    shelves.fillStyle(0x22c55e, 0.7);
    shelves.fillRect(52 + (row % 2) * 16, 88 + row * 38, 14, 22);
    shelves.fillStyle(0x92400e, 1);
  }
  c.add(shelves);

  const window = scene.add.graphics();
  window.fillStyle(0x0ea5e9, 0.35);
  window.fillRoundedRect(GAME_WIDTH / 2 - 60, 40, 120, 80, 6);
  window.lineStyle(3, 0x94a3b8, 1);
  window.strokeRoundedRect(GAME_WIDTH / 2 - 60, 40, 120, 80, 6);
  window.lineStyle(2, 0xcbd5e1, 0.8);
  window.lineBetween(GAME_WIDTH / 2, 40, GAME_WIDTH / 2, 120);
  window.lineBetween(GAME_WIDTH / 2 - 60, 80, GAME_WIDTH / 2 + 60, 80);
  window.fillStyle(0xffffff, 0.12);
  window.fillTriangle(GAME_WIDTH / 2 - 50, 50, GAME_WIDTH / 2 - 20, 50, GAME_WIDTH / 2 - 50, 75);
  c.add(window);

  const bench = scene.add.graphics();
  bench.fillStyle(0x4338ca, 1);
  bench.fillRoundedRect(100, 300, GAME_WIDTH - 200, 18, 4);
  bench.fillStyle(0x312e81, 1);
  bench.fillRect(100, 318, GAME_WIDTH - 200, 6);
  c.add(bench);

  return c;
}

/** Poké-mart style shop interior. */
export function buildMartInterior(scene: Phaser.Scene, depth = -5): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);

  const bg = scene.add.graphics();
  bg.fillGradientStyle(0x1c1917, 0x292524, 0x44403c, 0x57534e, 1);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(bg);

  const counter = scene.add.graphics();
  counter.fillStyle(0x0369a1, 1);
  counter.fillRect(0, 80, GAME_WIDTH, 24);
  counter.fillStyle(0x7dd3fc, 0.4);
  counter.fillRect(0, 80, GAME_WIDTH, 4);
  counter.fillStyle(0xc4a882, 1);
  counter.fillRect(0, 104, GAME_WIDTH, GAME_HEIGHT - 104);
  for (let x = 0; x < GAME_WIDTH; x += 24) {
    counter.fillStyle(x % 48 === 0 ? 0xb8956a : 0xc4a882, 1);
    counter.fillRect(x, 104, 24, GAME_HEIGHT - 104);
  }
  c.add(counter);

  const shelves = scene.add.graphics();
  shelves.fillStyle(0x78716c, 1);
  shelves.fillRect(40, 130, 120, 280);
  shelves.fillRect(GAME_WIDTH - 160, 130, 120, 280);
  shelves.fillStyle(0xfbbf24, 0.8);
  for (let i = 0; i < 6; i++) {
    shelves.fillRect(50, 150 + i * 42, 100, 28);
    shelves.fillRect(GAME_WIDTH - 150, 150 + i * 42, 100, 28);
  }
  c.add(shelves);

  return c;
}

/** Healing center interior. */
export function buildHealInterior(scene: Phaser.Scene, depth = -5): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);

  const bg = scene.add.graphics();
  bg.fillGradientStyle(0xfdf2f8, 0xfce7f3, 0xfbcfe8, 0xf9a8d4, 1);
  bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(bg);

  const floor = scene.add.graphics();
  floor.fillStyle(0xfff1f2, 1);
  floor.fillRect(0, 320, GAME_WIDTH, GAME_HEIGHT - 320);
  floor.fillStyle(0xfbcfe8, 0.5);
  for (let x = 0; x < GAME_WIDTH; x += 40) {
    floor.fillRect(x, 320, 20, GAME_HEIGHT - 320);
  }
  c.add(floor);

  const counter = scene.add.graphics();
  counter.fillStyle(0xf472b6, 1);
  counter.fillRoundedRect(80, 100, GAME_WIDTH - 160, 60, 8);
  counter.fillStyle(0xffffff, 0.5);
  counter.fillRect(100, 110, GAME_WIDTH - 200, 8);
  counter.fillStyle(0xef4444, 1);
  counter.fillRect(GAME_WIDTH / 2 - 12, 118, 24, 24);
  counter.fillStyle(0xffffff, 1);
  counter.fillRect(GAME_WIDTH / 2 - 2, 124, 4, 12);
  counter.fillRect(GAME_WIDTH / 2 - 8, 130, 16, 4);
  c.add(counter);

  return c;
}

const GYM_TINT: Record<string, { wall: number; mat: number; accent: number }> = {
  gym1: { wall: 0x14532d, mat: 0x86efac, accent: 0x22c55e },
  gym2: { wall: 0x7f1d1d, mat: 0xfdba74, accent: 0xef4444 },
  gym3: { wall: 0x1e3a5f, mat: 0xbae6fd, accent: 0x38bdf8 },
  gym4: { wall: 0x4c1d95, mat: 0xc4b5fd, accent: 0xa855f7 },
};

/** Gym arena backdrop — fills viewport behind small tilemaps. */
export function buildGymInterior(scene: Phaser.Scene, mapId = 'gym1', depth = -5): Phaser.GameObjects.Container {
  const tint = GYM_TINT[mapId] ?? GYM_TINT.gym1;
  const c = scene.add.container(0, 0).setDepth(depth);

  const wall = scene.add.graphics();
  wall.fillGradientStyle(tint.wall, tint.wall, tint.accent, tint.accent, 0.95);
  wall.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(wall);

  const floor = scene.add.graphics();
  floor.fillStyle(tint.mat, 1);
  floor.fillRect(0, 300, GAME_WIDTH, GAME_HEIGHT - 300);
  for (let x = 0; x < GAME_WIDTH; x += 48) {
    floor.fillStyle(x % 96 === 0 ? tint.accent : tint.mat, 0.35);
    floor.fillRect(x, 300, 48, GAME_HEIGHT - 300);
  }
  floor.lineStyle(3, 0xffffff, 0.25);
  floor.strokeRect(40, 320, GAME_WIDTH - 80, GAME_HEIGHT - 340);
  c.add(floor);

  const banners = scene.add.graphics();
  banners.fillStyle(tint.accent, 0.85);
  banners.fillTriangle(GAME_WIDTH / 2 - 40, 40, GAME_WIDTH / 2 + 40, 40, GAME_WIDTH / 2, 100);
  banners.lineStyle(2, 0xffffff, 0.5);
  banners.strokeTriangle(GAME_WIDTH / 2 - 40, 40, GAME_WIDTH / 2 + 40, 40, GAME_WIDTH / 2, 100);
  c.add(banners);

  return c;
}

/** Crystal cave interior — dark stone walls + glowing crystals. */
export function buildCaveInterior(scene: Phaser.Scene, depth = -5): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);

  const wall = scene.add.graphics();
  wall.fillGradientStyle(0x1c1917, 0x1c1917, 0x292524, 0x44403c, 1);
  wall.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(wall);

  const floor = scene.add.graphics();
  floor.fillStyle(0x44403c, 1);
  floor.fillRect(0, 320, GAME_WIDTH, GAME_HEIGHT - 320);
  for (let x = 0; x < GAME_WIDTH; x += 32) {
    floor.fillStyle(x % 64 === 0 ? 0x57534e : 0x44403c, 0.8);
    floor.fillRect(x, 320, 32, GAME_HEIGHT - 320);
  }
  c.add(floor);

  const crystals = scene.add.graphics();
  const specs = [
    { x: 80, y: 120, c: 0xc084fc },
    { x: GAME_WIDTH - 100, y: 90, c: 0xa78bfa },
    { x: GAME_WIDTH / 2 - 30, y: 180, c: 0xe9d5ff },
    { x: 140, y: 260, c: 0x818cf8 },
    { x: GAME_WIDTH - 160, y: 240, c: 0xc084fc },
  ];
  for (const s of specs) {
    crystals.fillStyle(s.c, 0.85);
    crystals.fillTriangle(s.x, s.y + 40, s.x + 24, s.y, s.x + 48, s.y + 40);
    crystals.fillStyle(0xffffff, 0.25);
    crystals.fillTriangle(s.x + 8, s.y + 28, s.x + 18, s.y + 8, s.x + 28, s.y + 28);
  }
  c.add(crystals);

  return c;
}

/** Pin a full-screen interior behind overworld tilemaps (lab, mart, heal, gym, cave). */
export function buildInteriorForMap(scene: Phaser.Scene, mapId: string, mapTheme?: MapTheme): void {
  let container: Phaser.GameObjects.Container | undefined;
  if (mapTheme === 'heal' || mapId === 'heal_center') container = buildHealInterior(scene);
  else if (mapTheme === 'lab' || mapId === 'lab') container = buildLabInterior(scene);
  else if (mapTheme === 'mart' || mapId === 'mart' || mapId === 'contest_hall' || mapId === 'fishing_pier') {
    container = buildMartInterior(scene);
  } else if (mapId.startsWith('gym')) container = buildGymInterior(scene, mapId);
  else if (mapId === 'crystal_cave') container = buildCaveInterior(scene);
  if (container) pinContainerChildren(container, -5);
}

/** Battle arena background with layered parallax for a map. */
export function buildBattleArena(scene: Phaser.Scene, mapId: string, depth = -10): Phaser.GameObjects.Image {
  const key = battleBgForMap(mapId);
  const farKey = `${key}_far`;
  const container = scene.add.container(0, 0).setDepth(depth - 2);

  if (scene.textures.exists(farKey)) {
    const far = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, farKey).setAlpha(0.85);
    container.add(far);
    scene.tweens.add({
      targets: far, x: far.x + 18, duration: 14000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  const hills = scene.add.graphics();
  hills.fillStyle(mapId.includes('cave') ? 0x334155 : mapId.includes('gym') ? 0x78350f : 0x166534, 0.35);
  hills.fillEllipse(GAME_WIDTH / 2, 280, GAME_WIDTH * 0.9, 120);
  hills.fillStyle(0x000000, 0.08);
  hills.fillEllipse(GAME_WIDTH / 2, 300, GAME_WIDTH * 0.7, 80);
  container.add(hills);
  scene.tweens.add({
    targets: hills, x: 6, duration: 9000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });

  const ground = scene.add.graphics();
  ground.fillStyle(0x000000, 0.12);
  ground.fillEllipse(GAME_WIDTH / 2, 360, GAME_WIDTH * 0.85, 40);
  container.add(ground);

  const bg = scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, key).setDepth(depth);
  scene.tweens.add({
    targets: bg, y: bg.y + 4, duration: 10000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  return bg;
}
