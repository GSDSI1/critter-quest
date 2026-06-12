/**
 * Shape-based hand pixel-art library: quality grids per body plan, tinted from
 * each species' palette, with distinct backs, blink frames, and type accents.
 * Covers every species without a bespoke override (replaces old batch8–10
 * recolored-blob art).
 */
import { setPx, shade, rgbFromHex } from '../png-utils.mjs';

const OUTLINE = [26, 26, 46, 255];

const TYPE_ACCENTS = {
  flame: [255, 140, 50, 255],
  tide: [86, 199, 248, 255],
  leaf: [94, 232, 148, 255],
  volt: [255, 224, 71, 255],
  stone: [188, 182, 178, 255],
  shadow: [159, 112, 246, 255],
  ice: [196, 240, 255, 255],
  psychic: [254, 134, 192, 255],
};

function blitGrid(rgba, w, grid, palette, ox, oy, scale) {
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const col = palette[ch];
      if (!col) continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          setPx(rgba, w, ox + x * scale + sx, oy + y * scale + sy, col);
        }
      }
    }
  }
}

function paletteFor(hex, primaryType) {
  const rgb = rgbFromHex(hex);
  return {
    o: OUTLINE,
    b: [...rgb, 255],
    m: [...shade(rgb, -15), 255],
    d: [...shade(rgb, -42), 255],
    l: [...shade(rgb, 35), 255],
    h: [...shade(rgb, 60), 255],
    e: OUTLINE,
    w: [255, 255, 255, 255],
    a: TYPE_ACCENTS[primaryType] ?? [220, 220, 220, 255],
    A: [...shade(TYPE_ACCENTS[primaryType]?.slice(0, 3) ?? [200, 200, 200], -30), 255],
  };
}

// ── Blob: round body, big eyes, belly shading ──
const BLOB_FRONT = [
  '......aa........',
  '....oooooo......',
  '...obbllbbo.....',
  '..oblbbbbbbo....',
  '.obbbbbbbbbbo...',
  '.obwebbbbwebo...',
  'obbwebbbbwebbo..',
  'obbbbbddbbbbbo..',
  'obbbbbbbbbbbbo..',
  '.obmbbbbbbmbo...',
  '.obbmmmmmmbbo...',
  '..odbbbbbbdo....',
  '...oddddddo.....',
  '....oooooo......',
];
const BLOB_F2 = [
  '......aa........',
  '....oooooo......',
  '...obbllbbo.....',
  '..oblbbbbbbo....',
  '.obbbbbbbbbbo...',
  '.obddbbbbddbo...',
  'obbbbbbbbbbbbo..',
  'obbbbbddbbbbbo..',
  'obbbbbbbbbbbbo..',
  '.obmbbbbbbmbo...',
  '.obbmmmmmmbbo...',
  '..odbbbbbbdo....',
  '...oddddddo.....',
  '....oooooo......',
];
const BLOB_BACK = [
  '......aa........',
  '....oooooo......',
  '...obbllbbo.....',
  '..oblbbbbbbo....',
  '.obbbbbbbbbbo...',
  '.obbbddddbbbo...',
  'obbbdbbbbdbbbo..',
  'obbbdbbbbdbbbo..',
  'obbbbddddbbbbo..',
  '.obmbbbbbbmbo...',
  '.obbmmmmmmbbo...',
  '..odbbbbbbdo....',
  '...oddddddo.....',
  '....oooooo......',
];

// ── Quadruped: side profile, ears, tail, four legs ──
const QUAD_FRONT = [
  '..oa.....o......',
  '.obo....obo.....',
  '.obbo..obbbo....',
  '..obbbbbbllbo...',
  '..obbbbbblbo....',
  '..obwebbbbbo....',
  '...obbbddbo.....',
  '.oobbbbbbbboo...',
  'obbbbbbbbbbbbo..',
  'obbbbbbbbbbbmdo.',
  '.obmbbbbbbmbbdo.',
  '..obdo...obdo...',
  '..oddo...oddo...',
  '...oo.....oo....',
];
const QUAD_F2 = [
  '..oa.....o......',
  '.obo....obo.....',
  '.obbo..obbbo....',
  '..obbbbbbllbo...',
  '..obbbbbblbo....',
  '..obddbbbbbo....',
  '...obbbddbo.....',
  '.oobbbbbbbboo...',
  'obbbbbbbbbbbbo..',
  'obbbbbbbbbbbmdo.',
  '.obmbbbbbbmbbdo.',
  '..oddo...obdo...',
  '..obdo...oddo...',
  '...oo.....oo....',
];
const QUAD_BACK = [
  '.....oo..oo.....',
  '....obo..obo....',
  '...obbo..obbo...',
  '...obbbbbbbbo...',
  '...obbblllbbo...',
  '...obbbbbbbbo...',
  '..obbddbbddbbo..',
  '..obbbbbbbbbbo..',
  '..obbbbddbbbbo..',
  '..obmbbbbbbmbo..',
  '...obbbbbbbbo...',
  '...obdo..obdo...',
  '...oddo..oddo...',
  '....oo....oo....',
];

