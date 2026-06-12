/**
 * Hand-authored pixel art for batch-9 route 3–4 / gym2 species (dex ~36–67).
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
    o: OUTLINE, b: [...rgb, 255], d: [...shade(rgb, -40), 255],
    l: [...shade(rgb, 35), 255], h: [...shade(rgb, 55), 255],
    e: EYE, w: WHITE, g: [74, 222, 128, 255], p: [244, 114, 182, 255],
    y: [255, 220, 80, 255], v: [139, 92, 246, 255], t: [56, 189, 248, 255],
    r: [239, 68, 68, 255], s: [168, 162, 158, 255], i: [186, 230, 253, 255],
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
  dreamwisp: { front: WING, f2: WING, back: WING, color: 0xc4b5fd, ox: 6, oy: 8 },
  somnara: { front: WING, f2: WING, back: WING, color: 0x8b5cf6, ox: 6, oy: 8 },
  frosthorn: { front: BLOB, f2: BLOB, back: BLOB, color: 0x7dd3fc, ox: 8, oy: 10 },
  glaciorex: { front: BLOB, f2: BLOB, back: BLOB, color: 0x38bdf8, ox: 6, oy: 8 },
  chillbite: { front: BLOB, f2: BLOB, back: BLOB, color: 0x1e3a5f, ox: 8, oy: 10 },
  psyknight: { front: BLOB, f2: BLOB, back: BLOB, color: 0xf9a8d4, ox: 8, oy: 10 },
  voidseer: { front: WING, f2: WING, back: WING, color: 0x4c1d95, ox: 6, oy: 8 },
  zenolith: { front: BLOB, f2: BLOB, back: BLOB, color: 0xd946ef, ox: 6, oy: 8 },
  coalemb: { front: BLOB, f2: BLOB, back: BLOB, color: 0x44403c, ox: 8, oy: 10 },
  reefguard: { front: BLOB, f2: BLOB, back: BLOB, color: 0x0d9488, ox: 6, oy: 8 },
  stormhorn: { front: BLOB, f2: BLOB, back: BLOB, color: 0xfbbf24, ox: 8, oy: 10 },
  embershell: { front: BLOB, f2: BLOB, back: BLOB, color: 0x78716c, ox: 8, oy: 10 },
  murkfox: { front: BLOB, f2: BLOB, back: BLOB, color: 0x3f3f46, ox: 8, oy: 10 },
  frostnip: { front: BLOB, f2: BLOB, back: BLOB, color: 0xe0f2fe, ox: 8, oy: 10 },
  thunderhawk: { front: WING, f2: WING, back: WING, color: 0xf59e0b, ox: 4, oy: 6 },
};

function drawBatch9(rgba, w, id, { frame = 0, back = false } = {}) {
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

export const BATCH9_SPECIES = Object.keys(GRIDS);

export function drawBatch9Override(rgba, w, id, opts = {}) {
  return drawBatch9(rgba, w, id, opts);
}
