import Phaser from 'phaser';
import { COLORS } from '../../data/types';
import { darken } from './colors';

function drawNpc32(
  g: Phaser.GameObjects.Graphics,
  body: number,
  hair: number,
  accent: number,
  prop?: string,
): void {
  g.fillStyle(0x0f172a, 0.3);
  g.fillEllipse(16, 30, 20, 6);
  g.fillStyle(body, 1);
  g.fillRoundedRect(10, 14, 12, 14, 3);
  g.fillStyle(hair, 1);
  g.fillCircle(16, 10, 8);
  g.fillStyle(0x1a1a2e, 1);
  g.fillRect(12, 9, 3, 3);
  g.fillRect(18, 9, 3, 3);
  g.fillStyle(0xffffff, 0.8);
  g.fillRect(13, 10, 1, 1);
  g.fillRect(19, 10, 1, 1);
  g.fillStyle(accent, 1);
  g.fillRect(9, 26, 5, 4);
  g.fillRect(18, 26, 5, 4);
  g.fillStyle(darken(body, 20), 1);
  g.fillRect(12, 28, 8, 2);

  if (prop === 'nurse') {
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(8, 14, 16, 12, 2);
    g.fillStyle(0xf472b6, 1);
    g.fillRect(8, 14, 16, 4);
    g.fillStyle(0xef4444, 1);
    g.fillRect(14, 20, 4, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRect(15, 21, 2, 2);
  } else if (prop === 'clerk') {
    g.fillStyle(0x22c55e, 1);
    g.fillRect(9, 16, 14, 8);
    g.fillStyle(0xffffff, 1);
    g.fillRect(11, 18, 10, 3);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(12, 8, 8, 3);
  } else if (prop === 'leader') {
    g.fillStyle(COLORS.gold, 1);
    g.fillCircle(16, 4, 3);
    g.fillRect(8, 8, 16, 3);
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(10, 14, 12, 2);
  } else if (prop === 'prof') {
    g.fillStyle(0xffffff, 1);
    g.fillRect(8, 14, 16, 4);
    g.fillStyle(0x4338ca, 1);
    g.fillRoundedRect(7, 22, 18, 8, 2);
    g.fillStyle(0xe5e7eb, 1);
    g.fillRect(11, 7, 10, 3);
    g.lineStyle(1, 0x1a1a2e, 1);
    g.lineBetween(10, 11, 14, 11);
    g.lineBetween(18, 11, 22, 11);
    g.fillStyle(0xfbbf24, 0.8);
    g.fillCircle(22, 18, 2);
  } else if (prop === 'rival') {
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(10, 4, 12, 4);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(12, 5, 8, 2);
    g.fillStyle(0xef4444, 0.6);
    g.fillTriangle(24, 12, 28, 16, 24, 20);
  } else if (prop === 'trainer') {
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(11, 15, 10, 2);
    g.fillStyle(accent, 0.8);
    g.fillRect(9, 24, 14, 3);
  }
}

function drawAllNpcSprites(scene: Phaser.Scene): void {
  const roles: { role: string; body: number; hair: number; accent: number; prop?: string }[] = [
    { role: 'generic', body: 0x9333ea, hair: 0xfca5a5, accent: 0x4c1d95 },
    { role: 'nurse', body: 0xf472b6, hair: 0xfff1f2, accent: 0xdb2777, prop: 'nurse' },
    { role: 'clerk', body: 0x3b82f6, hair: 0x1e3a5f, accent: 0x1d4ed8, prop: 'clerk' },
    { role: 'trainer_m', body: 0x22c55e, hair: 0xfbbf24, accent: 0x15803d, prop: 'trainer' },
    { role: 'trainer_f', body: 0xec4899, hair: 0x831843, accent: 0xbe185d, prop: 'trainer' },
    { role: 'rival', body: 0xef4444, hair: 0x1a1a2e, accent: 0xb91c1c, prop: 'rival' },
    { role: 'leader', body: 0xf59e0b, hair: 0xfef3c7, accent: 0xd97706, prop: 'leader' },
    { role: 'prof', body: 0x6366f1, hair: 0xe5e7eb, accent: 0x4338ca, prop: 'prof' },
  ];
  for (const { role, body, hair, accent, prop } of roles) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    drawNpc32(g, body, hair, accent, prop);
    g.generateTexture(`npc_${role}`, 32, 32);
    g.destroy();
  }
}

export function generateNpcAssets(scene: Phaser.Scene): void {
  drawAllNpcSprites(scene);

  if (!scene.textures.exists('npc')) {
    scene.textures.addImage('npc', scene.textures.get('npc_generic').getSourceImage() as HTMLImageElement);
  }

  const npcG = scene.make.graphics({ x: 0, y: 0 });
  npcG.fillStyle(0x9333ea, 1);
  npcG.fillRect(4, 6, 8, 7);
  npcG.fillStyle(0xfca5a5, 1);
  npcG.fillCircle(8, 5, 4);
  npcG.fillStyle(0x1a1a2e, 1);
  npcG.fillRect(6, 4, 2, 2);
  npcG.fillRect(9, 4, 2, 2);
  npcG.fillStyle(0x4c1d95, 1);
  npcG.fillRect(5, 13, 3, 3);
  npcG.fillRect(9, 13, 3, 3);
  if (!scene.textures.exists('npc')) npcG.generateTexture('npc', 16, 16);
  npcG.destroy();
}