// ── Serpent: coiled body, raised head ──
const SERP_FRONT = [
  '.....ooooo......',
  '....obbllbo.....',
  '...obblbbbbo....',
  '...obwebbbbo....',
  '...obbbbddbo....',
  '....obbbbo......',
  '.....obbo.......',
  '...oobbbboo.....',
  '..obbbbbbbbo....',
  '.obbmoooobbbo...',
  '.obbo....obbo...',
  '.obbboooobbmo...',
  '..obbbbbbbbo....',
  '...oodddddo.....',
];
const SERP_F2 = [
  '.....ooooo......',
  '....obbllbo.....',
  '...obblbbbbo....',
  '...obddbbbbo....',
  '...obbbbddbo....',
  '....obbbbo......',
  '.....obbo.......',
  '...oobbbboo.....',
  '..obbbbbbbbo....',
  '.obbmoooobbbo...',
  '.obbo....obbo...',
  '.obbboooobbmo...',
  '..obbbbbbbbo....',
  '...oodddddo.....',
];
const SERP_BACK = [
  '.....ooooo......',
  '....obbllbo.....',
  '...obbbdbbbo....',
  '...obbdbdbbo....',
  '...obbbdbbbo....',
  '....obbbbo......',
  '.....obbo.......',
  '...oobbbboo.....',
  '..obbbbbbbbo....',
  '.obbmoooobbbo...',
  '.obbo....obbo...',
  '.obbboooobbmo...',
  '..obbbbbbbbo....',
  '...oodddddo.....',
];

// ── Avian: bird with wing, beak, tail feathers ──
const AVIAN_FRONT = [
  '.....ooo........',
  '....obbbo.......',
  '...oblbbboaa....',
  '...obwebbbo.....',
  '....obbbbdo.....',
  '..oobbbbbbo.....',
  '.obbbbbbbbbo....',
  'oblbbbbbbbbbo...',
  'obbllbbbbbbbo...',
  '.obbbbbbbbbo....',
  '..oobbbbbdo.....',
  '..aao.obdo......',
  '......odo.......',
  '.....oo.oo......',
];
const AVIAN_F2 = [
  '.....ooo........',
  '....obbbo.......',
  '...oblbbboaa....',
  '...obddbbbo.....',
  '....obbbbdo.....',
  '..oobbbbbbo.....',
  '.oblbbbbbbbo....',
  'obbllbbbbbbbo...',
  'oblbbbbbbbbbo...',
  '.obbbbbbbbbo....',
  '..oobbbbbdo.....',
  '..aa..obdo......',
  '......odo.......',
  '.....oo.oo......',
];
const AVIAN_BACK = [
  '.....ooo........',
  '....obbbo.......',
  '...obbbdbo......',
  '...obbdbbo......',
  '....obbbbo......',
  '..oobbbbbboo....',
  '.obblbbbblbbo...',
  'obbllbbbbllbbo..',
  'obblbbbbbblbbo..',
  '.obbbbbbbbbbo...',
  '..oobbbbbboo....',
  '....aobdoa......',
  '......odo.......',
  '.....oo.oo......',
];

