/** Region overview nodes for the pause-menu map (positions in 640×480 space). */
export interface RegionNode {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: 'town' | 'route' | 'gym' | 'dungeon';
  badge?: string;
  hub?: boolean;
}

export const REGION_NODES: RegionNode[] = [
  { id: 'town', label: 'Verdant Town', x: 72, y: 300, kind: 'town', hub: true },
  { id: 'route1', label: 'Route 1', x: 148, y: 300, kind: 'route' },
  { id: 'forest', label: 'Forest', x: 224, y: 300, kind: 'route' },
  { id: 'route2', label: 'Route 2', x: 300, y: 300, kind: 'route' },
  { id: 'mossgrove', label: 'Mossgrove', x: 376, y: 260, kind: 'town', badge: 'verdant', hub: true },
  { id: 'gym1', label: 'Gym 1', x: 376, y: 320, kind: 'gym', badge: 'verdant' },
  { id: 'gym2', label: 'Gym 2', x: 560, y: 300, kind: 'gym', badge: 'ember' },
  { id: 'crystal_cave', label: 'Crystal Cave', x: 452, y: 220, kind: 'dungeon' },
  { id: 'route3', label: 'Route 3', x: 452, y: 300, kind: 'route' },
  { id: 'fishing_pier', label: 'Fishing Pier', x: 420, y: 340, kind: 'route' },
  { id: 'ember_city', label: 'Ember City', x: 528, y: 260, kind: 'town', badge: 'ember', hub: true },
  { id: 'volcanic_path', label: 'Volcanic Path', x: 528, y: 340, kind: 'route' },
  { id: 'route4', label: 'Route 4', x: 300, y: 180, kind: 'route' },
  { id: 'glacier_pass', label: 'Glacier Pass', x: 376, y: 140, kind: 'route' },
  { id: 'frostvale', label: 'Frostvale', x: 452, y: 100, kind: 'town', badge: 'frost', hub: true },
  { id: 'contest_hall', label: 'Contest Hall', x: 480, y: 130, kind: 'route' },
  { id: 'gym3', label: 'Gym 3', x: 420, y: 80, kind: 'gym', badge: 'frost' },
  { id: 'route5', label: 'Route 5', x: 528, y: 100, kind: 'route' },
  { id: 'mindspire', label: 'Mindspire', x: 568, y: 160, kind: 'town', badge: 'psyche', hub: true },
  { id: 'gym4', label: 'Gym 4', x: 600, y: 180, kind: 'gym', badge: 'psyche' },
  { id: 'secret_grove', label: 'Secret Grove', x: 260, y: 260, kind: 'dungeon' },
  { id: 'victory_road', label: 'Victory Road', x: 568, y: 60, kind: 'dungeon', badge: 'psyche' },
];

export const REGION_LINKS: [string, string][] = [
  ['town', 'route1'], ['route1', 'forest'], ['forest', 'route2'], ['route2', 'mossgrove'],
  ['mossgrove', 'gym1'], ['mossgrove', 'crystal_cave'], ['mossgrove', 'route3'],
  ['route3', 'fishing_pier'], ['route3', 'ember_city'], ['ember_city', 'gym2'],
  ['ember_city', 'volcanic_path'], ['route3', 'route4'],
  ['forest', 'secret_grove'],
  ['route4', 'glacier_pass'], ['glacier_pass', 'frostvale'], ['frostvale', 'contest_hall'],
  ['frostvale', 'gym3'], ['frostvale', 'route5'],
  ['route5', 'mindspire'], ['mindspire', 'gym4'], ['mindspire', 'victory_road'],
];

export function regionNode(mapId: string): RegionNode | undefined {
  return REGION_NODES.find(n => n.id === mapId || mapId.startsWith(n.id));
}
