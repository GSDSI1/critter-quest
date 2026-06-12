/**
 * Hand-authored pixel art for batch-8 mid-route species (dex ~17–35).
 */
import { setPx, shade, rgbFromHex } from '../png-utils.mjs';

const OUTLINE = [26, 26, 46, 255];
const EYE = [26, 26, 46, 255];
const WHITE = [255, 255, 255, 255];

function blitGrid(rgba, w, grid, palette, ox, oy, scale) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const col = palette[ch] ?? palette[ch.toLowerCase()];
      if (!col) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          setPx(rgba, w, ox + x * scale + sx, oy + y * scale + sy, col);
        }
      }
    }
  }
}

function paletteFromHex(hex) {
  const rgb = rgbFromHex(hex);
  return {
    o: OUTLINE,
    b: [...rgb, 255],
    d: [...shade(rgb, -40), 255],
    l: [...shade(rgb, 35), 255],
    h: [...shade(rgb, 55), 255],
    e: EYE,
    w: WHITE,
    g: [74, 222, 128, 255],
    p: [244, 114, 182, 255],
    y: [255, 220, 80, 255],
    v: [139, 92, 246, 255],
    t: [56, 189, 248, 255],
    r: [239, 68, 68, 255],
    s: [168, 162, 158, 255],
    i: [186, 230, 253, 255],
  };
}

const BLOB = [
  '................................',
  '...........bbb..................',
  '..........bBBBb.................',
  '.........bBYYeBb................',
  '........bBBBBBBb................',
  '.........bBBBBb.................',
  '..........bbb...................',
  '.........bdddb..................',
  '........bd...db.................',
  '.......bd.....db................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const WING = [
  '................................',
  '......vvvv......................',
  '.....vBBBBv.....................',
  '....vBYYeBv.....................',
  '.....vBBBv......................',
  '......bbb.......................',
  '.......bb.......................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const GRIDS = {
  shadespecter: { front: WING, f2: WING, back: WING, color: 0x6d28d9, ox: 6, oy: 8 },
  crystalynx: { front: BLOB, f2: BLOB, back: BLOB, color: 0xa78bfa, ox: 8, oy: 10 },
  emberlord: { front: BLOB, f2: BLOB, back: BLOB, color: 0xdc2626, ox: 8, oy: 10 },
  geodeon: { front: BLOB, f2: BLOB, back: BLOB, color: 0x78716c, ox: 6, oy: 8 },
  mistral: { front: WING, f2: WING, back: WING, color: 0x22d3ee, ox: 6, oy: 8 },
  grimlet: { front: BLOB, f2: BLOB, back: BLOB, color: 0x44403c, ox: 8, oy: 10 },
  coralite: { front: BLOB, f2: BLOB, back: BLOB, color: 0xf472b6, ox: 8, oy: 10 },
  tidewisp: { front: WING, f2: WING, back: WING, color: 0x38bdf8, ox: 6, oy: 8 },
  frostkit: { front: BLOB, f2: BLOB, back: BLOB, color: 0xbae6fd, ox: 8, oy: 10 },
  glacetail: { front: WING, f2: WING, back: WING, color: 0x7dd3fc, ox: 6, oy: 8 },
  arctodon: { front: BLOB, f2: BLOB, back: BLOB, color: 0x64748b, ox: 6, oy: 8 },
  mindling: { front: BLOB, f2: BLOB, back: BLOB, color: 0xe879f9, ox: 8, oy: 10 },
  cerebrain: { front: BLOB, f2: BLOB, back: BLOB, color: 0xd946ef, ox: 6, oy: 8 },
  astralyn: { front: WING, f2: WING, back: WING, color: 0x8b5cf6, ox: 6, oy: 8 },
  snowpuff: { front: BLOB, f2: BLOB, back: BLOB, color: 0xf0f9ff, ox: 8, oy: 10 },
};

function drawBatch8(rgba, w, id, { frame = 0, back = false } = {}) {
  const spec = GRIDS[id];
  if (!spec) return false;
  const pal = paletteFromHex(spec.color);
  const scale = w / 64;
  const gridScale = scale * 2;
  const ox = Math.floor(spec.ox * scale);
  const oy = Math.floor((spec.oy + (frame ? 1 : 0)) * scale);
  const grid = back ? spec.back : (frame ? spec.f2 : spec.front);
  blitGrid(rgba, w, grid, pal, ox, oy, gridScale);
  return true;
}

export const BATCH8_SPECIES = Object.keys(GRIDS);

export function drawBatch8Override(rgba, w, id, opts = {}) {
  return drawBatch8(rgba, w, id, opts);
}
