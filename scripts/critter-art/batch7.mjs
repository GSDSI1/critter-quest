/**
 * Hand-authored pixel art for batch-7 early-route species.
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
  };
}

const MOSS = [
  '................................',
  '...........ggg..................',
  '..........gGGGg.................',
  '.........gGBBGg.................',
  '........gGBYeBg.................',
  '.........gBBBgg.................',
  '..........ggg...................',
  '.........bbbb...................',
  '........bd..db..................',
  '.......bd....db.................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const PEBBLE = [
  '................................',
  '...........ssss.................',
  '..........sSSSSs................',
  '.........sSYYeSs................',
  '........sSSSSSSs................',
  '.........ssssss.................',
  '........bddddb..................',
  '.......bd....db.................',
  '......bd......db................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const GRIDS = {
  mossling: { front: MOSS, f2: MOSS, back: MOSS, color: 0x4ade80, ox: 8, oy: 10 },
  bloomoss: { front: MOSS, f2: MOSS, back: MOSS, color: 0x22c55e, ox: 6, oy: 8 },
  pebblite: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0x78716c, ox: 8, oy: 10 },
  rockord: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0x57534e, ox: 6, oy: 8 },
  shadeling: { front: MOSS, f2: MOSS, back: MOSS, color: 0x7c3aed, ox: 8, oy: 10 },
  cinderkit: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0xf97316, ox: 8, oy: 10 },
  thornling: { front: MOSS, f2: MOSS, back: MOSS, color: 0x84cc16, ox: 8, oy: 10 },
  sparkbit: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0xeab308, ox: 8, oy: 10 },
  voltite: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0xfacc15, ox: 6, oy: 8 },
  vineclaw: { front: MOSS, f2: MOSS, back: MOSS, color: 0x16a34a, ox: 6, oy: 8 },
  thornbud: { front: MOSS, f2: MOSS, back: MOSS, color: 0x65a30d, ox: 8, oy: 10 },
  kelpling: { front: MOSS, f2: MOSS, back: MOSS, color: 0x06b6d4, ox: 8, oy: 10 },
  brinepup: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0x0ea5e9, ox: 8, oy: 10 },
  nightmoth: { front: MOSS, f2: MOSS, back: MOSS, color: 0xa855f7, ox: 6, oy: 8 },
  miragen: { front: PEBBLE, f2: PEBBLE, back: PEBBLE, color: 0x6366f1, ox: 8, oy: 10 },
};

function drawBatch7(rgba, w, id, { frame = 0, back = false } = {}) {
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

export const BATCH7_SPECIES = Object.keys(GRIDS);

export function drawBatch7Override(rgba, w, id, opts = {}) {
  return drawBatch7(rgba, w, id, opts);
}
