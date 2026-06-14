/**
 * Hand-authored pixel art for psychic/ice mid-late routes (batch 11).
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
    e: EYE, w: WHITE, p: [244, 114, 182, 255], f: [224, 242, 254, 255],
  };
}

function blinkGrid(grid) { return grid.map(r => r.replace(/Ye/g, 'dd').replace(/we/g, 'dd')); }
function backGrid(grid) { return grid.map(r => r.replace(/Ye/g, 'BB').replace(/we/g, 'BB')); }

const BLOB = [
  '................................',
  '...........bbbb.................',
  '..........bBBBBb................',
  '.........bBYeBBb................',
  '.........bBBBBb.................',
  '..........bBBb..................',
  '.........b....b.................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const QUAD = [
  '................................',
  '................................',
  '...........bbbb.................',
  '..........bBBBBb................',
  '.........bBYeBBb................',
  '.........bBBBBb.................',
  '..........bBBb..................',
  '.........bd..db.................',
  '........bd....db................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const HORN = [
  '................................',
  '...........b....................',
  '..........bBb...................',
  '.........bBBBb..................',
  '........bBYeBBb.................',
  '........bBBBBb..................',
  '.........bBBb...................',
  '........bd..db..................',
  '.......bd....db.................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const WING = [
  '................................',
  '......bbbbbb....................',
  '.....bBBBBBb....................',
  '....bBYeBBb.....................',
  '.....bBBBBb.....................',
  '......bBBb......................',
  '.......bb.......................',
  '......b..b......................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const GRIDS = {
  cerebrain: { front: BLOB, f2: blinkGrid(BLOB), back: backGrid(BLOB), color: 0xec4899, ox: 8, oy: 10 },
  psychora: { front: BLOB, f2: blinkGrid(BLOB), back: backGrid(BLOB), color: 0xa855f7, ox: 8, oy: 10 },
  stormhorn: { front: HORN, f2: blinkGrid(HORN), back: backGrid(HORN), color: 0xfbbf24, ox: 6, oy: 10 },
  psychoglow: { front: BLOB, f2: blinkGrid(BLOB), back: backGrid(BLOB), color: 0xe879f9, ox: 8, oy: 10 },
  somnara: { front: BLOB, f2: blinkGrid(BLOB), back: backGrid(BLOB), color: 0x8b5cf6, ox: 8, oy: 8 },
  psyknight: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xf9a8d4, ox: 6, oy: 10 },
  snowpuff: { front: BLOB, f2: blinkGrid(BLOB), back: backGrid(BLOB), color: 0xe0f2fe, ox: 8, oy: 10 },
  glacetail: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0x22d3ee, ox: 6, oy: 10 },
  glaciara: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xbae6fd, ox: 6, oy: 10 },
  aurorabit: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xf0abfc, ox: 6, oy: 10 },
};

function drawBatch11(rgba, w, id, { frame = 0, back = false } = {}) {
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

export const BATCH11_SPECIES = Object.keys(GRIDS);
export function drawBatch11Override(rgba, w, id, opts = {}) { return drawBatch11(rgba, w, id, opts); }
