import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';
import { pinToScreen } from '../../ui/screenUi';

const CITY_TINTS: Record<string, { color: number; alpha: number }> = {
  town: { color: 0x86efac, alpha: 0.05 },
  mossgrove: { color: 0x4ade80, alpha: 0.06 },
  ember_city: { color: 0xff6b35, alpha: 0.09 },
  frostvale: { color: 0x93c5fd, alpha: 0.11 },
  mindspire: { color: 0xc084fc, alpha: 0.1 },
  volcanic_path: { color: 0xef4444, alpha: 0.07 },
  glacier_pass: { color: 0xbfdbfe, alpha: 0.08 },
  victory_road: { color: 0x818cf8, alpha: 0.09 },
  forest: { color: 0x22c55e, alpha: 0.05 },
  crystal_cave: { color: 0xa855f7, alpha: 0.1 },
};

/** Subtle full-screen color wash for hub cities. */
export function buildCityAtmosphere(scene: Phaser.Scene, mapId: string, depth = 3): Phaser.GameObjects.Graphics | undefined {
  const spec = CITY_TINTS[mapId];
  if (!spec) return undefined;
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(spec.color, spec.alpha);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  pinToScreen(g, depth);
  return g;
}
