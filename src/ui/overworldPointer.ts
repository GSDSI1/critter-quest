import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../data/types';

export const OVERWORLD_PAD = {
  cx: GAME_WIDTH - 72,
  cy: GAME_HEIGHT - 88,
  radius: 72,
  gap: 46,
} as const;

const TALK_BTN = { cx: 72, cy: GAME_HEIGHT - 52, w: 72, h: 40 };
const MENU_BTN = { cx: 152, cy: GAME_HEIGHT - 52, w: 72, h: 40 };

export type OverworldPointerAction =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'talk' }
  | { type: 'menu' }
  | { type: 'walk'; tx: number; ty: number };

function inRect(px: number, py: number, cx: number, cy: number, w: number, h: number): boolean {
  return px >= cx - w / 2 && px <= cx + w / 2 && py >= cy - h / 2 && py <= cy + h / 2;
}

/** Map screen pointer to D-pad / action buttons / walk target. */
export function resolveOverworldPointer(
  scene: Phaser.Scene,
  pointer: Phaser.Input.Pointer,
): OverworldPointerAction | null {
  const px = pointer.x;
  const py = pointer.y;

  const { cx, cy, radius, gap } = OVERWORLD_PAD;
  if (Math.hypot(px - cx, py - cy) <= radius) {
    const relX = px - cx;
    const relY = py - cy;
    if (Math.abs(relX) > Math.abs(relY)) {
      return { type: 'move', dx: relX > 0 ? 1 : -1, dy: 0 };
    }
    return { type: 'move', dx: 0, dy: relY > 0 ? 1 : -1 };
  }

  if (inRect(px, py, TALK_BTN.cx, TALK_BTN.cy, TALK_BTN.w, TALK_BTN.h)) {
    return { type: 'talk' };
  }
  if (inRect(px, py, MENU_BTN.cx, MENU_BTN.cy, MENU_BTN.w, MENU_BTN.h)) {
    return { type: 'menu' };
  }

  const world = scene.cameras.main.getWorldPoint(px, py);
  const tx = Math.floor(world.x / TILE_SIZE);
  const ty = Math.floor(world.y / TILE_SIZE);
  return { type: 'walk', tx, ty };
}

/** One tile step toward a clicked map cell. */
export function stepTowardTile(
  px: number,
  py: number,
  tx: number,
  ty: number,
): { dx: number; dy: number } | null {
  const dxRaw = tx - px;
  const dyRaw = ty - py;
  if (dxRaw === 0 && dyRaw === 0) return null;
  if (Math.abs(dxRaw) >= Math.abs(dyRaw)) {
    return { dx: dxRaw > 0 ? 1 : -1, dy: 0 };
  }
  return { dx: 0, dy: dyRaw > 0 ? 1 : -1 };
}
