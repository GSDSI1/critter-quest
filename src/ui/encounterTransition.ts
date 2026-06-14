import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { CURTAIN_COLOR } from './transitions';

/** Wild encounter flash + horizontal wipe before battle. */
export function playEncounterTransition(scene: Phaser.Scene, onComplete: () => void): void {
  const flash = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
    .setDepth(2000).setScrollFactor(0);

  const wipe = scene.add.rectangle(-GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, CURTAIN_COLOR, 1)
    .setDepth(2001).setScrollFactor(0);

  scene.tweens.add({
    targets: flash,
    alpha: { from: 0, to: 0.85 },
    duration: 80,
    yoyo: true,
    hold: 40,
    onComplete: () => {
      scene.tweens.add({
        targets: wipe,
        x: GAME_WIDTH / 2,
        duration: 220,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          flash.destroy();
          wipe.destroy();
          onComplete();
        },
      });
    },
  });
}
