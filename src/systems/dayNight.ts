/** Outdoor tint cycle from play time (seconds). Returns 0–1 day factor. */
export function dayFactor(playTimeSec: number): number {
  const cycle = 480; // 8 min full day/night
  const t = (playTimeSec % cycle) / cycle;
  return 0.5 + 0.5 * Math.cos(t * Math.PI * 2);
}

export function nightTintAlpha(playTimeSec: number): number {
  const day = dayFactor(playTimeSec);
  return Math.max(0, (0.55 - day) * 0.35);
}

export const OUTDOOR_MAP_PREFIXES = ['town', 'route', 'forest', 'mossgrove', 'ember', 'glacier', 'frostvale', 'mindspire', 'volcanic', 'victory_road'];

export function isOutdoorMap(mapId: string): boolean {
  return OUTDOOR_MAP_PREFIXES.some(p => mapId === p || mapId.startsWith(p));
}

/** True during the dimmest ~35% of the cycle (night window). */
export function isNight(playTimeSec: number): boolean {
  return dayFactor(playTimeSec) < 0.35;
}
