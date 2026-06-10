#!/usr/bin/env node
/** Bake 19×16px pixel-art tiles into public/assets/tiles/tileset.png */
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writePng, setPx, fillRect, fillCircle, shade } from './png-utils.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/assets/tiles');
mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'tileset.png');

const W = 16;
const BASE_COUNT = 21;
const GRASS_PATH_AUTOTILE_COUNT = 15;
const WATER_SHORE_AUTOTILE_COUNT = 15;
const COUNT = BASE_COUNT + GRASS_PATH_AUTOTILE_COUNT + WATER_SHORE_AUTOTILE_COUNT;
const H = W * COUNT;

const C = {
  grass: [45, 106, 39],
  grassDark: [34, 84, 30],
  path: [180, 155, 110],
  water: [37, 99, 235],
  tree: [20, 83, 45],
  wall: [100, 116, 139],
  floor: [226, 232, 240],
  door: [120, 53, 15],
  roof: [185, 28, 28],
  heal: [244, 114, 182],
  sand: [234, 179, 8],
  cave: [71, 85, 105],
  mart: [59, 130, 246],
};

function drawTile(tileId, frame = 0) {
  const rgba = Buffer.alloc(W * W * 4, 0);
  const s = (x, y, c) => setPx(rgba, W, x, y, c);

  switch (tileId) {
    case 0:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      for (let i = 0; i < 6; i++) {
        s((i * 3 + tileId) % 14 + 1, (i * 2 + 1) % 13 + 1, [...shade(C.grassDark, 10), 255]);
      }
      fillRect(rgba, W, W, 0, 0, W, 1, [...shade(C.grass, 25), 200]);
      break;
    case 1:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.path, 255]);
      fillRect(rgba, W, W, 0, 0, W, 1, [...shade(C.path, 30), 180]);
      fillRect(rgba, W, W, 0, W - 2, W, 2, [...shade(C.path, -25), 200]);
      for (let x = 2; x < W - 2; x += 4) s(x, 7, [...shade(C.path, -15), 120]);
      break;
    case 2: {
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grassDark, 255]);
      const sway = frame;
      for (let i = 0; i < 3; i++) {
        const bx = 2 + i * 5 + sway;
        fillRect(rgba, W, W, bx, 2, 2, 12, [74, 222, 128, 255]);
        fillRect(rgba, W, W, bx - 1, 1, 4, 3, [34, 197, 94, 255]);
      }
      break;
    }
    case 3: {
      fillRect(rgba, W, W, 0, 0, W, W, [...C.water, 255]);
      const wy = 4 + frame * 2;
      fillRect(rgba, W, W, 1, wy, W - 2, 2, [...shade(C.water, 40), 160]);
      fillRect(rgba, W, W, 2, wy + 5, W - 4, 1, [...shade(C.water, 20), 100]);
      break;
    }
    case 4:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      fillRect(rgba, W, W, 7, 10, 2, 6, [20, 50, 20, 255]);
      fillCircle(rgba, W, W, 8, 7, 6, [...C.tree, 255]);
      fillCircle(rgba, W, W, 6, 6, 2, [...shade(C.tree, 40), 200]);
      break;
    case 5:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.wall, 255]);
      fillRect(rgba, W, W, 0, 0, W, 2, [...shade(C.wall, 30), 255]);
      fillRect(rgba, W, W, 0, W - 2, W, 2, [...shade(C.wall, -30), 255]);
      for (let y = 3; y < W; y += 4) fillRect(rgba, W, W, 0, y, W, 1, [...shade(C.wall, -15), 180]);
      break;
    case 6:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.floor, 255]);
      for (let y = 0; y < W; y += 4) {
        for (let x = 0; x < W; x += 4) {
          const c = (x + y) % 8 === 0 ? shade(C.floor, -8) : shade(C.floor, 4);
          fillRect(rgba, W, W, x, y, 4, 4, [...c, 255]);
        }
      }
      break;
    case 7:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.wall, 255]);
      fillRect(rgba, W, W, 4, 2, 8, 14, [...C.door, 255]);
      fillRect(rgba, W, W, 5, 3, 6, 12, [...shade(C.door, 20), 255]);
      s(10, 9, [250, 204, 21, 255]);
      break;
    case 8:
      fillRect(rgba, W, W, 0, 8, W, 8, [...C.roof, 255]);
      for (let x = 0; x < W; x++) {
        const h = 8 - Math.abs(x - 7);
        fillRect(rgba, W, W, x, 8 - h, 1, h, [...shade(C.roof, x % 2 ? 15 : -10), 255]);
      }
      break;
    case 9:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.floor, 255]);
      fillRect(rgba, W, W, 2, 2, 12, 12, [...C.heal, 255]);
      fillRect(rgba, W, W, 4, 4, 8, 8, [...shade(C.heal, 30), 255]);
      s(7, 5, [255, 255, 255, 255]); s(7, 9, [255, 255, 255, 255]);
      s(5, 7, [255, 255, 255, 255]); s(9, 7, [255, 255, 255, 255]);
      break;
    case 10:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      fillRect(rgba, W, W, 7, 8, 2, 8, [120, 53, 15, 255]);
      fillRect(rgba, W, W, 3, 2, 10, 7, [180, 130, 70, 255]);
      fillRect(rgba, W, W, 4, 3, 8, 5, [240, 220, 180, 255]);
      break;
    case 11:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      s(8, 10, [34, 84, 30, 255]); s(8, 11, [34, 84, 30, 255]);
      fillCircle(rgba, W, W, 8, 8, 3, [236, 72, 153, 255]);
      s(8, 6, [250, 204, 21, 255]); s(6, 8, [250, 204, 21, 255]);
      s(10, 8, [250, 204, 21, 255]); s(8, 10, [250, 204, 21, 255]);
      break;
    case 12:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      fillCircle(rgba, W, W, 8, 10, 5, [120, 113, 108, 255]);
      fillCircle(rgba, W, W, 6, 9, 2, [...shade([120, 113, 108], 25), 255]);
      break;
    case 13:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.water, 255]);
      fillRect(rgba, W, W, 0, 6, W, 4, [139, 90, 43, 255]);
      for (let x = 0; x < W; x += 4) fillRect(rgba, W, W, x, 6, 2, 4, [...shade([139, 90, 43], -20), 255]);
      break;
    case 14:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
      fillRect(rgba, W, W, 0, 8, W, 2, [180, 130, 70, 255]);
      for (let x = 1; x < W; x += 4) fillRect(rgba, W, W, x, 4, 2, 8, [160, 110, 60, 255]);
      break;
    case 15:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.sand, 255]);
      for (let i = 0; i < 8; i++) s((i * 2) % 14 + 1, (i * 3) % 12 + 2, [...shade(C.sand, -20), 180]);
      break;
    case 16:
      fillRect(rgba, W, W, 0, 0, W, W, [...shade(C.cave, 20), 255]);
      for (let i = 0; i < 5; i++) s((i * 3) % 13 + 1, (i * 2) % 13 + 1, [...shade(C.cave, -15), 200]);
      break;
    case 17:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.cave, 255]);
      fillRect(rgba, W, W, 0, 0, W, 2, [...shade(C.cave, 25), 255]);
      for (let y = 2; y < W; y += 3) fillRect(rgba, W, W, 0, y, W, 1, [...shade(C.cave, -20), 150]);
      break;
    case 18:
      fillRect(rgba, W, W, 0, 0, W, W, [...C.floor, 255]);
      fillRect(rgba, W, W, 0, 8, W, 8, [...C.mart, 255]);
      fillRect(rgba, W, W, 0, 8, W, 2, [...shade(C.mart, 40), 255]);
      break;
    case 19:
      return drawTile(2, 1);
    case 20:
      return drawTile(3, 1);
    default:
      fillRect(rgba, W, W, 0, 0, W, W, [80, 80, 80, 255]);
  }
  return rgba;
}

