import { describe, it, expect } from 'vitest';
import { findPath, npcBlockedTiles } from '../walkPath';
import { town } from '../../data/maps/town';

describe('findPath', () => {
  it('returns empty path when already at goal', () => {
    expect(findPath(town, 10, 13, 10, 13)).toEqual([]);
  });

  it('finds a path around obstacles', () => {
    const path = findPath(town, 10, 13, 12, 13, npcBlockedTiles(town));
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path!.at(-1)).toEqual({ x: 12, y: 13 });
  });

  it('returns null for unreachable tiles', () => {
    expect(findPath(town, 10, 13, 0, 0)).toBeNull();
  });
});
