import { FONT } from './theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { GameState } from '../systems/stats';
import { getMap } from '../data/maps';

/** Pokemon-style location name popup (screen-space). */
export function showMapBanner(scene: Phaser.Scene, mapName: string): void {
  const banner = scene.add.container(GAME_WIDTH / 2, -40).setDepth(950).setScrollFactor(0);

  const bg = scene.add.graphics();
  bg.fillStyle(COLORS.panel, 0.95);
  bg.fillRoundedRect(-140, -18, 280, 36, 8);
  bg.lineStyle(2, COLORS.gold, 1);
  bg.strokeRoundedRect(-140, -18, 280, 36, 8);

  const label = scene.add.text(0, 0, mapName, {
    fontFamily: FONT, fontSize: '14px', color: '#f5c542',
  }).setOrigin(0.5);

  banner.add([bg, label]);

  scene.tweens.add({
    targets: banner, y: 36, duration: 400, ease: 'Back.easeOut',
    onComplete: () => {
      scene.time.delayedCall(1800, () => {
        scene.tweens.add({
          targets: banner, y: -40, alpha: 0, duration: 350,
          onComplete: () => banner.destroy(),
        });
      });
    },
  });
}

/** Brief toast message (screen-space). */
export function showToast(scene: Phaser.Scene, msg: string, durationMs = 1800): void {
  const t = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, msg, {
    fontFamily: FONT, fontSize: '12px', color: '#f5c542',
    backgroundColor: '#16213e', padding: { x: 10, y: 6 },
  }).setOrigin(0.5).setDepth(960).setScrollFactor(0).setAlpha(0);

  scene.tweens.add({
    targets: t, alpha: 1, duration: 200,
    onComplete: () => {
      scene.time.delayedCall(durationMs, () => {
        scene.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() });
      });
    },
  });
}

export function showMapBannerForCurrentMap(scene: Phaser.Scene): void {
  showMapBanner(scene, getMap(GameState.player.mapId).name);
}