// ── Humanoid: biped with arms ──
const HUM_FRONT = [
  '.....aa.........',
  '....oooooo......',
  '...obbllbbo.....',
  '...obwebweo.....',
  '...obbbbbbo.....',
  '....oddddo......',
  '..oobbbbbboo....',
  '.obobbbbbbobo...',
  '.obobbddbbobo...',
  '.odoobbbboodo...',
  '....obbbbo......',
  '....obo.obo.....',
  '...obdo.obdo....',
  '...oddo.oddo....',
];
const HUM_F2 = [
  '.....aa.........',
  '....oooooo......',
  '...obbllbbo.....',
  '...obddbddo.....',
  '...obbbbbbo.....',
  '....oddddo......',
  '..oobbbbbboo....',
  '.obobbbbbbobo...',
  '.obobbddbbobo...',
  '.odoobbbboodo...',
  '....obbbbo......',
  '....obo.obo.....',
  '...obdo.obdo....',
  '...oddo.oddo....',
];
const HUM_BACK = [
  '.....aa.........',
  '....oooooo......',
  '...obblbbbo.....',
  '...obbdbbbo.....',
  '...obbbdbbo.....',
  '....oddddo......',
  '..oobbbbbboo....',
  '.obobddddbobo...',
  '.obobdbbdbobo...',
  '.odoobddbbodo...',
  '....obbbbo......',
  '....obo.obo.....',
  '...obdo.obdo....',
  '...oddo.oddo....',
];

// ── Crystalline: faceted gem creature ──
const CRYS_FRONT = [
  '.......oo.......',
  '......ohho......',
  '.....ohllho.....',
  '....ohlbblho....',
  '...oblbbbbllo...',
  '..obbbwebbbbo...',
  '..obbbwebbbbo...',
  '..oblbbbbbblo...',
  '..obbbddbbbbo...',
  '...obbbbbbdo....',
  '....odbbbdo.....',
  '.....odbdo......',
  '......odo.......',
  '.......o........',
];
const CRYS_F2 = [
  '.......oo.......',
  '......ohho......',
  '.....ohllho.....',
  '....ohlbblho....',
  '...oblbbbbllo...',
  '..obbbddbbbbo...',
  '..obbbbbbbbbo...',
  '..oblbbbbbblo...',
  '..obbbddbbbbo...',
  '...obbbbbbdo....',
  '....odbbbdo.....',
  '.....odbdo......',
  '......odo.......',
  '.......o........',
];
const CRYS_BACK = [
  '.......oo.......',
  '......ohho......',
  '.....ohllho.....',
  '....ohlbblho....',
  '...oblbdbbllo...',
  '..obbbdbdbbbo...',
  '..obbdbbbdbbo...',
  '..oblbdbdbblo...',
  '..obbbbdbbbbo...',
  '...obbbbbbdo....',
  '....odbbbdo.....',
  '.....odbdo......',
  '......odo.......',
  '.......o........',
];

const SHAPES = {
  blob: { front: BLOB_FRONT, f2: BLOB_F2, back: BLOB_BACK },
  quadruped: { front: QUAD_FRONT, f2: QUAD_F2, back: QUAD_BACK },
  serpent: { front: SERP_FRONT, f2: SERP_F2, back: SERP_BACK },
  avian: { front: AVIAN_FRONT, f2: AVIAN_F2, back: AVIAN_BACK },
  humanoid: { front: HUM_FRONT, f2: HUM_F2, back: HUM_BACK },
  crystalline: { front: CRYS_FRONT, f2: CRYS_F2, back: CRYS_BACK },
};

/** Deterministic species hash for small per-species variation. */
function hash(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function drawShapeArt(rgba, w, def, { frame = 0, back = false } = {}) {
  const { id, color, shape, types } = def;
  const spec = SHAPES[shape] ?? SHAPES.blob;
  const pal = paletteFor(color, types?.[0]);
  const scale = Math.max(1, Math.floor(w / 32));
  const gridW = 16 * scale;
  const seed = hash(id ?? 'x');
  const jx = (seed % 3) - 1;
  const ox = Math.floor((w - gridW) / 2) + jx * scale;
  const oy = Math.floor((w - 14 * scale) / 2) + (frame ? scale : 0);
  const grid = back ? spec.back : (frame ? spec.f2 : spec.front);
  blitGrid(rgba, w, grid, pal, ox, oy, scale);

  // Secondary-type accent: small mark on the body, deterministic position.
  if (!back && types?.[1]) {
    const c = TYPE_ACCENTS[types[1]];
    if (c) {
      const px = ox + (6 + (seed % 4)) * scale;
      const py = oy + 9 * scale;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale * 2; dx++) {
          setPx(rgba, w, px + dx, py + dy, c);
        }
      }
    }
  }
  return true;
}
