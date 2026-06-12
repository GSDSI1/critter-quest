import Phaser from 'phaser';
import { TRAINER_PRESETS, getTrainer, type TrainerPreset } from '../../data/characters';
import { darken, lighten } from './colors';

export function playerTextureKey(scene: Phaser.Scene, characterId: string, facing: string, frame: number): string {
  const id = getTrainer(characterId).id;
  const ext = `ext_player_${id}_${facing}_${frame}`;
  if (scene.textures.exists(ext)) return ext;
  return `player_${id}_${facing}_${frame}`;
}

export function playerBackTextureKey(scene: Phaser.Scene, characterId: string): string {
  const id = getTrainer(characterId).id;
  const ext = `ext_player_${id}_back`;
  if (scene.textures.exists(ext)) return ext;
  return `player_back_${id}`;
}

function drawPlayerWalkSprites(scene: Phaser.Scene, preset: TrainerPreset): void {
  const dirs = ['down', 'up', 'left', 'right'] as const;
  for (const dir of dirs) {
    for (let frame = 0; frame < 2; frame++) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      const legOffset = frame === 1 ? 1 : 0;
      g.fillStyle(0x0f172a, 1);
      g.fillRect(2, 5, 12, 11);
      g.fillStyle(preset.accent, 1);
      g.fillRect(3, 7, 10, 8);
      g.fillStyle(preset.body, 1);
      g.fillRect(4, 6, 8, 7);
      g.fillStyle(lighten(preset.body, 30), 0.5);
      g.fillRect(4, 6, 3, 4);
      g.fillStyle(preset.skin, 1);
      g.fillCircle(8, 5, 4);
      g.fillStyle(preset.hair, 1);
      g.fillCircle(8, 4, 4);
      if (preset.hat !== undefined) {
        g.fillStyle(preset.hat, 1);
        g.fillRect(5, 2, 6, 3);
      }
      g.fillStyle(0x1a1a2e, 1);
      if (dir === 'down') {
        g.fillRect(6, 4, 2, 2);
        g.fillRect(9, 4, 2, 2);
      } else if (dir === 'up') {
        g.fillStyle(preset.hair, 1);
        g.fillCircle(8, 4, 4);
        if (preset.hat !== undefined) {
          g.fillStyle(preset.hat, 1);
          g.fillRect(5, 2, 6, 3);
        }
      } else if (dir === 'left') {
        g.fillRect(5, 4, 2, 2);
      } else {
        g.fillRect(9, 4, 2, 2);
      }
      g.fillStyle(darken(preset.accent, 20), 1);
      g.fillRect(5 + legOffset, 13, 3, 3);
      g.fillRect(9 - legOffset, 13, 3, 3);
      g.fillStyle(preset.accent, 1);
      g.fillRect(2, 8, 2, 5);
      g.generateTexture(`player_${preset.id}_${dir}_${frame}`, 16, 16);
      g.destroy();
    }
  }
}

function drawPlayerBackSprite(scene: Phaser.Scene, preset: TrainerPreset): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const s = 32;
  g.fillStyle(0x0f172a, 1);
  g.fillRect(4, 8, s - 8, s - 10);
  g.fillStyle(preset.body, 1);
  g.fillRect(6, 12, s - 12, s - 16);
  g.fillStyle(preset.accent, 1);
  g.fillRect(8, 14, s - 16, 6);
  g.fillStyle(preset.hair, 1);
  g.fillCircle(s / 2, 10, 7);
  if (preset.hat !== undefined) {
    g.fillStyle(preset.hat, 1);
    g.fillRect(10, 3, 12, 5);
  }
  g.fillStyle(preset.accent, 1);
  g.fillRect(10, s - 8, 5, 6);
  g.fillRect(s - 15, s - 8, 5, 6);
  g.generateTexture(`player_back_${preset.id}`, s, s);
  g.destroy();
}

export function generatePlayerAssets(scene: Phaser.Scene): void {
  for (const preset of TRAINER_PRESETS) {
    drawPlayerWalkSprites(scene, preset);
    drawPlayerBackSprite(scene, preset);
  }
}
