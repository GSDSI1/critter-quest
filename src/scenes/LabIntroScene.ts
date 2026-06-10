import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { DialogBox } from '../ui/DialogBox';
import { npcTextureKey } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import { GameState } from '../systems/stats';
import { Input } from '../systems/input';

export class LabIntroScene extends Phaser.Scene {
  private dialog!: DialogBox;

  constructor() {
    super('LabIntro');
  }

  create(): void {
    Input.bind(this);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f3460, 0x0f3460, 0x1a2e1a, 0x16213e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.35);
    panel.fillRoundedRect(40, 40, GAME_WIDTH - 80, GAME_HEIGHT - 80, 12);

    this.add.image(140, 200, npcTextureKey(this, 'prof')).setScale(4.5);
    const frame = this.add.graphics();
    frame.lineStyle(3, COLORS.gold, 1);
    frame.strokeRoundedRect(80, 100, 120, 160, 8);

    this.add.text(300, 90, 'Prof. Elmwood', {
      fontFamily: '"Courier New", monospace', fontSize: '22px', color: '#f5c542',
    });
    this.add.text(300, 118, 'Verdant Region Research Lab', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    });

    const name = GameState.player.name || 'Trainer';
    this.add.text(300, 150, `Trainer ${name}`, {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
    });
    this.add.sprite(520, 200, playerTextureKey(GameState.player.characterId, 'down', 0)).setScale(3.5);

    this.dialog = new DialogBox(this);

    this.dialog.show([
      `Welcome to the world of Critter Quest, ${name}!`,
      'This region has 27 unique critter species waiting to be discovered.',
      'Your rival Kai is already out training — you\'ll cross paths soon.',
      `${name}, follow me to the starter table!`,
    ], () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('StarterSelect'));
    });
  }

  update(): void {
    Input.update();
    if (this.dialog.isShowing()) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
      return;
    }
  }
}
