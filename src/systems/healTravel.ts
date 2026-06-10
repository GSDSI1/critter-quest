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

export function listFastTravelDestinations(): { id: string; label: string }[] {
  return GameState.player.visitedHealCenters
    .filter(id => HEAL_HUBS[id])
    .map(id => ({ id, label: HEAL_HUBS[id] }));
}

/** Spawn coords on the city map near its heal door. */
export const HEAL_RETURN_SPAWN: Record<string, { x: number; y: number }> = {
  town: { x: 8, y: 6 },
  mossgrove: { x: 8, y: 8 },
  ember_city: { x: 10, y: 8 },
  frostvale: { x: 10, y: 8 },
  mindspire: { x: 8, y: 8 },
};
