/**
 * Generates pixel-art PNG assets into public/assets/.
 * Run: npm run gen-assets
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  writePng, setPx, fillRect, fillCircle, fillEllipse, outlineShape,
  shade, rgbFromHex, hashSeed,
} from './png-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assetsDir = join(root, 'public/assets');
const critterDir = join(assetsDir, 'critters');
const npcDir = join(assetsDir, 'npcs');
const audioDir = join(assetsDir, 'audio');

mkdirSync(critterDir, { recursive: true });
mkdirSync(npcDir, { recursive: true });
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

function drawCreature(rgba, w, h, { color, shape, types }, opts = {}) {
  const { frame = 0, back = false } = opts;
  const rgb = rgbFromHex(color);
  const dark = shade(rgb, -45);
  const light = shade(rgb, 45);
  const cx = w / 2 + frame;
  const cy = h / 2 + (frame ? 1 : 0);
  const s = w;

  if (back) {
    fillEllipse(rgba, w, h, cx, cy, s * 0.28, s * 0.22, [...rgb, 255]);
    fillRect(rgba, w, h, cx - s * 0.08, cy - s * 0.15, s * 0.16, s * 0.25, [...dark, 255]);
    fillEllipse(rgba, w, h, cx, cy + s * 0.22, s * 0.12, s * 0.08, [...shade(rgb, -20), 255]);
    outlineShape(rgba, w, h);
    return;
  }

  switch (shape) {
    case 'blob':
      fillCircle(rgba, w, h, cx, cy, s * 0.32, [...rgb, 255]);
      fillCircle(rgba, w, h, cx - s * 0.1, cy - s * 0.12, s * 0.1, [...light, 200]);
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

for (const [role, rgb] of Object.entries(NPCS)) {
  const rgba = Buffer.alloc(32 * 32 * 4, 0);
  fillRect(rgba, 32, 32, 10, 12, 12, 14, [...rgb, 255]);
  fillCircle(rgba, 32, 32, 16, 10, 6, [252, 211, 77, 255]);
  fillRect(rgba, 32, 32, 12, 26, 4, 4, [30, 30, 50, 255]);
  fillRect(rgba, 32, 32, 18, 26, 4, 4, [30, 30, 50, 255]);
  outlineShape(rgba, 32, 32);
  writePng(join(npcDir, `${role}.png`), 32, 32, rgba);
}

writeFileSync(join(assetsDir, 'meta.json'), JSON.stringify({ placeholder: false, version: 2 }, null, 2) + '\n');
console.log('Generated critters + NPCs. meta.json → placeholder:false');

import { spawnSync } from 'child_process';
spawnSync('node', ['scripts/pack-tileset.mjs'], { cwd: root, stdio: 'inherit' });

spawnSync('node', ['scripts/generate-audio.mjs'], { cwd: root, stdio: 'inherit' });

console.log('Asset pipeline complete.');
