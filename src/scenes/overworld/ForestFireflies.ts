import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';
import { pinToScreen } from '../../ui/screenUi';
import { nightTintAlpha } from '../../systems/dayNight';
import { GameState } from '../../systems/stats';

/** Drifting firefly specks for forest maps — brighter at night. */
export function buildForestFireflies(scene: Phaser.Scene, depth = 2): {
  container: Phaser.GameObjects.Container;
  update: (playTime: number) => void;
} {
  const c = scene.add.container(0, 0).setDepth(depth);
  pinToScreen(c, depth);

  const dots: Phaser.GameObjects.Arc[] = [];
  const specs = [
    { x: 80, y: 120, c: 0xa3e635 },
    { x: 220, y: 80, c: 0xfde047 },
    { x: 400, y: 140, c: 0x84cc16 },
    { x: 520, y: 90, c: 0xfef08a },
    { x: 160, y: 220, c: 0xbef264 },
    { x: 480, y: 200, c: 0xfacc15 },
  ];

  for (const s of specs) {
    const dot = scene.add.circle(s.x, s.y, 2, s.c, 0.35);
    c.add(dot);
    dots.push(dot);
    scene.tweens.add({
      targets: dot,
      x: s.x + (Math.random() > 0.5 ? 12 : -12),
      y: s.y - 10,
      alpha: { from: 0.15, to: 0.65 },
      duration: 2200 + Math.random() * 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  const wash = scene.add.graphics();
  c.add(wash);

  const update = (playTime: number) => {
    const night = nightTintAlpha(playTime) > 0.05;
    const alpha = night ? 0.55 : 0.25;
    dots.forEach(d => d.setAlpha(alpha));
    wash.clear();
    wash.fillStyle(0x14532d, night ? 0.06 : 0.02);
    wash.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  };

  update(GameState.player.playTime);
  return { container: c, update };
}
