import { hasBadge } from '../data/badges';
import type { GameMap } from '../data/maps';

type WarpTile = GameMap['warps'][number];

/** True when the player may step through this warp tile. */
export function warpGateAllowed(
  warp: WarpTile,
  badges: string[],
  storyFlags: Record<string, boolean>,
): boolean {
  if (warp.requiresBadge && !hasBadge(badges, warp.requiresBadge)) return false;
  if (warp.requiresAllBadges?.length) {
    const badgesOk = warp.requiresAllBadges.every(b => hasBadge(badges, b));
    if (!storyFlags.champion && !badgesOk) return false;
  }
  if (warp.requiresFlag && !storyFlags[warp.requiresFlag]) return false;
  return true;
}
