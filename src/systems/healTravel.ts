import { hasBadge } from '../data/badges';
import { GameState } from './stats';

/** City map IDs that link to a heal center (used as fast-travel keys). */
export const HEAL_HUBS: Record<string, string> = {
  town: 'Verdant Town',
  mossgrove: 'Mossgrove',
  ember_city: 'Ember City',
  frostvale: 'Frostvale',
  mindspire: 'Mindspire',
};

export function registerHealVisit(fromCityMapId: string): void {
  if (!HEAL_HUBS[fromCityMapId]) return;
  if (!GameState.player.visitedHealCenters.includes(fromCityMapId)) {
    GameState.player.visitedHealCenters.push(fromCityMapId);
  }
}

export function canFastTravel(): boolean {
  return GameState.player.badges.includes('frost');
}

export interface FastTravelDest {
  id: string;
  label: string;
  mapId: string;
  x: number;
  y: number;
}

const MINIGAME_TRAVEL: { id: string; label: string; mapId: string; x: number; y: number; unlocked: () => boolean }[] = [
  {
    id: 'travel_pier', label: '★ Fishing Pier', mapId: 'fishing_pier', x: 7, y: 10,
    unlocked: () => hasBadge(GameState.player.badges, 'verdant')
      || GameState.player.visitedMaps.includes('route3'),
  },
  {
    id: 'travel_grove', label: '★ Secret Grove', mapId: 'secret_grove', x: 10, y: 14,
    unlocked: () => GameState.player.storyFlags.champion
      || (hasBadge(GameState.player.badges, 'verdant') && hasBadge(GameState.player.badges, 'ember')),
  },
  {
    id: 'travel_contest', label: '★ Contest Hall', mapId: 'contest_hall', x: 7, y: 10,
    unlocked: () => hasBadge(GameState.player.badges, 'frost')
      || GameState.player.visitedMaps.includes('frostvale'),
  },
];

export function listFastTravelDestinations(): FastTravelDest[] {
  const hubs = GameState.player.visitedHealCenters
    .filter(id => HEAL_HUBS[id])
    .map(id => {
      const spawn = HEAL_RETURN_SPAWN[id] ?? { x: 10, y: 10 };
      return { id, label: HEAL_HUBS[id], mapId: id, x: spawn.x, y: spawn.y };
    });
  const minigames = MINIGAME_TRAVEL
    .filter(m => m.unlocked())
    .map(m => ({ id: m.id, label: m.label, mapId: m.mapId, x: m.x, y: m.y }));
  return [...hubs, ...minigames];
}

/** Spawn coords on the city map near its heal door. */
export const HEAL_RETURN_SPAWN: Record<string, { x: number; y: number }> = {
  town: { x: 8, y: 6 },
  mossgrove: { x: 8, y: 8 },
  ember_city: { x: 10, y: 8 },
  frostvale: { x: 10, y: 8 },
  mindspire: { x: 8, y: 8 },
};
