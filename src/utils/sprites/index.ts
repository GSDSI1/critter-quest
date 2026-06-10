import Phaser from 'phaser';
import { generateTileAssets } from './tiles';
import { generatePlayerAssets } from './player';
import { generateNpcAssets } from './npcs';
import { generateBattleBgAssets } from './battleBg';
import { generateUiAssets } from './ui';

export { playerTextureKey, playerBackTextureKey } from './player';
export { tileTextureKey, proceduralTilesetKey, bakeProceduralTileset } from './tiles';
export { generateCreatureTexture, ensureAllCreatureTextures } from './creatures';
export { hex, darken, lighten } from './colors';

function generateFallbackBattleBg(scene: Phaser.Scene): void {
  if (!scene.textures.exists('battle_bg')) {
    const bgG = scene.make.graphics({ x: 0, y: 0 });
    bgG.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x98d8aa, 0x98d8aa, 1);
    bgG.fillRect(0, 0, 640, 480);
    bgG.fillStyle(0x6bbf59, 1);
    bgG.fillEllipse(320, 420, 700, 120);
    bgG.generateTexture('battle_bg', 640, 480);
    bgG.destroy();
  }
}

export function generateAssets(scene: Phaser.Scene): void {
  generateTileAssets(scene);
  generateUiAssets(scene);
  generatePlayerAssets(scene);
  generateNpcAssets(scene);
  generateBattleBgAssets(scene);
  generateFallbackBattleBg(scene);
}
