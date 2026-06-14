/**
 * Generates pixel-art PNG assets into public/assets/.
 * Run: npm run gen-assets
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  writePng, setPx, fillRect, fillCircle, fillEllipse, outlineShape,
  shade, rgbFromHex, hashSeed, readPng, getPx,
} from './png-utils.mjs';
import { drawStarterOverride } from './critter-art/starters.mjs';
import { drawBatch5Override } from './critter-art/batch5.mjs';
import { drawBatch6Override } from './critter-art/batch6.mjs';
import { drawBatch8Override } from './critter-art/batch8.mjs';
import { drawBatch9Override } from './critter-art/batch9.mjs';
import { drawBatch10Override } from './critter-art/batch10.mjs';
import { drawShapeArt } from './critter-art/shapelib.mjs';
import { generatePlayerPngs } from './critter-art/players.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assetsDir = join(root, 'public/assets');
const critterDir = join(assetsDir, 'critters');
const npcDir = join(assetsDir, 'npcs');
const playerDir = join(assetsDir, 'players');
const audioDir = join(assetsDir, 'audio');

mkdirSync(critterDir, { recursive: true });
mkdirSync(npcDir, { recursive: true });
mkdirSync(playerDir, { recursive: true });
mkdirSync(audioDir, { recursive: true });

function parseCreatures(ts) {
  const out = [];
  for (const m of ts.matchAll(/^  ([a-z][a-z0-9_]*): \{/gm)) {
    const id = m[1];
    const start = m.index;
    const end = ts.indexOf('\n  },', start);
    const block = ts.slice(start, end + 1);
    const color = parseInt(block.match(/color:\s*(0x[\da-fA-F]+)/)?.[1] ?? '0x888888', 16);
    const shape = block.match(/shape:\s*'(\w+)'/)?.[1] ?? 'blob';
    const typeM = block.match(/types:\s*\['(\w+)'(?:,\s*'(\w+)')?\]/);
    const types = typeM ? [typeM[1], typeM[2]].filter(Boolean) : ['flame'];
    out.push({ id, color, shape, types });
  }
  return out;
}

const TYPE_ACCENTS = {
  flame: [255, 120, 40], tide: [56, 189, 248], leaf: [74, 222, 128],
  volt: [253, 224, 71], stone: [168, 162, 158], shadow: [139, 92, 246],
  ice: [186, 230, 253], psychic: [244, 114, 182],
};

function drawTypeDetail(rgba, w, h, type, cx, cy, s, frame) {
  const c = TYPE_ACCENTS[type] ?? [200, 200, 200];
  if (type === 'flame') {
    fillCircle(rgba, w, h, cx - s * 0.15 + frame, cy - s * 0.35, s * 0.08, [...c, 220]);
    fillCircle(rgba, w, h, cx + s * 0.05, cy - s * 0.38, s * 0.06, [...shade(c, 30), 200]);
  } else if (type === 'leaf') {
    fillEllipse(rgba, w, h, cx + s * 0.2, cy - s * 0.2, s * 0.1, s * 0.06, [...c, 200]);
  } else if (type === 'tide') {
    fillRect(rgba, w, h, cx - s * 0.2, cy - s * 0.15 + frame, s * 0.4, 2, [...c, 180]);
  } else if (type === 'ice') {
    setPx(rgba, w, cx, cy - s * 0.3, [...c, 255]);
    setPx(rgba, w, cx - 2, cy - s * 0.28, [...c, 200]);
    setPx(rgba, w, cx + 2, cy - s * 0.28, [...c, 200]);
  } else if (type === 'psychic') {
    fillCircle(rgba, w, h, cx, cy - s * 0.32, s * 0.05, [...c, 180]);
  }
}

function drawCreature(rgba, w, h, { id, color, shape, types }, opts = {}) {
  const { frame = 0, back = false } = opts;
  if (id && drawStarterOverride(rgba, w, id, { frame, back })) return;
  if (id && drawBatch5Override(rgba, w, id, { frame, back })) return;
  if (id && drawBatch6Override(rgba, w, id, { frame, back })) return;
  if (id && drawBatch8Override(rgba, w, id, { frame, back })) return;
  if (id && drawBatch9Override(rgba, w, id, { frame, back })) return;
  if (id && drawBatch10Override(rgba, w, id, { frame, back })) return;
  if (drawShapeArt(rgba, w, { id, color, shape, types }, { frame, back })) return;
  const rgb = rgbFromHex(color);
  const dark = shade(rgb, -45);
  const mid = shade(rgb, -12);
  const light = shade(rgb, 45);
  const highlight = shade(rgb, 65);
  const cx = w / 2 + frame;
  const cy = h / 2 + (frame ? 1 : 0);
  const s = w;

  if (back) {
    fillEllipse(rgba, w, h, cx, cy + s * 0.04, s * 0.26, s * 0.2, [...rgb, 255]);
    fillEllipse(rgba, w, h, cx, cy - s * 0.12, s * 0.14, s * 0.12, [...shade(rgb, 10), 255]);
    fillEllipse(rgba, w, h, cx, cy + s * 0.24, s * 0.1, s * 0.07, [...dark, 255]);
    fillCircle(rgba, w, h, cx - s * 0.14, cy - s * 0.1, s * 0.05, [...light, 180]);
    fillCircle(rgba, w, h, cx + s * 0.14, cy - s * 0.1, s * 0.05, [...light, 180]);
    fillRect(rgba, w, h, cx - s * 0.04, cy - s * 0.2, s * 0.08, s * 0.06, [...shade(rgb, 20), 255]);
    outlineShape(rgba, w, h);
    return;
  }

  switch (shape) {
    case 'blob':
      fillCircle(rgba, w, h, cx, cy, s * 0.32, [...rgb, 255]);
      fillCircle(rgba, w, h, cx - s * 0.06, cy + s * 0.04, s * 0.22, [...mid, 255]);
      fillCircle(rgba, w, h, cx - s * 0.1, cy - s * 0.12, s * 0.1, [...light, 200]);
      fillCircle(rgba, w, h, cx + s * 0.04, cy - s * 0.14, s * 0.06, [...highlight, 160]);
      if (frame === 0) {
        fillCircle(rgba, w, h, cx - s * 0.08, cy - s * 0.04, s * 0.05, [255, 255, 255, 255]);
        fillCircle(rgba, w, h, cx + s * 0.1, cy - s * 0.04, s * 0.05, [255, 255, 255, 255]);
        setPx(rgba, w, cx - s * 0.06, cy - s * 0.03, [26, 26, 46, 255]);
        setPx(rgba, w, cx + s * 0.12, cy - s * 0.03, [26, 26, 46, 255]);
      } else {
        fillRect(rgba, w, h, cx - s * 0.12, cy - s * 0.05, s * 0.08, 2, [26, 26, 46, 255]);
        fillRect(rgba, w, h, cx + s * 0.06, cy - s * 0.05, s * 0.08, 2, [26, 26, 46, 255]);
      }
      break;
    case 'quadruped':
      fillEllipse(rgba, w, h, cx, cy + s * 0.06, s * 0.22, s * 0.14, [...rgb, 255]);
      fillCircle(rgba, w, h, cx + s * 0.2 + frame, cy - s * 0.04, s * 0.16, [...rgb, 255]);
      fillRect(rgba, w, h, cx - s * 0.14, cy + s * 0.14, s * 0.05, s * 0.1, [...dark, 255]);
      fillRect(rgba, w, h, cx + s * 0.04, cy + s * 0.14, s * 0.05, s * 0.1, [...dark, 255]);
      fillCircle(rgba, w, h, cx + s * 0.26, cy - s * 0.06, s * 0.04, [255, 255, 255, 255]);
      setPx(rgba, w, cx + s * 0.27, cy - s * 0.05, [26, 26, 46, 255]);
      break;
    case 'serpent':
      for (let i = 0; i < 5; i++) {
        fillCircle(rgba, w, h, cx - s * 0.2 + i * s * 0.09 + frame, cy + Math.sin(i) * 2, s * 0.1, [...rgb, 255]);
      }
      fillCircle(rgba, w, h, cx + s * 0.26, cy - s * 0.08, s * 0.12, [...rgb, 255]);
      fillCircle(rgba, w, h, cx + s * 0.3, cy - s * 0.1, s * 0.04, [255, 255, 255, 255]);
      setPx(rgba, w, cx + s * 0.31, cy - s * 0.09, [26, 26, 46, 255]);
      break;
    case 'avian':
      fillEllipse(rgba, w, h, cx, cy, s * 0.16, s * 0.12, [...rgb, 255]);
      fillCircle(rgba, w, h, cx + s * 0.14, cy - s * 0.1, s * 0.1, [...rgb, 255]);
      fillEllipse(rgba, w, h, cx - s * 0.12, cy, s * 0.14, s * 0.06, [...light, 180]);
      fillCircle(rgba, w, h, cx + s * 0.17, cy - s * 0.12, s * 0.03, [26, 26, 46, 255]);
      break;
    case 'humanoid':
      fillCircle(rgba, w, h, cx, cy - s * 0.1, s * 0.12, [...rgb, 255]);
      fillRect(rgba, w, h, cx - s * 0.08, cy + s * 0.02, s * 0.16, s * 0.18, [...rgb, 255]);
      fillRect(rgba, w, h, cx - s * 0.14, cy + s * 0.04, s * 0.06, s * 0.14, [...dark, 255]);
      fillRect(rgba, w, h, cx + s * 0.08, cy + s * 0.04, s * 0.06, s * 0.14, [...dark, 255]);
      setPx(rgba, w, cx - s * 0.04, cy - s * 0.12, [26, 26, 46, 255]);
      setPx(rgba, w, cx + s * 0.04, cy - s * 0.12, [26, 26, 46, 255]);
      break;
    case 'crystalline':
      fillCircle(rgba, w, h, cx, cy, s * 0.28, [...rgb, 255]);
      fillCircle(rgba, w, h, cx - s * 0.08, cy - s * 0.1, s * 0.06, [...light, 220]);
      setPx(rgba, w, cx, cy - s * 0.15, [255, 255, 255, 255]);
      break;
    default:
      fillCircle(rgba, w, h, cx, cy, s * 0.28, [...rgb, 255]);
  }

  drawTypeDetail(rgba, w, h, types[0], cx, cy, s, frame);
  if (types[1]) drawTypeDetail(rgba, w, h, types[1], cx + s * 0.05, cy + s * 0.05, s * 0.8, frame);

  const seed = hashSeed(`${color}${shape}`);
  for (let i = 0; i < 12; i++) {
    const px = (seed + i * 17) % (w - 4) + 2;
    const py = (seed + i * 31) % (h - 4) + 2;
    if (rgba[(py * w + px) * 4 + 3] > 0) setPx(rgba, w, px, py, [...shade(rgb, -20), 200]);
  }
  outlineShape(rgba, w, h);
}

const creatures = parseCreatures(readFileSync(join(root, 'src/data/creatures.ts'), 'utf8'));
console.log(`Generating ${creatures.length} species...`);

for (const def of creatures) {
  for (const size of [64, 32]) {
    for (const frame of [0, 1]) {
      const rgba = Buffer.alloc(size * size * 4, 0);
      drawCreature(rgba, size, size, def, { frame: frame === 1 ? 2 : 0 });
      const suffix = size === 32 ? '_sm' : '';
      const frameSuffix = frame === 1 ? '_f2' : '';
      writePng(join(critterDir, `${def.id}${suffix}${frameSuffix}.png`), size, size, rgba);
    }
    const back = Buffer.alloc(size * size * 4, 0);
    drawCreature(back, size, size, def, { back: true });
    writePng(join(critterDir, `${def.id}${size === 32 ? '_sm' : ''}_back.png`), size, size, back);
  }
}

const NPCS = {
  generic: [147, 51, 234], nurse: [244, 114, 182], clerk: [59, 130, 246],
  trainer_m: [34, 197, 94], trainer_f: [236, 72, 153], rival: [239, 68, 68],
  leader: [245, 158, 11], prof: [99, 102, 241],
};

function drawNpc(rgba, role, rgb) {
  fillRect(rgba, 32, 32, 10, 12, 12, 14, [...rgb, 255]);
  fillCircle(rgba, 32, 32, 16, 10, 6, [252, 211, 77, 255]);
  fillRect(rgba, 32, 32, 12, 26, 4, 4, [30, 30, 50, 255]);
  fillRect(rgba, 32, 32, 18, 26, 4, 4, [30, 30, 50, 255]);
  if (role === 'nurse') {
    fillRect(rgba, 32, 32, 8, 14, 16, 12, [255, 255, 255, 230]);
    fillRect(rgba, 32, 32, 14, 8, 4, 3, [239, 68, 68, 255]);
  } else if (role === 'leader') {
    fillRect(rgba, 32, 32, 6, 12, 20, 6, [245, 158, 11, 220]);
    fillCircle(rgba, 32, 32, 16, 8, 3, [250, 204, 21, 255]);
  } else if (role === 'rival') {
    fillRect(rgba, 32, 32, 8, 9, 16, 4, [220, 38, 38, 255]);
  } else if (role === 'prof') {
    fillRect(rgba, 32, 32, 12, 10, 8, 3, [30, 30, 50, 200]);
    setPx(rgba, 32, 13, 11, [200, 230, 255, 255]);
    setPx(rgba, 32, 19, 11, [200, 230, 255, 255]);
  } else if (role === 'clerk') {
    fillRect(rgba, 32, 32, 9, 13, 14, 3, [255, 255, 255, 200]);
  } else if (role === 'trainer_m' || role === 'trainer_f') {
    fillRect(rgba, 32, 32, 14, 11, 4, 8, [...shade(rgb, 30), 255]);
  }
  outlineShape(rgba, 32, 32);
}

for (const [role, rgb] of Object.entries(NPCS)) {
  const rgba = Buffer.alloc(32 * 32 * 4, 0);
  drawNpc(rgba, role, rgb);
  writePng(join(npcDir, `${role}.png`), 32, 32, rgba);
}

generatePlayerPngs(playerDir);
console.log('Generated player trainer sprites.');

writeFileSync(join(assetsDir, 'meta.json'), JSON.stringify({ placeholder: false, version: 3, atlas: true }, null, 2) + '\n');
console.log('Generated critters + NPCs + players. meta.json → placeholder:false, atlas:true');

import { spawnSync } from 'child_process';
spawnSync('node', ['scripts/pack-tileset.mjs'], { cwd: root, stdio: 'inherit' });

spawnSync('node', ['scripts/generate-audio.mjs'], { cwd: root, stdio: 'inherit' });

spawnSync('node', ['scripts/pack-critter-atlas.mjs'], { cwd: root, stdio: 'inherit' });

const kenneyDir = join(assetsDir, 'tiles/kenney');
if (existsSync(kenneyDir) && readdirSync(kenneyDir).some(f => f.endsWith('.png'))) {
  console.log('Re-merging Kenney tiles into tileset...');
  spawnSync('node', ['scripts/import-kenney-tileset.mjs'], { cwd: root, stdio: 'inherit' });
}

console.log('Asset pipeline complete.');

function scaleNearest(src, sw, sh, dw, dh) {
  const out = Buffer.alloc(dw * dh * 4, 0);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.floor(x * sw / dw);
      const sy = Math.floor(y * sh / dh);
      const px = getPx(src, sw, sx, sy);
      if (px) setPx(out, dw, x, y, px);
    }
  }
  return out;
}

const emberPath = join(critterDir, 'emberpup_sm.png');
if (existsSync(emberPath)) {
  const { w, h, rgba } = readPng(emberPath);
  writePng(join(root, 'public/pwa-192.png'), 192, 192, scaleNearest(rgba, w, h, 192, 192));
  writePng(join(root, 'public/favicon.png'), 32, 32, rgba);
  console.log('Wrote public/pwa-192.png + public/favicon.png from emberpup');
}
