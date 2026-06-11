import { hasBadge } from '../data/badges';
import type { PlayerState } from './stats';

export type RegionVisibility = 'hidden' | 'hinted' | 'known';

const MINIGAME_NODES = new Set(['fishing_pier', 'secret_grove', 'contest_hall']);

export function isMinigameMap(mapId: string): boolean {
  return MINIGAME_NODES.has(mapId);
}

/** Whether a region-map node is fully known (visited or player is there). */
export function regionNodeVisibility(nodeId: string, player: PlayerState, hereMapId: string): RegionVisibility {
  if (hereMapId === nodeId || player.visitedMaps.includes(nodeId)) return 'known';

  if (nodeId === 'fishing_pier') {
    if (hasBadge(player.badges, 'verdant') || player.visitedMaps.includes('route3')) return 'hinted';
  }
  if (nodeId === 'secret_grove') {
    const badgesOk = hasBadge(player.badges, 'verdant') && hasBadge(player.badges, 'ember');
    if (player.storyFlags.champion || badgesOk) return 'hinted';
  }
  if (nodeId === 'contest_hall') {
    if (hasBadge(player.badges, 'frost') || player.visitedMaps.includes('frostvale')) return 'hinted';
  }

  return 'hidden';
}

export function momDiscoverabilityLine(player: PlayerState): string | null {
  if (player.storyFlags.champion) return null;
  if (hasBadge(player.badges, 'frost') && !player.visitedMaps.includes('contest_hall')) {
    return 'Frostvale has a Contest Hall — show off your partner!';
  }
  if (hasBadge(player.badges, 'verdant') && hasBadge(player.badges, 'ember') && !player.visitedMaps.includes('secret_grove')) {
    return 'Rumors say a Secret Grove hides in Verdant Forest.';
  }
  if (hasBadge(player.badges, 'verdant') && !player.visitedMaps.includes('fishing_pier')) {
    return 'Try the Fishing Pier off Route 3 — bring an Old Rod!';
  }
  return null;
}

export function profDiscoverabilityLine(player: PlayerState): string | null {
  if (hasBadge(player.badges, 'ember') && !player.visitedMaps.includes('fishing_pier')) {
    return 'Field researchers fish Route 3\'s pier for tide species.';
  }
  if (hasBadge(player.badges, 'frost') && !player.visitedMaps.includes('contest_hall')) {
    return 'The Frostvale Contest Hall tests beauty and battle stats.';
  }
  return null;
}
