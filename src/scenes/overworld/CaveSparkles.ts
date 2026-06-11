import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';
import { pinToScreen } from '../../ui/screenUi';

/** Subtle drifting sparkle overlay for cave maps. */
export function buildCaveSparkles(scene: Phaser.Scene, depth = 2): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0).setDepth(depth);
  pinToScreen(c, depth);

  const specs = [
    { x: 120, y: 80, c: 0xc084fc },
    { x: 380, y: 120, c: 0xa78bfa },
    { x: 520, y: 60, c: 0xe9d5ff },
    { x: 200, y: 200, c: 0xddd6fe },
    { x: 440, y: 180, c: 0xc084fc },
  ];

  for (const s of specs) {
    const dot = scene.add.circle(s.x, s.y, 2, s.c, 0.5);
    c.add(dot);
    scene.tweens.add({
      targets: dot,
      alpha: { from: 0.2, to: 0.7 },
      y: s.y - 8,
      duration: 1800 + Math.random() * 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  const wash = scene.add.graphics();
  wash.fillStyle(0x581c87, 0.04);
  wash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  c.add(wash);

  return c;
}
