import { hasBadge } from '../data/badges';
import type { MapNpc } from '../data/maps';
import { GameState } from './stats';

export function gateOpen(npc: MapNpc): boolean {
  const g = npc.gate;
  if (!g) return true;
  if (g.requiresBadge && !hasBadge(GameState.player.badges, g.requiresBadge)) return false;
  if (g.requiresFlag && !GameState.player.storyFlags[g.requiresFlag]) return false;
  return true;
}
