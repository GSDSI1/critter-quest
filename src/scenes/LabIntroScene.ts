import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { DialogBox } from '../ui/DialogBox';
import { buildLabInterior } from '../ui/sceneBackdrops';
import { npcTextureKey } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import { GameState } from '../systems/stats';
import { Input } from '../systems/input';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';

export class LabIntroScene extends Phaser.Scene {
  private dialog!: DialogBox;
  private profSprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Sprite;

  constructor() {
    super('LabIntro');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });

    buildLabInterior(this);

    const name = GameState.player.name || 'Trainer';

    this.profSprite = this.add.image(130, 250, npcTextureKey(this, 'prof')).setScale(2.2);
    const frame = this.add.graphics();
    frame.lineStyle(3, COLORS.gold, 0.9);
    frame.strokeRoundedRect(70, 170, 120, 140, 8);
    frame.fillStyle(0x000000, 0.15);
    frame.fillRoundedRect(70, 170, 120, 140, 8);

    this.add.text(280, 100, 'Prof. Elmwood', {
      fontFamily: FONT, fontSize: '24px', color: '#f5c542',
    });
    this.add.text(280, 128, 'Verdant Region Research Lab', {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
    });
    this.add.text(280, 158, `Trainer ${name}`, {
      fontFamily: FONT, fontSize: '15px', color: '#f0f0f0',
    });

    this.playerSprite = this.add.sprite(500, 260, playerTextureKey(this,GameState.player.characterId, 'down', 0)).setScale(2.5);
    this.tweens.add({
      targets: [this.profSprite, this.playerSprite],
      y: '-=4',
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.dialog = new DialogBox(this);
    this.dialog.show([
      `Welcome to the world of Critter Quest, ${name}!`,
      'This region has 27 unique critter species waiting to be discovered.',
      'Your rival Kai is already out training — you\'ll cross paths soon.',
      `${name}, follow me to the starter table!`,
    ], () => fadeToScene(this, 'StarterSelect', undefined, 300), 'Prof. Elmwood');
  }

  update(): void {
    Input.update();
    if (this.dialog.isShowing()) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
    }
  }
}
