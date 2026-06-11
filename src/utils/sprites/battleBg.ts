import Phaser from 'phaser';
import { COLORS } from '../../data/types';
import { darken } from './colors';

function drawBiomeBattleBg(
  g: Phaser.GameObjects.Graphics,
  b: { sky: number; ground: number; accent: number },
  variant: string,
): void {
  g.fillGradientStyle(b.sky, b.sky, b.ground, b.ground, 1);
  g.fillRect(0, 0, 640, 480);
  g.fillStyle(darken(b.sky, 15), 0.35);
  g.fillEllipse(160, 90, 140, 40);
  g.fillEllipse(480, 70, 180, 50);
  g.fillEllipse(320, 120, 220, 35);
  g.fillStyle(darken(b.sky, 30), 0.3);
  g.fillRect(0, 280, 640, 2);

  if (variant === 'forest') {
    g.fillStyle(darken(b.accent, 40), 0.7);
    g.fillTriangle(0, 280, 80, 180, 160, 280);
    g.fillTriangle(120, 280, 200, 160, 280, 280);
    g.fillTriangle(400, 280, 480, 170, 560, 280);
  } else if (variant === 'cave') {
    g.fillStyle(0x1c1917, 0.8);
    for (let i = 0; i < 8; i++) {
      g.fillTriangle(i * 90, 0, i * 90 + 30, 80 + (i % 3) * 20, i * 90 + 60, 0);
    }
    g.fillStyle(0x57534e, 0.5);
    g.fillRect(0, 250, 640, 30);
  } else if (variant === 'gym') {
    g.fillStyle(COLORS.gold, 0.25);
    g.fillRect(0, 0, 640, 40);
    g.fillStyle(0xffffff, 0.15);
    g.fillRect(40, 60, 560, 8);
    g.fillRect(40, 200, 560, 8);
  } else if (variant === 'volcano') {
    g.fillStyle(0xef4444, 0.3);
    g.fillCircle(520, 100, 40);
    g.fillStyle(0xfbbf24, 0.2);
    g.fillCircle(100, 80, 25);
  } else {
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(120, 60, 80, 30);
    g.fillEllipse(400, 90, 100, 35);
    g.fillEllipse(550, 50, 60, 25);
  }

  g.fillStyle(b.accent, 1);
  g.fillEllipse(320, 420, 700, 120);
  g.fillStyle(darken(b.accent, 25), 0.8);
  g.fillEllipse(320, 435, 520, 60);
}

export function generateBattleBgAssets(scene: Phaser.Scene): void {
  const biomes: { key: string; sky: number; ground: number; accent: number; variant: string }[] = [
    { key: 'battle_bg', sky: 0x87ceeb, ground: 0x6bbf59, accent: 0x5a9e4a, variant: 'default' },
    { key: 'battle_bg_forest', sky: 0x6b9080, ground: 0x40916c, accent: 0x2d6a4f, variant: 'forest' },
    { key: 'battle_bg_cave', sky: 0x44403c, ground: 0x292524, accent: 0x1c1917, variant: 'cave' },
    { key: 'battle_bg_gym', sky: 0xd4c4a8, ground: 0xc4b498, accent: 0xa89070, variant: 'gym' },
    { key: 'battle_bg_volcano', sky: 0x7f1d1d, ground: 0x44403c, accent: 0x991b1b, variant: 'volcano' },
  ];
  for (const b of biomes) {
    const bg = scene.make.graphics({ x: 0, y: 0 });
    drawBiomeBattleBg(bg, b, b.variant);
    bg.generateTexture(b.key, 640, 480);
    bg.destroy();

    const far = scene.make.graphics({ x: 0, y: 0 });
    far.fillStyle(darken(b.sky, 10), 0.25);
    far.fillEllipse(100, 100, 200, 50);
    far.fillEllipse(400, 80, 260, 60);
    far.fillEllipse(580, 120, 120, 40);
    far.generateTexture(`${b.key}_far`, 640, 480);
    far.destroy();
  }
}
