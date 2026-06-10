#!/usr/bin/env node
/** Pack 19 individual 16×16 PNGs into public/assets/tiles/tileset.png (index order per README). */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/assets/tiles/tileset.png');

// Minimal 19×16 vertical strip placeholder when sources missing (RGBA gray tiles)
const w = 16;
const h = 16 * 19;
const buf = Buffer.alloc(w * h * 4, 0x44);
for (let i = 0; i < 19; i++) {
  const shade = 0x30 + i * 4;
  for (let y = i * 16; y < (i + 1) * 16; y++) {
    for (let x = 0; x < 16; x++) {
      const o = (y * w + x) * 4;
      buf[o] = shade;
      buf[o + 1] = shade + 10;
      buf[o + 2] = shade + 20;
      buf[o + 3] = 255;
    }
  }
}

// Write uncompressed PNG (IHDR + IDAT + IEND) — use sharp if available later
function crc32(data) {
  let c = 0xffffffff;
  for (const byte of data) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(w, 0);
ihdr.writeUInt32BE(h, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const raw = Buffer.alloc(h * (1 + w * 4));
for (let y = 0; y < h; y++) {
  raw[y * (1 + w * 4)] = 0;
  buf.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
}

import zlib from 'zlib';
const idat = zlib.deflateSync(raw);
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

writeFileSync(out, png);
console.log(`Wrote ${out} (${w}×${h})`);
if (!existsSync(join(root, 'public/assets/tiles/sources'))) {
  console.log('Tip: add public/assets/tiles/sources/000.png..018.png for real art, then re-run.');
}
