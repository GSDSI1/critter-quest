import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { Sfx } from '../utils/audio';
import { npcTextureKey } from '../utils/assetLoader';
import { playerBackTextureKey } from '../utils/sprites';
import { GameState } from '../systems/stats';
import { buildBattleArena } from '../ui/sceneBackdrops';

export class TrainerIntroScene extends Phaser.Scene {
  constructor() {
    super('TrainerIntro');
  }

  create(data: {
    trainerName: string;
    isTrainer: boolean;
    battleData: Record<string, unknown>;
  }): void {
    Sfx.battleStart();
    const mapId = (data.battleData.mapId as string) ?? 'route1';

    buildBattleArena(this, mapId, -10);
    const overlay = this.add.graphics().setDepth(0);
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (data.isTrainer) {
      const leftPanel = this.add.graphics().setDepth(1);
      leftPanel.fillStyle(COLORS.panel, 0.85);
      leftPanel.fillRect(0, 0, GAME_WIDTH / 2, GAME_HEIGHT);
      const rightPanel = this.add.graphics().setDepth(1);
      rightPanel.fillStyle(darken(COLORS.panel, 10), 0.85);
      rightPanel.fillRect(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT);

      const vs = this.add.text(GAME_WIDTH / 2, 80, 'VS', {
        fontFamily: '"Courier New", monospace', fontSize: '52px', color: '#e94560', fontStyle: 'bold',
      }).setOrigin(0.5).setScale(0).setDepth(5);

      this.tweens.add({ targets: vs, scale: 1, duration: 400, ease: 'Back.easeOut' });
      this.cameras.main.flash(200, 255, 255, 255, false, undefined, 5);

      const trainerSprite = this.add.image(100, 230, npcTextureKey(this, 'trainer_m')).setScale(2).setAlpha(0).setDepth(5);
      const playerSprite = this.add.image(
        GAME_WIDTH - 100, 280,
        playerBackTextureKey(GameState.player.characterId),
      ).setScale(2).setFlipX(true).setAlpha(0).setDepth(5);

      const trainerName = this.add.text(GAME_WIDTH / 4, 340, data.trainerName, {
        fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f0f0f0',
      }).setOrigin(0.5).setAlpha(0).setDepth(5);

      const playerLabel = this.add.text(GAME_WIDTH * 3 / 4, 360, GameState.player.name, {
        fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f5c542',
      }).setOrigin(0.5).setAlpha(0).setDepth(5);

      this.tweens.add({ targets: trainerSprite, alpha: 1, x: 140, duration: 500, delay: 200 });
      this.tweens.add({ targets: trainerName, alpha: 1, duration: 400, delay: 300 });
      this.tweens.add({ targets: playerSprite, alpha: 1, x: GAME_WIDTH - 140, duration: 500, delay: 400 });
      this.tweens.add({ targets: playerLabel, alpha: 1, duration: 400, delay: 500 });
    } else {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Wild Battle!', {
        fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#f5c542',
      }).setOrigin(0.5).setDepth(5);
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'A wild critter appeared!', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
      }).setOrigin(0.5).setDepth(5);
    }

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('Battle', data.battleData);
      });
    });
  }
}

function darken(c: number, amt: number): number {
  const r = Math.max(0, ((c >> 16) & 0xff) - amt);
  const g = Math.max(0, ((c >> 8) & 0xff) - amt);
  const b = Math.max(0, (c & 0xff) - amt);
  return (r << 16) | (g << 8) | b;
}

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
