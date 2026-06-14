/**
 * Hand-authored pixel art for volcanic/cave/endgame species (batch 12).
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

function paletteFromHex(hex, extras = {}) {
  const rgb = rgbFromHex(hex);
  return {
    o: OUTLINE, b: [...rgb, 255], d: [...shade(rgb, -40), 255],
    l: [...shade(rgb, 35), 255], h: [...shade(rgb, 55), 255],
    e: EYE, w: WHITE, r: [248, 113, 113, 255], v: [196, 181, 253, 255],
    ...extras,
  };
}

function blinkGrid(grid) { return grid.map(r => r.replace(/Ye/g, 'dd').replace(/we/g, 'dd')); }
function backGrid(grid) { return grid.map(r => r.replace(/Ye/g, 'BB').replace(/we/g, 'BB')); }

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

const BULK = [
  '................................',
  '................................',
  '........bbbbbbbb................',
  '.......bBBBBBBBBb...............',
  '......bBBYeBBBBBb...............',
  '......bBBBBBBBBb................',
  '.......bBBBBBBb.................',
  '........bBBddBBb................',
  '.........bdd..ddb...............',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const CRYST = [
  '................................',
  '...........vvv..................',
  '..........vBBv..................',
  '.........vBYeBv.................',
  '........vBBBBBv.................',
  '.........vBBv...................',
  '..........v.....................',
  '.........v..v...................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const SERP = [
  '................................',
  '................................',
  '.............rrr................',
  '............rBBBr.................',
  '...........rBYeBr...............',
  '..........rBBBBr................',
  '.........rBBBr..................',
  '........rBBr....................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const GRIDS = {
  cavemaw: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0x57534e, ox: 6, oy: 10 },
  geodeon: { front: CRYST, f2: blinkGrid(CRYST), back: backGrid(CRYST), color: 0xa8a29e, ox: 8, oy: 10, palExtra: { v: [168, 162, 158, 255] } },
  coalemb: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0x44403c, ox: 8, oy: 10 },
  ashpuff: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xf97316, ox: 8, oy: 10 },
  emberlord: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xb91c1c, ox: 6, oy: 8 },
  embershell: { front: BULK, f2: blinkGrid(BULK), back: backGrid(BULK), color: 0x78716c, ox: 2, oy: 8 },
  scorchmane: { front: QUAD, f2: blinkGrid(QUAD), back: backGrid(QUAD), color: 0xdc2626, ox: 4, oy: 8 },
  chillbite: { front: SERP, f2: blinkGrid(SERP), back: backGrid(SERP), color: 0x1e3a5f, ox: 2, oy: 8, palExtra: { r: [30, 58, 95, 255] } },
  glaciorex: { front: CRYST, f2: blinkGrid(CRYST), back: backGrid(CRYST), color: 0x38bdf8, ox: 8, oy: 10 },
  zenolith: { front: CRYST, f2: blinkGrid(CRYST), back: backGrid(CRYST), color: 0xd946ef, ox: 8, oy: 10 },
};

function drawBatch12(rgba, w, id, { frame = 0, back = false } = {}) {
  const spec = GRIDS[id];
  if (!spec) return false;
  const pal = paletteFromHex(spec.color, spec.palExtra ?? {});
  const scale = w / 64;
  const gridScale = scale * 2;
  const ox = Math.floor(spec.ox * scale);
  const oy = Math.floor((spec.oy + (frame ? 1 : 0)) * scale);
  const grid = back ? spec.back : (frame ? spec.f2 : spec.front);
  blitGrid(rgba, w, grid, pal, ox, oy, gridScale);
  return true;
}

export const BATCH12_SPECIES = Object.keys(GRIDS);
export function drawBatch12Override(rgba, w, id, opts = {}) { return drawBatch12(rgba, w, id, opts); }
