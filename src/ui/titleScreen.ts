import { FONT } from './theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';

export function formatPlayTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Parallax sky, hills, grass — shared by Intro + Menu. */
export function buildTitleBackdrop(scene: Phaser.Scene, depth = -10): {
  stars: Phaser.GameObjects.Arc[];
  hills: Phaser.GameObjects.Graphics;
  grass: Phaser.GameObjects.Graphics;
} {
  const sky = scene.add.graphics().setDepth(depth);
  sky.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a2e4a, 0x16213e, 1);
  sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const stars: Phaser.GameObjects.Arc[] = [];
  for (let i = 0; i < 45; i++) {
    const star = scene.add.circle(
      Phaser.Math.Between(0, GAME_WIDTH),
      Phaser.Math.Between(0, GAME_HEIGHT * 0.55),
      Phaser.Math.Between(1, 2),
      0xffffff,
      Phaser.Math.FloatBetween(0.15, 0.65),
    ).setDepth(depth + 1);
    scene.tweens.add({
      targets: star, alpha: 0.08,
      duration: Phaser.Math.Between(700, 2000),
      yoyo: true, repeat: -1,
    });
    stars.push(star);
  }

  const hills = scene.add.graphics().setDepth(depth + 2);
  hills.fillStyle(0x1a3d2e, 1);
  hills.fillTriangle(0, 340, 180, 260, 360, 340);
  hills.fillStyle(0x14532d, 1);
  hills.fillTriangle(200, 360, 420, 250, 640, 360);
  hills.fillStyle(0x166534, 0.7);
  hills.fillTriangle(80, 380, 320, 300, 560, 390);

  const grass = scene.add.graphics().setDepth(depth + 3);
  grass.fillStyle(0x2d6b27, 1);
  grass.fillRect(0, 400, GAME_WIDTH, 80);
  grass.fillStyle(0x3d8b37, 1);
  for (let x = 0; x < GAME_WIDTH; x += 16) {
    grass.fillTriangle(x, 400, x + 8, 392, x + 16, 400);
  }

  return { stars, hills, grass };
}

export function addTitleLogo(
  scene: Phaser.Scene,
  y = 95,
  depth = 10,
): Phaser.GameObjects.Container {
  const c = scene.add.container(GAME_WIDTH / 2, y).setDepth(depth);

  const banner = scene.add.image(0, 0, 'title_banner').setOrigin(0.5);
  const title = scene.add.text(0, -4, 'CRITTER QUEST', {
    fontFamily: FONT,
    fontSize: '36px',
    color: '#f5c542',
    stroke: '#e94560',
    strokeThickness: 3,
  }).setOrigin(0.5);

  c.add([banner, title]);
  return c;
}

/** Pokemon-style blinking "Press Start" prompt. */
export function addBlinkingPrompt(
  scene: Phaser.Scene,
  text: string,
  y: number,
  depth = 20,
): Phaser.GameObjects.Text {
  const t = scene.add.text(GAME_WIDTH / 2, y, text, {
    fontFamily: FONT,
    fontSize: '13px',
    color: '#f0f0f0',
  }).setOrigin(0.5).setDepth(depth);

  scene.tweens.add({
    targets: t, alpha: 0.25,
    duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  return t;
}

export function drawSaveSummaryPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  lines: string[],
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const h = 28 + lines.length * 16;
  const panel = scene.add.graphics();
  panel.fillStyle(COLORS.panel, 0.92);
  panel.fillRoundedRect(-150, 0, 300, h, 8);
  panel.lineStyle(2, COLORS.gold, 0.8);
  panel.strokeRoundedRect(-150, 0, 300, h, 8);
  c.add(panel);

  lines.forEach((line, i) => {
    c.add(scene.add.text(0, 14 + i * 16, line, {
      fontFamily: FONT,
      fontSize: '11px',
      color: i === 0 ? '#f5c542' : '#c0c0c0',
    }).setOrigin(0.5, 0));
  });
  return c;
}
