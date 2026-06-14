/**
 * Hand-authored pixel art for batch-5 species (volt line + gleamfin).
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
    y: [255, 220, 80, 255],
    p: [244, 114, 182, 255],
    t: [56, 189, 248, 255],
  };
}

const VOLTCHICK_FRONT = [
  '................................',
  '................................',
  '............bbbb................',
  '...........bBBYeBBb.............',
  '..........bBBeeBBBb.............',
  '..........bBBBBBBBb.............',
  '...........bBddBBb..............',
  '............bBBBBb..............',
  '...........bdddddb..............',
  '..........bd.....db.............',
  '.........bd.......db............',
  '........bd.........db...........',
  '.......bdo.........odb..........',
  '................................',
];

const VOLTAIL_FRONT = [
  '................................',
  '...........yyyy.................',
  '..........yBBBBBy...............',
  '.........yBBBBBBBy..............',
  '........bBBYeBBYeBBb............',
  '.......bBBBBBBBBBBBb............',
  '........bBBddBBddBb.............',
  '.........bBBBBBBb...............',
  '..........bBBBBb................',
  '.........bdddddb................',
  '........bd......db..............',
  '.......bd........db.............',
  '......bd..........db............',
  '.....bdo..........odb...........',
];

const GLEAMFIN_FRONT = [
  '................................',
  '................................',
  '...........tttt.................',
  '..........tBBBBt................',
  '.........tBBppBBt...............',
  '........tBBBBBBBBt..............',
  '.......tBBddBBddBt..............',
  '........tBBBBBBt................',
  '.........tBBBBt.................',
  '........tBttBBt.................',
  '.......tB....Bt.................',
  '......tB......Bt................',
  '.....tBo......oBt...............',
  '................................',
];

function blinkGrid(grid) {
  return grid.map(row => row.replace(/Ye/g, 'dd').replace(/we/g, 'dd'));
}

const GRIDS = {
  voltchick: { front: VOLTCHICK_FRONT, f2: blinkGrid(VOLTCHICK_FRONT), back: VOLTCHICK_FRONT, color: 0xfacc15, ox: 8, oy: 10 },
  voltail: { front: VOLTAIL_FRONT, f2: blinkGrid(VOLTAIL_FRONT), back: VOLTCHICK_FRONT, color: 0xeab308, ox: 6, oy: 8 },
  gleamfin: { front: GLEAMFIN_FRONT, f2: blinkGrid(GLEAMFIN_FRONT), back: GLEAMFIN_FRONT, color: 0x38bdf8, ox: 8, oy: 10 },
};

function drawBatch5(rgba, w, id, { frame = 0, back = false } = {}) {
  const spec = GRIDS[id];
  if (!spec) return false;
  const pal = paletteFromHex(spec.color);
  pal.y = [255, 220, 80, 255];
  pal.p = [244, 114, 182, 255];
  pal.t = [56, 189, 248, 255];
  const scale = w / 64;
  const gridScale = scale * 2;
  const ox = Math.floor(spec.ox * scale);
  const oy = Math.floor((spec.oy + (frame ? 1 : 0)) * scale);
  const grid = back ? spec.back : (frame ? spec.f2 : spec.front);
  blitGrid(rgba, w, grid, pal, ox, oy, gridScale);
  return true;
}

export const BATCH5_SPECIES = Object.keys(GRIDS);

export function drawBatch5Override(rgba, w, id, opts = {}) {
  return drawBatch5(rgba, w, id, opts);
}
