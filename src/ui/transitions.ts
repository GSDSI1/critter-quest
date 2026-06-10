import Phaser from 'phaser';

export function fadeToScene(
  scene: Phaser.Scene,
  key: string,
  data?: object,
  duration = 400,
): void {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.time.delayedCall(duration, () => scene.scene.start(key, data));
}

export function fadeIn(scene: Phaser.Scene, duration = 400): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}
