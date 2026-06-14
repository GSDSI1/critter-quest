import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { npcTextureKey } from '../utils/assetLoader';
import { playerBackTextureKey } from '../utils/sprites';
import { GameState } from '../systems/stats';
import { buildBattleArena } from '../ui/sceneBackdrops';
import { wipeToScene } from '../ui/transitions';

export class TrainerIntroScene extends Phaser.Scene {
  constructor() {
    super('TrainerIntro');
  }

  create(data: {
    trainerName: string;
    isTrainer: boolean;
    battleData: Record<string, unknown>;
    introHoldMs?: number;
  }): void {
    const mapId = (data.battleData.mapId as string) ?? 'route1';
    const holdMs = data.introHoldMs ?? 1500;

    buildBattleArena(this, mapId, -10);
    const overlay = this.add.graphics().setDepth(0);
    overlay.fillStyle(0x000000, 0.35);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const leftPanel = this.add.graphics().setDepth(1);
    leftPanel.fillStyle(COLORS.panel, 0.85);
    leftPanel.fillRect(0, 0, GAME_WIDTH / 2, GAME_HEIGHT);
    const rightPanel = this.add.graphics().setDepth(1);
    rightPanel.fillStyle(darken(COLORS.panel, 10), 0.85);
    rightPanel.fillRect(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT);

    const vs = this.add.text(GAME_WIDTH / 2, 80, 'VS', {
      fontFamily: FONT, fontSize: '52px', color: '#e94560', fontStyle: 'bold',
    }).setOrigin(0.5).setScale(0).setDepth(5);

    this.tweens.add({ targets: vs, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.cameras.main.flash(200, 255, 255, 255, false, undefined, 5);

    const trainerSprite = this.add.image(100, 230, npcTextureKey(this, 'trainer_m')).setScale(2).setAlpha(0).setDepth(5);
    const playerSprite = this.add.image(
      GAME_WIDTH - 100, 280,
      playerBackTextureKey(this, GameState.player.characterId),
    ).setScale(2).setFlipX(true).setAlpha(0).setDepth(5);

    const trainerName = this.add.text(GAME_WIDTH / 4, 340, data.trainerName, {
      fontFamily: FONT, fontSize: '16px', color: '#f0f0f0',
    }).setOrigin(0.5).setAlpha(0).setDepth(5);

    const playerLabel = this.add.text(GAME_WIDTH * 3 / 4, 360, GameState.player.name, {
      fontFamily: FONT, fontSize: '16px', color: '#f5c542',
    }).setOrigin(0.5).setAlpha(0).setDepth(5);

    this.tweens.add({ targets: trainerSprite, alpha: 1, x: 140, duration: 500, delay: 200 });
    this.tweens.add({ targets: trainerName, alpha: 1, duration: 400, delay: 300 });
    this.tweens.add({ targets: playerSprite, alpha: 1, x: GAME_WIDTH - 140, duration: 500, delay: 400 });
    this.tweens.add({ targets: playerLabel, alpha: 1, duration: 400, delay: 500 });

    this.time.delayedCall(holdMs, () => {
      wipeToScene(this, 'Battle', data.battleData, 'right', 320);
    });
  }
}

function darken(c: number, amt: number): number {
  const r = Math.max(0, ((c >> 16) & 0xff) - amt);
  const g = Math.max(0, ((c >> 8) & 0xff) - amt);
  const b = Math.max(0, (c & 0xff) - amt);
  return (r << 16) | (g << 8) | b;
}

export { showExclamationBubble } from '../ui/trainerBubble';
