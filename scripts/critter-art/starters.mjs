/**
 * Hand-authored pixel art for starter species (emberpup, aqualet, leafkit).
 * Drawn on a 32×32 logical grid, scaled to output size.
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
    f: [255, 120, 40, 255],
    y: [255, 220, 80, 255],
    g: [74, 222, 128, 255],
    t: [56, 189, 248, 255],
    a: [186, 230, 253, 255],
  };
}

const EMBERPUP_FRONT = [
  '................................',
  '............ffff................',
  '..........ffyyBBff..............',
  '.........fBBBBBBBBf.............',
  '........fBBBeBBBeBBf............',
  '........fBBBBBBBBBBf............',
  '.........fBBddBBddBf............',
  '..........fBBBBBBBf.............',
  '...........fBBBBBf..............',
  '..........fdddddddf.............',
  '.........fdd....ddf.............',
  '........fdd......ddf............',
  '.......fdd........ddf...........',
  '......fdd..........ddf..........',
  '.....fdd............ddf.........',
  '......ff............ff..........',
  '................................',
];

const EMBERPUP_FRONT_F2 = [
  '................................',
  '............ffff................',
  '..........ffBBBBff..............',
  '.........fBBBBBBBBf.............',
  '........fBBBeBBBeBBf............',
  '........fBBBBBBBBBBf............',
  '.........fBBddBBddBf............',
  '..........fBBBBBBBf.............',
  '...........fBBBBBf..............',
  '..........fdddddddf.............',
  '.........fdd....ddf.............',
  '........fdd......ddf............',
  '.......fdd........ddf...........',
  '......fdd..........ddf..........',
  '.....fdd............ddf.........',
  '......ff............ff..........',
  '................................',
];

const EMBERPUP_BACK = [
  '................................',
  '............ffff................',
  '..........ffddddff..............',
  '.........fddddddddf.............',
  '........fddddddddddf............',
  '........fddddddddddf............',
  '.........fddddddddf.............',
  '..........fddddddf..............',
  '...........fddddf...............',
  '..........fBBBBBBBf.............',
  '.........fBB....BBf.............',
  '........fBB......BBf............',
  '.......fBB........BBf...........',
  '......fBB..........BBf..........',
  '.....fBB............BBf.........',
  '......ff............ff..........',
  '................................',
];

const AQUALET_FRONT = [
  '................................',
  '.............tttt...............',
  '............ttBBtt..............',
  '...........tBBBBBBt.............',
  '..........tBBBeBBBet............',
  '..........tBBBBBBBt.............',
  '.........tBBBddBBBt.............',
  '..........tBBBBBBt..............',
  '...........tBBBBt...............',
  '............tBBt................',
  '...........taaat................',
  '..........taaaaat...............',
  '.........taaaaaaat..............',
  '........taaaaaaaaat.............',
  '.........taaaaaat...............',
  '..........tttttt................',
  '................................',
];

const AQUALET_BACK = [
  '................................',
  '.............tttt...............',
  '............ttddtt..............',
  '...........tddddddt.............',
  '..........tdddddddt.............',
  '..........tdddddddt.............',
  '.........tddddddddt.............',
  '..........tdddddt...............',
  '...........tdddt................',
  '............tdt.................',
  '...........taaat................',
  '..........taaaaat...............',
  '.........taaaaaaat..............',
  '........taaaaaaaaat.............',
  '.........taaaaaat...............',
  '..........tttttt................',
  '................................',
];

const LEAFKIT_FRONT = [
  '................................',
  '...........gg..gg...............',
  '..........gBBBBBg...............',
  '.........gBBBeBBBg..............',
  '........gBBBBBBBBBg.............',
  '........gBBBddBBBg..............',
  '.........gBBBBBBg...............',
  '..........gBBBBg................',
  '...........gBBg.................',
  '..........gddddg................',
  '.........gdd..ddg...............',
  '........gdd....ddg..............',
  '.......gdd......ddg.............',
  '......gdd........ddg............',
  '.....gdd..........ddg...........',
  '......gg............gg..........',
  '................................',
];

const LEAFKIT_BACK = [
  '................................',
  '...........gg..gg...............',
  '..........gdddddg...............',
  '.........gdddddddg..............',
  '........gdddddddddg.............',
  '........gdddddddddg.............',
  '.........gdddddddg..............',
  '..........gddddg................',
  '...........gddg.................',
  '..........gBBBBg................',
  '.........gBB..BBg...............',
  '........gBB....BBg..............',
  '.......gBB......BBg.............',
  '......gBB........BBg............',
  '.....gBB..........BBg...........',
  '......gg............gg..........',
  '................................',
];

const FLAMEWYRM_FRONT = [
  '................................',
  '..............ffff..............',
  '............ffyyBBff............',
  '..........fBBBBBBBBf............',
  '........fBBBBBeBBBf.............',
  '......fBBBBBBBBBBBf.............',
  '....fBBBBBBBBBBBBBBf............',
  '..fBBBBBBBBBBBBBBBBBf...........',
  '.fBBBBBBBBBBBBBBBBBBBf..........',
  '..fBBBBBBBBBBBBBBBBBf...........',
  '....fBBBBBBBBBBBBBf.............',
  '......ffBBBBBBBBff..............',
  '........ffyyffff................',
  '................................',
];

const TIDEFIN_FRONT = [
  '................................',
  '.............tttt...............',
  '............ttBBtt..............',
  '..........tBBBBBBBt.............',
  '........tBBBBBeBBBt.............',
  '......tBBBBBBBBBBBt.............',
  '....tBBBBBBBBBBBBBBt............',
  '..tBBBBBBBBBBBBBBBBBt...........',
  '.tBBBBBBBBBBBBBBBBBBt...........',
  '..tBBBBBBBBBBBBBBBBt............',
  '....tBBBBBBBBBBBBt..............',
  '......tBBBBBBBBt................',
  '........taaaaat.................',
  '..........tttt..................',
  '................................',
];

const VINECLAW_FRONT = [
  '................................',
  '...........gg..gg...............',
  '..........gBBBBBg...............',
  '........gBBBBBeBBBg.............',
  '......gBBBBBBBBBBBg.............',
  '....gBBBBBBBBBBBBBBg............',
  '..gBBBBBBBBBBBBBBBBg............',
  '.gBBBBBBBBBBBBBBBBBg............',
  '..gBBBBBBBBBBBBBBg..............',
  '....gBBBBBBBBBg.................',
  '......gdddddg...................',
  '.......gdddg....................',
  '........gddg....................',
  '................................',
];

const GRIDS = {
  emberpup: {
    front: EMBERPUP_FRONT,
    f2: EMBERPUP_FRONT_F2,
    back: EMBERPUP_BACK,
    color: 0xff6b35,
    ox: 16,
    oy: 14,
  },
  aqualet: {
    front: AQUALET_FRONT,
    f2: AQUALET_FRONT,
    back: AQUALET_BACK,
    color: 0x3b82f6,
    ox: 16,
    oy: 12,
  },
  leafkit: {
    front: LEAFKIT_FRONT,
    f2: LEAFKIT_FRONT,
    back: LEAFKIT_BACK,
    color: 0x22c55e,
    ox: 16,
    oy: 12,
  },
  flamewyrm: {
    front: FLAMEWYRM_FRONT,
    f2: FLAMEWYRM_FRONT,
    back: EMBERPUP_BACK,
    color: 0xff4500,
    ox: 8,
    oy: 10,
  },
  tidefin: {
    front: TIDEFIN_FRONT,
    f2: TIDEFIN_FRONT,
    back: AQUALET_BACK,
    color: 0x1d4ed8,
    ox: 8,
    oy: 8,
  },
  vineclaw: {
    front: VINECLAW_FRONT,
    f2: VINECLAW_FRONT,
    back: LEAFKIT_BACK,
    color: 0x16a34a,
    ox: 8,
    oy: 10,
  },
};

function drawStarter(rgba, w, id, { frame = 0, back = false } = {}) {
  const spec = GRIDS[id];
  if (!spec) return false;
  const pal = paletteFromHex(spec.color);
  pal.f = [255, 140, 50, 255];
  pal.g = [34, 197, 94, 255];
  pal.t = [59, 130, 246, 255];
  pal.a = [147, 197, 253, 255];

  const scale = w / 64;
  const gridScale = scale * 2;
  const ox = Math.floor(spec.ox * scale);
  const oy = Math.floor((spec.oy + (frame ? 1 : 0)) * scale);
  const grid = back ? spec.back : (frame ? spec.f2 : spec.front);
  blitGrid(rgba, w, grid, pal, ox, oy, gridScale);
  return true;
}

export const STARTER_SPECIES = Object.keys(GRIDS);

export function drawStarterOverride(rgba, w, id, opts = {}) {
  return drawStarter(rgba, w, id, opts);
}