/** Grass tile with path edges for 4-bit neighbor mask (1–15). */
function drawGrassPathAutotile(mask) {
  const rgba = Buffer.alloc(W * W * 4, 0);
  fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
  const edge = 5;
  if (mask & 1) fillRect(rgba, W, W, 0, 0, W, edge, [...C.path, 255]);
  if (mask & 2) fillRect(rgba, W, W, W - edge, 0, edge, W, [...C.path, 255]);
  if (mask & 4) fillRect(rgba, W, W, 0, W - edge, W, edge, [...C.path, 255]);
  if (mask & 8) fillRect(rgba, W, W, 0, 0, edge, W, [...C.path, 255]);
  if ((mask & 3) === 3) fillRect(rgba, W, W, W - edge, 0, edge, edge, [...C.path, 255]);
  if ((mask & 6) === 6) fillRect(rgba, W, W, W - edge, W - edge, edge, edge, [...C.path, 255]);
  if ((mask & 9) === 9) fillRect(rgba, W, W, 0, 0, edge, edge, [...C.path, 255]);
  if ((mask & 12) === 12) fillRect(rgba, W, W, 0, W - edge, edge, edge, [...C.path, 255]);
  for (let i = 0; i < 4; i++) {
    const bx = (i * 3 + mask) % 12 + 2;
    const by = (i * 2 + mask) % 10 + 3;
    setPx(rgba, W, bx, by, [...shade(C.grassDark, 10), 255]);
  }
  return rgba;
}

