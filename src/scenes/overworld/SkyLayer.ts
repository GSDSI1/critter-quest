import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';
import { pinToScreen } from '../../ui/screenUi';

/** Slow-drifting cloud parallax for outdoor maps. */
export function buildSkyLayer(scene: Phaser.Scene, depth = -8): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);
  pinToScreen(c, depth);

  const sky = scene.add.graphics();
  sky.fillGradientStyle(0x7ec8e3, 0x7ec8e3, 0xb8e0f0, 0xd4ebf7, 1);
  sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT * 0.55);
  c.add(sky);

  const clouds: Phaser.GameObjects.Ellipse[] = [];
  const specs = [
    { x: 100, y: 60, w: 90, h: 28, dx: 18 },
    { x: 320, y: 40, w: 120, h: 32, dx: -12 },
    { x: 520, y: 75, w: 70, h: 22, dx: 14 },
  ];
  for (const s of specs) {
    const cloud = scene.add.ellipse(s.x, s.y, s.w, s.h, 0xffffff, 0.35);
    c.add(cloud);
    clouds.push(cloud);
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
