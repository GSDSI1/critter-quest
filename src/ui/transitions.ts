import Phaser from 'phaser';

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