/** Grass or path tile with water edges for 4-bit neighbor mask (1–15). */
function drawWaterShoreAutotile(mask) {
  const rgba = Buffer.alloc(W * W * 4, 0);
  fillRect(rgba, W, W, 0, 0, W, W, [...C.grass, 255]);
  const edge = 5;
  const waterEdge = [...shade(C.water, 20), 255];
  const foam = [...shade(C.water, 50), 220];
  if (mask & 1) {
    fillRect(rgba, W, W, 0, 0, W, edge, waterEdge);
    fillRect(rgba, W, W, 0, edge - 2, W, 2, foam);
  }
  if (mask & 2) {
    fillRect(rgba, W, W, W - edge, 0, edge, W, waterEdge);
    fillRect(rgba, W, W, W - edge - 1, 0, 2, W, foam);
  }
  if (mask & 4) {
    fillRect(rgba, W, W, 0, W - edge, W, edge, waterEdge);
    fillRect(rgba, W, W, 0, W - edge, W, 2, foam);
  }
  if (mask & 8) {
    fillRect(rgba, W, W, 0, 0, edge, W, waterEdge);
    fillRect(rgba, W, W, edge - 1, 0, 2, W, foam);
  }
  if ((mask & 3) === 3) fillRect(rgba, W, W, W - edge, 0, edge, edge, waterEdge);
  if ((mask & 6) === 6) fillRect(rgba, W, W, W - edge, W - edge, edge, edge, waterEdge);
  if ((mask & 9) === 9) fillRect(rgba, W, W, 0, 0, edge, edge, waterEdge);
  if ((mask & 12) === 12) fillRect(rgba, W, W, 0, W - edge, edge, edge, waterEdge);
  for (let i = 0; i < 3; i++) {
    setPx(rgba, W, (i * 4 + mask) % 12 + 2, (i * 3 + 2) % 10 + 4, [...shade(C.grassDark, 10), 255]);
  }
  return rgba;
}

const sheet = Buffer.alloc(W * H * 4, 0);
for (let id = 0; id < COUNT; id++) {
  let tile;
  if (id >= BASE_COUNT + GRASS_PATH_AUTOTILE_COUNT) {
    tile = drawWaterShoreAutotile(id - BASE_COUNT - GRASS_PATH_AUTOTILE_COUNT + 1);
  } else if (id >= BASE_COUNT) {
    tile = drawGrassPathAutotile(id - BASE_COUNT + 1);
  } else {
    tile = drawTile(id, id % 2);
  }
  for (let y = 0; y < W; y++) {
    tile.copy(sheet, ((id * W + y) * W) * 4, y * W * 4, (y + 1) * W * 4);
  }
}

writePng(out, W, H, sheet);
console.log(`Wrote ${out} (${W}×${H}, ${COUNT} tiles)`);
