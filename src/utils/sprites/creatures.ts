import Phaser from 'phaser';
import { TYPE_COLORS, type ElementType } from '../../data/types';
import type { CreatureDef } from '../../data/creatures';
import { darken, lighten } from './colors';

function drawCreature(g: Phaser.GameObjects.Graphics, def: CreatureDef, cx: number, cy: number, size: number): void {
  const c = def.color;
  const dark = darken(c, 40);
  const light = lighten(c, 50);
  const s = size;

  g.fillStyle(c, 1);
  g.fillStyle(dark, 1);
  g.fillStyle(light, 1);

  switch (def.shape) {
    case 'blob':
      g.fillStyle(c, 1);
      g.fillCircle(cx, cy, s * 0.35);
      g.fillStyle(light, 1);
      g.fillCircle(cx - s * 0.1, cy - s * 0.12, s * 0.08);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx - s * 0.08, cy - s * 0.05, s * 0.06);
      g.fillCircle(cx + s * 0.1, cy - s * 0.05, s * 0.06);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx - s * 0.06, cy - s * 0.04, s * 0.03);
      g.fillCircle(cx + s * 0.12, cy - s * 0.04, s * 0.03);
      break;
    case 'quadruped':
      g.fillStyle(c, 1);
      g.fillEllipse(cx, cy + s * 0.05, s * 0.45, s * 0.3);
      g.fillCircle(cx + s * 0.22, cy - s * 0.05, s * 0.18);
      g.fillStyle(dark, 1);
      g.fillRect(cx - s * 0.15, cy + s * 0.15, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.05, cy + s * 0.15, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.2, cy + s * 0.12, s * 0.06, s * 0.12);
      g.fillRect(cx + s * 0.32, cy + s * 0.12, s * 0.06, s * 0.12);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.28, cy - s * 0.08, s * 0.05);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.29, cy - s * 0.07, s * 0.025);
      break;
    case 'serpent':
      g.fillStyle(c, 1);
      for (let i = 0; i < 5; i++) {
        g.fillCircle(cx - s * 0.2 + i * s * 0.1, cy + Math.sin(i) * s * 0.05, s * 0.12);
      }
      g.fillCircle(cx + s * 0.28, cy - s * 0.08, s * 0.14);
      g.fillStyle(0xff4444, 1);
      g.fillCircle(cx + s * 0.34, cy - s * 0.1, s * 0.025);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.3, cy - s * 0.1, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.31, cy - s * 0.09, s * 0.02);
      break;
    case 'avian':
      g.fillStyle(c, 1);
      g.fillEllipse(cx, cy, s * 0.35, s * 0.25);
      g.fillCircle(cx + s * 0.15, cy - s * 0.12, s * 0.12);
      g.fillStyle(light, 1);
      g.fillTriangle(cx - s * 0.1, cy - s * 0.05, cx - s * 0.35, cy - s * 0.2, cx - s * 0.15, cy + s * 0.05);
      g.fillTriangle(cx + s * 0.05, cy - s * 0.05, cx + s * 0.3, cy - s * 0.15, cx + s * 0.1, cy + s * 0.05);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx + s * 0.18, cy - s * 0.14, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx + s * 0.19, cy - s * 0.13, s * 0.02);
      break;
    case 'humanoid':
      g.fillStyle(c, 1);
      g.fillCircle(cx, cy - s * 0.12, s * 0.14);
      g.fillRect(cx - s * 0.1, cy, s * 0.2, s * 0.22);
      g.fillRect(cx - s * 0.18, cy + s * 0.02, s * 0.08, s * 0.18);
      g.fillRect(cx + s * 0.1, cy + s * 0.02, s * 0.08, s * 0.18);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx - s * 0.05, cy - s * 0.14, s * 0.04);
      g.fillCircle(cx + s * 0.05, cy - s * 0.14, s * 0.04);
      g.fillStyle(0x1a1a2e, 1);
      g.fillCircle(cx - s * 0.04, cy - s * 0.13, s * 0.02);
      g.fillCircle(cx + s * 0.06, cy - s * 0.13, s * 0.02);
      break;
    case 'crystalline':
      g.fillStyle(c, 1);
      g.fillTriangle(cx, cy - s * 0.3, cx + s * 0.2, cy - s * 0.05, cx + s * 0.15, cy + s * 0.25);
      g.fillTriangle(cx, cy - s * 0.3, cx - s * 0.2, cy - s * 0.05, cx - s * 0.15, cy + s * 0.25);
      g.fillTriangle(cx + s * 0.15, cy + s * 0.25, cx - s * 0.15, cy + s * 0.25, cx, cy + s * 0.32);
      g.fillStyle(light, 1);
      g.fillTriangle(cx, cy - s * 0.3, cx + s * 0.08, cy - s * 0.08, cx - s * 0.05, cy - s * 0.05);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(cx - s * 0.03, cy - s * 0.1, s * 0.04);
      break;
  }

  const typeColor = TYPE_COLORS[def.types[0] as ElementType];
  g.fillStyle(typeColor, 0.6);
  g.fillCircle(cx, cy + s * 0.28, s * 0.06);
}

export function generateCreatureTexture(scene: Phaser.Scene, def: CreatureDef, key: string, size = 64): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  drawCreature(g, def, size / 2, size / 2, size);
  g.generateTexture(key, size, size);
  g.destroy();
}

export function ensureAllCreatureTextures(scene: Phaser.Scene, speciesIds: string[], getDef: (id: string) => CreatureDef): void {
  for (const id of speciesIds) {
    generateCreatureTexture(scene, getDef(id), `creature_${id}`, 64);
    generateCreatureTexture(scene, getDef(id), `creature_${id}_sm`, 32);
  }
}
