import Phaser from 'phaser';

export function showExclamationBubble(
  scene: Phaser.Scene,
  x: number,
  y: number,
  onDone: () => void,
): void {
  const bubble = scene.add.text(x, y - 20, '!', {
    fontFamily: 'Arial', fontSize: '16px', color: '#ef4444', fontStyle: 'bold',
    backgroundColor: '#ffffff', padding: { x: 4, y: 2 },
  }).setOrigin(0.5).setDepth(20);

  scene.tweens.add({
    targets: bubble, y: y - 28, duration: 400, yoyo: true, repeat: 1,
    onComplete: () => { bubble.destroy(); onDone(); },
  });
}
