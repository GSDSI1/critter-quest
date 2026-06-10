import Phaser from 'phaser';

type Scrollable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.ScrollFactor;
type Depthable = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Depth;

/** Pin a game object to the camera viewport (screen space). */
export function pinToScreen(obj: Phaser.GameObjects.GameObject, depth?: number): void {
  if ('setScrollFactor' in obj && typeof (obj as Scrollable).setScrollFactor === 'function') {
    (obj as Scrollable).setScrollFactor(0);
  }
  if (depth !== undefined && 'setDepth' in obj && typeof (obj as Depthable).setDepth === 'function') {
    (obj as Depthable).setDepth(depth);
  }
}

/** Pin a container and all its children to the screen. */
export function pinContainerChildren(container: Phaser.GameObjects.Container, depth?: number): void {
  pinToScreen(container, depth);
  container.list.forEach(c => pinToScreen(c as Phaser.GameObjects.GameObject));
}

/** Full-screen dim overlay pinned to screen. */
export function createScreenBackdrop(
  scene: Phaser.Scene,
  alpha = 0.55,
  depth = 1999,
): Phaser.GameObjects.Rectangle {
  const cam = scene.cameras.main;
  const rect = scene.add.rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, alpha);
  pinToScreen(rect, depth);
  return rect;
}
