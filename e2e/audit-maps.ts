/** Map spawn coords for visual audit teleports. */
export const AUDIT_MAPS: { id: string; x: number; y: number }[] = [
  { id: 'town', x: 12, y: 15 },
  { id: 'heal_center', x: 4, y: 7 },
  { id: 'mart', x: 4, y: 7 },
  { id: 'lab', x: 4, y: 7 },
  { id: 'route1', x: 12, y: 10 },
  { id: 'forest', x: 12, y: 10 },
  { id: 'route2', x: 12, y: 10 },
  { id: 'mossgrove', x: 12, y: 12 },
  { id: 'gym1', x: 6, y: 11 },
  { id: 'crystal_cave', x: 12, y: 12 },
  { id: 'route3', x: 12, y: 10 },
  { id: 'ember_city', x: 12, y: 12 },
  { id: 'gym2', x: 6, y: 11 },
  { id: 'volcanic_path', x: 12, y: 10 },
  { id: 'route4', x: 12, y: 10 },
  { id: 'glacier_pass', x: 12, y: 10 },
  { id: 'frostvale', x: 12, y: 12 },
  { id: 'gym3', x: 6, y: 11 },
  { id: 'route5', x: 12, y: 10 },
  { id: 'mindspire', x: 12, y: 12 },
  { id: 'gym4', x: 6, y: 11 },
  { id: 'victory_road', x: 12, y: 10 },
  { id: 'fishing_pier', x: 6, y: 8 },
  { id: 'secret_grove', x: 10, y: 10 },
  { id: 'contest_hall', x: 7, y: 10 },
];

/** Main story warp chain: source map + warp tile → expected destination. */
export type PlaythroughStep = {
  from: string;
  warpX: number;
  warpY: number;
  to: string;
  /** Badge or flag required before this warp works. */
  needs?: { badge?: string; flag?: string };
};

export const STORY_CHAIN: PlaythroughStep[] = [
  { from: 'town', warpX: 12, warpY: 0, to: 'route1' },
  { from: 'route1', warpX: 12, warpY: 0, to: 'forest' },
  { from: 'forest', warpX: 23, warpY: 10, to: 'route2' },
  { from: 'route2', warpX: 12, warpY: 0, to: 'mossgrove', needs: { flag: 'defeated_ranger' } },
  { from: 'mossgrove', warpX: 12, warpY: 0, to: 'route3', needs: { badge: 'verdant' } },
  { from: 'route3', warpX: 12, warpY: 0, to: 'ember_city' },
  { from: 'ember_city', warpX: 1, warpY: 10, to: 'route4', needs: { badge: 'ember' } },
  { from: 'route4', warpX: 12, warpY: 0, to: 'glacier_pass' },
  { from: 'glacier_pass', warpX: 12, warpY: 0, to: 'frostvale' },
  { from: 'frostvale', warpX: 12, warpY: 0, to: 'route5', needs: { badge: 'frost' } },
  { from: 'route5', warpX: 12, warpY: 0, to: 'mindspire' },
  { from: 'mindspire', warpX: 12, warpY: 0, to: 'victory_road', needs: { badge: 'psyche' } },
];

export const SIDE_MAPS: PlaythroughStep[] = [
  { from: 'town', warpX: 8, warpY: 6, to: 'heal_center' },
  { from: 'heal_center', warpX: 4, warpY: 8, to: 'town' },
  { from: 'town', warpX: 10, warpY: 6, to: 'mart' },
  { from: 'town', warpX: 14, warpY: 6, to: 'lab' },
  { from: 'route3', warpX: 8, warpY: 11, to: 'fishing_pier' },
  { from: 'frostvale', warpX: 14, warpY: 8, to: 'contest_hall' },
  { from: 'mossgrove', warpX: 16, warpY: 6, to: 'gym1' },
  { from: 'ember_city', warpX: 16, warpY: 6, to: 'gym2' },
  { from: 'frostvale', warpX: 16, warpY: 6, to: 'gym3' },
  { from: 'mindspire', warpX: 16, warpY: 6, to: 'gym4' },
  { from: 'ember_city', warpX: 12, warpY: 0, to: 'volcanic_path', needs: { badge: 'ember' } },
  { from: 'volcanic_path', warpX: 12, warpY: 0, to: 'crystal_cave' },
];
