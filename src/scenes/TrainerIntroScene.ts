import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { Sfx } from '../utils/audio';
import { npcTextureKey } from '../utils/assetLoader';
import { playerBackTextureKey } from '../utils/sprites';
import { GameState } from '../systems/stats';

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

    this.cameras.main.setBackgroundColor(0x1a1a2e);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (data.isTrainer) {
      const vs = this.add.text(GAME_WIDTH / 2, 80, 'VS', {
        fontFamily: '"Courier New", monospace', fontSize: '48px', color: '#e94560', fontStyle: 'bold',
      }).setOrigin(0.5).setScale(0);

      this.tweens.add({ targets: vs, scale: 1, duration: 400, ease: 'Back.easeOut' });

      const trainerSprite = this.add.image(140, 220, npcTextureKey(this, 'trainer_m')).setScale(4).setAlpha(0);
      const playerSprite = this.add.image(
        GAME_WIDTH - 140, 280,
        playerBackTextureKey(GameState.player.characterId),
      ).setScale(4).setFlipX(true).setAlpha(0);

      const trainerName = this.add.text(140, 300, data.trainerName, {
        fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f0f0f0',
      }).setOrigin(0.5).setAlpha(0);

      const playerLabel = this.add.text(GAME_WIDTH - 140, 340, GameState.player.name, {
        fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f5c542',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: trainerSprite, alpha: 1, x: 180, duration: 500, delay: 200 });
      this.tweens.add({ targets: trainerName, alpha: 1, duration: 400, delay: 300 });
      this.tweens.add({ targets: playerSprite, alpha: 1, x: GAME_WIDTH - 180, duration: 500, delay: 400 });
      this.tweens.add({ targets: playerLabel, alpha: 1, duration: 400, delay: 500 });
    } else {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 'Wild Battle!', {
        fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#f5c542',
      }).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'A wild critter appeared!', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
      }).setOrigin(0.5);
    }

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('Battle', data.battleData);
      });
    });
  }
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
