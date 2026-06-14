import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';
import { pinToScreen } from '../../ui/screenUi';

interface SkySpec {
  top: number;
  bottom: number;
  ground: number;
  clouds: boolean;
  cloudAlpha: number;
}

const SKY_BY_MAP: Record<string, SkySpec> = {
  default: { top: 0x7ec8e3, bottom: 0xd4ebf7, ground: 0x86efac, clouds: true, cloudAlpha: 0.35 },
  town: { top: 0x7ec8e3, bottom: 0xd4ebf7, ground: 0x86efac, clouds: true, cloudAlpha: 0.4 },
  forest: { top: 0x6b9080, bottom: 0xa7c4bc, ground: 0x4ade80, clouds: true, cloudAlpha: 0.28 },
  route3: { top: 0x67e8f9, bottom: 0xbae6fd, ground: 0x86efac, clouds: true, cloudAlpha: 0.38 },
  volcanic_path: { top: 0x7f1d1d, bottom: 0xfdba74, ground: 0xca8a04, clouds: false, cloudAlpha: 0 },
  crystal_cave: { top: 0x44403c, bottom: 0x78716c, ground: 0x57534e, clouds: false, cloudAlpha: 0 },
  glacier_pass: { top: 0xc4d9f0, bottom: 0xe8f4fc, ground: 0xcbd5e1, clouds: true, cloudAlpha: 0.45 },
  route4: { top: 0x93c5fd, bottom: 0xe0f2fe, ground: 0x86efac, clouds: true, cloudAlpha: 0.42 },
  victory_road: { top: 0x312e81, bottom: 0x6366f1, ground: 0x475569, clouds: false, cloudAlpha: 0 },
};

function skySpecForMap(mapId: string): SkySpec {
  if (SKY_BY_MAP[mapId]) return SKY_BY_MAP[mapId];
  if (mapId.includes('glacier') || mapId === 'frostvale') return SKY_BY_MAP.glacier_pass;
  if (mapId.includes('volcanic') || mapId === 'ember_city') return SKY_BY_MAP.volcanic_path;
  if (mapId.includes('route5') || mapId === 'mindspire') return SKY_BY_MAP.victory_road;
  if (mapId.startsWith('route')) return SKY_BY_MAP.default;
  return SKY_BY_MAP.default;
}

/** Full-viewport sky + horizon + ground fill for outdoor maps (screen-space, no black void). */
export function buildSkyLayer(scene: Phaser.Scene, mapId = 'default', depth = -8): Phaser.GameObjects.Container {
  const spec = skySpecForMap(mapId);
  const c = scene.add.container(0, 0).setDepth(depth);
  pinToScreen(c, depth);

  const horizonY = Math.floor(GAME_HEIGHT * 0.42);
  const skyH = horizonY + 24;

  const sky = scene.add.graphics();
  sky.fillGradientStyle(spec.top, spec.top, spec.bottom, spec.bottom, 1);
  sky.fillRect(0, 0, GAME_WIDTH, skyH);
  c.add(sky);

  const horizon = scene.add.graphics();
  horizon.fillGradientStyle(spec.bottom, spec.bottom, spec.ground, spec.ground, 1);
  horizon.fillRect(0, horizonY, GAME_WIDTH, GAME_HEIGHT - horizonY);
  c.add(horizon);

  const hills = scene.add.graphics();
  hills.fillStyle(spec.ground, 0.55);
  hills.fillEllipse(GAME_WIDTH * 0.25, horizonY + 8, 220, 48);
  hills.fillEllipse(GAME_WIDTH * 0.72, horizonY + 12, 280, 56);
  hills.fillStyle(spec.ground, 0.35);
  hills.fillEllipse(GAME_WIDTH * 0.5, horizonY + 18, GAME_WIDTH * 0.95, 64);
  c.add(hills);

  const groundTex = scene.add.graphics();
  groundTex.fillStyle(spec.ground, 0.18);
  for (let y = horizonY + 40; y < GAME_HEIGHT; y += 16) {
    for (let x = (y % 32); x < GAME_WIDTH; x += 32) {
      groundTex.fillRect(x, y, 8, 8);
    }
  }
  c.add(groundTex);

  if (!spec.clouds) return c;

  const specs = [
    { x: 100, y: 60, w: 90, h: 28, dx: 18 },
    { x: 320, y: 40, w: 120, h: 32, dx: -12 },
    { x: 520, y: 75, w: 70, h: 22, dx: 14 },
  ];
  for (const s of specs) {
    const cloud = scene.add.ellipse(s.x, s.y, s.w, s.h, 0xffffff, spec.cloudAlpha);
    c.add(cloud);
    scene.tweens.add({
      targets: cloud,
      x: s.x + s.dx,
      duration: 8000 + Math.abs(s.dx) * 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  return c;
}
