/**
 * PNG player trainer sprites (4 presets × 4 dirs × 2 frames + back).
 */
import { writePng, setPx, fillRect, fillCircle, shade, rgbFromHex } from '../png-utils.mjs';
import { join } from 'path';

const PRESETS = {
  scout: { body: 0x3b82f6, accent: 0x1d4ed8, skin: 0xfcd9b6, hair: 0x422006, hat: 0x166534 },
  ranger: { body: 0x15803d, accent: 0x14532d, skin: 0xfcd9b6, hair: 0x1c1917, hat: 0x422006 },
  scholar: { body: 0x6366f1, accent: 0x4338ca, skin: 0xfcd9b6, hair: 0x0f172a },
  ace: { body: 0xdc2626, accent: 0x991b1b, skin: 0xfcd9b6, hair: 0x171717, hat: 0x1e293b },
};

function drawWalkFrame(rgba, w, preset, dir, frame) {
  const body = rgbFromHex(preset.body);
  const accent = rgbFromHex(preset.accent);
  const skin = rgbFromHex(preset.skin);
  const hair = rgbFromHex(preset.hair);
  const leg = frame === 1 ? 1 : 0;
  fillRect(rgba, w, w, 2, 5, 12, 11, [15, 23, 42, 255]);
  fillRect(rgba, w, w, 3, 7, 10, 8, [...accent, 255]);
  fillRect(rgba, w, w, 4, 6, 8, 7, [...body, 255]);
  fillCircle(rgba, w, w, 8, 5, 4, [...skin, 255]);
  fillCircle(rgba, w, w, 8, 4, 4, [...hair, 255]);
  if (preset.hat !== undefined) {
    fillRect(rgba, w, w, 5, 2, 6, 3, [...rgbFromHex(preset.hat), 255]);
  }
  if (dir === 'down') {
    setPx(rgba, w, 6, 4, [26, 26, 46, 255]);
    setPx(rgba, w, 9, 4, [26, 26, 46, 255]);
  } else if (dir === 'left') {
    setPx(rgba, w, 5, 4, [26, 26, 46, 255]);
  } else if (dir === 'right') {
    setPx(rgba, w, 9, 4, [26, 26, 46, 255]);
  }
  fillRect(rgba, w, w, 5 + leg, 13, 3, 3, [...shade(accent, -20), 255]);
  fillRect(rgba, w, w, 9 - leg, 13, 3, 3, [...shade(accent, -20), 255]);
}

function drawBack(rgba, w, preset) {
  const body = rgbFromHex(preset.body);
  const accent = rgbFromHex(preset.accent);
  const hair = rgbFromHex(preset.hair);
  const s = w;
  fillRect(rgba, w, w, 4, 8, s - 8, s - 10, [15, 23, 42, 255]);
  fillRect(rgba, w, w, 6, 12, s - 12, s - 16, [...body, 255]);
  fillRect(rgba, w, w, 8, 14, s - 16, 6, [...accent, 255]);
  fillCircle(rgba, w, w, s / 2, 10, 7, [...hair, 255]);
  if (preset.hat !== undefined) {
    fillRect(rgba, w, w, 10, 3, 12, 5, [...rgbFromHex(preset.hat), 255]);
  }
  fillRect(rgba, w, w, 10, s - 8, 5, 6, [...accent, 255]);
  fillRect(rgba, w, w, s - 15, s - 8, 5, 6, [...accent, 255]);
}

export function generatePlayerPngs(outDir) {
  for (const [id, preset] of Object.entries(PRESETS)) {
    for (const dir of ['down', 'up', 'left', 'right']) {
      for (let frame = 0; frame < 2; frame++) {
        const rgba = Buffer.alloc(16 * 16 * 4, 0);
        drawWalkFrame(rgba, 16, preset, dir, frame);
        writePng(join(outDir, `${id}_${dir}_${frame}.png`), 16, 16, rgba);
      }
    }
    const back = Buffer.alloc(32 * 32 * 4, 0);
    drawBack(back, 32, preset);
    writePng(join(outDir, `${id}_back.png`), 32, 32, back);
  }
}

export const PLAYER_PRESET_IDS = Object.keys(PRESETS);
