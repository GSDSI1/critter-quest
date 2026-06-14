import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';

export const CURTAIN_COLOR = 0x1a1a2e;

export function fadeToScene(
  scene: Phaser.Scene,
  key: string,
  data?: object,
  duration = 400,
): void {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.time.delayedCall(duration, () => scene.scene.start(key, { ...data, _fadeIn: true }));
}

/** Start a scene and fade in on arrival (after an external fade-out). */
export function startWithFadeIn(scene: Phaser.Scene, key: string, data?: object): void {
  scene.scene.start(key, { ...data, _fadeIn: true });
}

export function fadeIn(scene: Phaser.Scene, duration = 400): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}

/** Call at top of scene create when launched via fadeToScene. */
export function fadeInOnStart(scene: Phaser.Scene, data?: { _fadeIn?: boolean }, duration = 400): void {
  if (data?._fadeIn) fadeIn(scene, duration);
}

/** Horizontal curtain wipe into another scene. */
export function wipeToScene(
  scene: Phaser.Scene,
  key: string,
  data?: object,
  direction: 'left' | 'right' = 'left',
  duration = 350,
): void {
  const curtain = scene.add.graphics().setDepth(10000).setScrollFactor(0);
  curtain.fillStyle(CURTAIN_COLOR, 1);
  const startX = direction === 'left' ? -GAME_WIDTH : GAME_WIDTH;
  curtain.fillRect(startX, 0, GAME_WIDTH, GAME_HEIGHT);
  scene.tweens.add({
    targets: { x: startX },
    x: 0,
    duration,
    ease: 'Quad.easeIn',
    onUpdate: (_t, target) => {
      const x = (target as { x: number }).x;
      curtain.clear();
      curtain.fillStyle(CURTAIN_COLOR, 1);
      curtain.fillRect(x, 0, GAME_WIDTH, GAME_HEIGHT);
      if (direction === 'left') curtain.fillRect(x + GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT);
      else curtain.fillRect(x - GAME_WIDTH, 0, GAME_WIDTH, GAME_HEIGHT);
    },
    onComplete: () => {
      scene.scene.start(key, { ...data, _wipeIn: true });
      curtain.destroy();
    },
  });
}

/** Wipe then restart the current scene (map warps). */
export function wipeRestartScene(
  scene: Phaser.Scene,
  data?: object,
  direction: 'left' | 'right' = 'left',
  duration = 300,
): void {
  const curtain = scene.add.graphics().setDepth(10000).setScrollFactor(0);
  curtain.fillStyle(CURTAIN_COLOR, 1);
  curtain.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  scene.tweens.add({
    targets: curtain,
    alpha: { from: 0, to: 1 },
    duration: duration / 2,
    yoyo: true,
    hold: 50,
    onComplete: () => {
      curtain.destroy();
      scene.scene.restart({ ...data, _wipeIn: true });
    },
  });
}

export function wipeInOnStart(scene: Phaser.Scene, data?: { _wipeIn?: boolean }, duration = 300): void {
  if (!data?._wipeIn) return;
  const curtain = scene.add.graphics().setDepth(10000).setScrollFactor(0);
  curtain.fillStyle(CURTAIN_COLOR, 1);
  curtain.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  scene.tweens.add({ targets: curtain, alpha: 0, duration, onComplete: () => curtain.destroy() });
}
