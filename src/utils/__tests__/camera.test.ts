import { describe, it, expect } from 'vitest';
import type Phaser from 'phaser';
import { clampOverworldCamera, computeOverworldZoom } from '../camera';
import type { GameMap } from '../../data/maps';

const townLike: GameMap = {
  id: 'town',
  name: 'Town',
  width: 24,
  height: 18,
  spawn: { x: 12, y: 9 },
  encounterRate: 0,
  warps: [],
  npcs: [],
  tiles: [],
};

describe('clampOverworldCamera', () => {
  it('clamps scroll when viewport extends past map bottom', () => {
    const cam = { zoom: 2, scrollX: 0, scrollY: 200 };
    clampOverworldCamera(cam as Phaser.Cameras.Scene2D.Camera, townLike);
    expect(cam.scrollY).toBe(48);
  });

  it('clamps scroll when viewport extends past map top', () => {
    const cam = { zoom: 2, scrollX: 0, scrollY: -40 };
    clampOverworldCamera(cam as Phaser.Cameras.Scene2D.Camera, townLike);
    expect(cam.scrollY).toBe(0);
  });
});

describe('computeOverworldZoom', () => {
  it('returns moderate zoom for outdoor maps', () => {
    const z = computeOverworldZoom(townLike);
    expect(z).toBeGreaterThanOrEqual(1.4);
    expect(z).toBeLessThanOrEqual(2.2);
  });
});
