/**
 * Generates procedural PNG assets into public/assets/.
 * Run: node scripts/generate-png-assets.mjs
 * Placeholder PNGs are ignored at runtime when meta.json has placeholder:true.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assetsDir = join(root, 'public/assets');
const critterDir = join(assetsDir, 'critters');
const npcDir = join(assetsDir, 'npcs');

mkdirSync(critterDir, { recursive: true });
mkdirSync(npcDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crc]);
}

function writePng(path, w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    rgba.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function setPx(rgba, w, x, y, [R, G, B, A = 255]) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  rgba[i] = R; rgba[i + 1] = G; rgba[i + 2] = B; rgba[i + 3] = A;
}

function fillCircle(rgba, w, h, cx, cy, r, color) {
  for (let y = Math.max(0, cy - r); y <= Math.min(h - 1, cy + r); y++) {
    for (let x = Math.max(0, cx - r); x <= Math.min(w - 1, cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPx(rgba, w, x, y, color);
    }
  }
}

function fillRect(rgba, w, _h, x, y, rw, rh, color) {
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) setPx(rgba, w, px, py, color);
  }
}

function fillEllipse(rgba, w, h, cx, cy, rx, ry, color) {
  for (let y = Math.max(0, cy - ry); y <= Math.min(h - 1, cy + ry); y++) {
    for (let x = Math.max(0, cx - rx); x <= Math.min(w - 1, cx + rx); x++) {
      if (((x - cx) ** 2) / (rx * rx) + ((y - cy) ** 2) / (ry * ry) <= 1) {
        setPx(rgba, w, x, y, color);
      }
    }
  }
}

const SHAPES = {
  emberpup: 'quadruped', aqualet: 'blob', leafkit: 'quadruped', sparkbit: 'quadruped',
  flamewyrm: 'serpent', tidefin: 'serpent', infernox: 'serpent', aquadel: 'serpent',
  vineclaw: 'quadruped', thornbeast: 'quadruped', voltwing: 'avian', mossling: 'blob',
  bloomoss: 'blob', pebblite: 'quadruped', rockord: 'humanoid', shadeling: 'humanoid',
  shadespecter: 'humanoid', crystalynx: 'crystalline', cinderkit: 'quadruped',
  geodeon: 'humanoid', mistral: 'avian', grimlet: 'quadruped', coralite: 'blob',
  emberlord: 'humanoid', tidewisp: 'blob', thornling: 'quadruped', voltite: 'blob',
};

const CREATURES = {
  emberpup: [255, 107, 53], aqualet: [59, 130, 246], leafkit: [34, 197, 94],
  sparkbit: [250, 204, 21], flamewyrm: [255, 69, 0], tidefin: [29, 78, 216],
  infernox: [220, 38, 38], aquadel: [14, 165, 233], vineclaw: [22, 163, 74],
  thornbeast: [21, 128, 61], voltwing: [234, 179, 8], mossling: [74, 222, 128],
  bloomoss: [5, 150, 105], pebblite: [120, 113, 108], rockord: [87, 83, 78],
  shadeling: [124, 58, 237], shadespecter: [91, 33, 182], crystalynx: [167, 139, 250],
  cinderkit: [251, 146, 60], geodeon: [168, 162, 158], mistral: [125, 211, 252],
  grimlet: [88, 28, 135], coralite: [6, 182, 212], emberlord: [185, 28, 28],
  tidewisp: [56, 189, 248], thornling: [74, 222, 128], voltite: [253, 224, 71],
};

function drawCreatureShape(rgba, w, h, rgb, shape) {
  const cx = w / 2, cy = h / 2, s = w;
  const dark = rgb.map(c => Math.max(0, c - 40));
  const [R, G, B] = rgb;
  if (shape === 'blob') {
    fillCircle(rgba, w, h, cx, cy, s * 0.35, [R, G, B, 255]);
    fillCircle(rgba, w, h, cx - s * 0.08, cy - s * 0.05, s * 0.06, [255, 255, 255, 255]);
    fillCircle(rgba, w, h, cx - s * 0.06, cy - s * 0.04, s * 0.03, [26, 26, 46, 255]);
    fillCircle(rgba, w, h, cx + s * 0.1, cy - s * 0.05, s * 0.06, [255, 255, 255, 255]);
  } else if (shape === 'quadruped') {
    fillEllipse(rgba, w, h, cx, cy + s * 0.05, s * 0.22, s * 0.15, [R, G, B, 255]);
    fillCircle(rgba, w, h, cx + s * 0.22, cy - s * 0.05, s * 0.18, [R, G, B, 255]);
    fillRect(rgba, w, h, cx - s * 0.15, cy + s * 0.15, s * 0.06, s * 0.12, [dark[0], dark[1], dark[2], 255]);
    fillRect(rgba, w, h, cx + s * 0.05, cy + s * 0.15, s * 0.06, s * 0.12, [dark[0], dark[1], dark[2], 255]);
  } else if (shape === 'serpent') {
    for (let i = 0; i < 5; i++) fillCircle(rgba, w, h, cx - s * 0.2 + i * s * 0.1, cy, s * 0.12, [R, G, B, 255]);
    fillCircle(rgba, w, h, cx + s * 0.28, cy - s * 0.08, s * 0.14, [R, G, B, 255]);
  } else if (shape === 'avian') {
    fillEllipse(rgba, w, h, cx, cy, s * 0.17, s * 0.12, [R, G, B, 255]);
    fillCircle(rgba, w, h, cx + s * 0.15, cy - s * 0.12, s * 0.12, [R, G, B, 255]);
  } else if (shape === 'humanoid') {
    fillCircle(rgba, w, h, cx, cy - s * 0.12, s * 0.14, [R, G, B, 255]);
    fillRect(rgba, w, h, cx - s * 0.1, cy, s * 0.2, s * 0.22, [R, G, B, 255]);
  } else {
    fillCircle(rgba, w, h, cx, cy, s * 0.3, [R, G, B, 255]);
    fillCircle(rgba, w, h, cx - s * 0.05, cy - s * 0.1, s * 0.05, [255, 255, 255, 200]);
  }
}

for (const [id, rgb] of Object.entries(CREATURES)) {
  const shape = SHAPES[id] ?? 'blob';
  for (const size of [64, 32]) {
    const rgba = Buffer.alloc(size * size * 4, 0);
    drawCreatureShape(rgba, size, size, rgb, shape);
    writePng(join(critterDir, `${id}${size === 32 ? '_sm' : ''}.png`), size, size, rgba);
  }
}

const NPCS = {
  generic: [147, 51, 234], nurse: [244, 114, 182], clerk: [59, 130, 246],
  trainer_m: [34, 197, 94], trainer_f: [236, 72, 153], rival: [239, 68, 68],
  leader: [245, 158, 11], prof: [99, 102, 241],
};

for (const [role, rgb] of Object.entries(NPCS)) {
  const rgba = Buffer.alloc(16 * 16 * 4, 0);
  fillRect(rgba, 16, 16, 3, 6, 10, 8, [...rgb, 255]);
  fillCircle(rgba, 16, 16, 8, 5, 4, [252, 211, 77, 255]);
  fillRect(rgba, 16, 16, 4, 14, 3, 2, [30, 30, 50, 255]);
  fillRect(rgba, 16, 16, 9, 14, 3, 2, [30, 30, 50, 255]);
  writePng(join(npcDir, `${role}.png`), 16, 16, rgba);
}

writeFileSync(join(assetsDir, 'meta.json'), JSON.stringify({ placeholder: true, version: 1 }, null, 2) + '\n');
console.log('Generated PNG assets in public/assets/ (placeholder mode — procedural art used in-game)');
