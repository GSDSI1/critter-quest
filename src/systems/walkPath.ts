import { getTile, isWalkable, type GameMap } from '../data/maps';

export interface TileCoord {
  x: number;
  y: number;
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

/** BFS path from start to goal on walkable tiles. Returns steps excluding start. */
export function findPath(
  map: GameMap,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  blockedTiles: Iterable<TileCoord> = [],
): TileCoord[] | null {
  if (fromX === toX && fromY === toY) return [];

  const blocked = new Set<string>();
  for (const t of blockedTiles) blocked.add(tileKey(t.x, t.y));

  const canStand = (x: number, y: number, isGoal: boolean): boolean => {
    if (!isWalkable(getTile(map, x, y))) return false;
    if (!isGoal && blocked.has(tileKey(x, y))) return false;
    if (isGoal && blocked.has(tileKey(x, y))) return false;
    return true;
  };

  if (!canStand(toX, toY, true)) return null;

  const startKey = tileKey(fromX, fromY);
  const goalKey = tileKey(toX, toY);
  const queue: TileCoord[] = [{ x: fromX, y: fromY }];
  const cameFrom = new Map<string, string>();
  cameFrom.set(startKey, '');

  const dirs = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curKey = tileKey(cur.x, cur.y);
    if (curKey === goalKey) break;

    for (const { dx, dy } of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nk = tileKey(nx, ny);
      if (cameFrom.has(nk)) continue;
      const isGoal = nk === goalKey;
      if (!canStand(nx, ny, isGoal)) continue;
      cameFrom.set(nk, curKey);
      queue.push({ x: nx, y: ny });
    }
  }

  if (!cameFrom.has(goalKey)) return null;

  const path: TileCoord[] = [];
  let k = goalKey;
  while (k && k !== startKey) {
    const [xs, ys] = k.split(',');
    path.unshift({ x: Number(xs), y: Number(ys) });
    k = cameFrom.get(k) ?? '';
  }
  return path;
}

/** NPC-occupied tiles for pathfinding (exclude signs). */
export function npcBlockedTiles(map: GameMap): TileCoord[] {
  return map.npcs
    .filter(n => n.role !== 'sign' && !n.id.startsWith('sign'))
    .map(n => ({ x: n.x, y: n.y }));
}
