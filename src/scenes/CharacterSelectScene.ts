import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { TRAINER_PRESETS } from '../data/characters';
import { GameState } from '../systems/stats';
import { playerTextureKey } from '../utils/sprites';
import { buildTitleBackdrop, addBlinkingPrompt } from '../ui/titleScreen';
import { buildMenuPanel } from '../ui/sceneBackdrops';
import { createTouchButton } from '../ui/touchButtons';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';

export class CharacterSelectScene extends Phaser.Scene {
  private selected = 0;
  private nameText = '';
  private preview!: Phaser.GameObjects.Sprite;
  private labelText!: Phaser.GameObjects.Text;
  private nameDisplay!: Phaser.GameObjects.Text;
  private dots: Phaser.GameObjects.Text[] = [];
  private walkFrame = 0;
  private walkTimer = 0;
  private leftArrow!: Phaser.GameObjects.Text;
  private rightArrow!: Phaser.GameObjects.Text;

  constructor() {
    super('CharacterSelect');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });
    this.selected = 0;
    this.nameText = '';

    buildTitleBackdrop(this);

    buildMenuPanel(this, 40, 24, GAME_WIDTH - 80, GAME_HEIGHT - 48, 5);

    this.add.text(GAME_WIDTH / 2, 48, 'Who are you?', {
      fontFamily: '"Courier New", monospace', fontSize: '26px', color: '#f5c542',
    }).setOrigin(0.5).setDepth(10);

    this.add.text(GAME_WIDTH / 2, 78, 'Pick your trainer · Enter your name', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5).setDepth(10);

    const previewBox = this.add.graphics().setDepth(10);
    previewBox.fillStyle(0x000000, 0.35);
    previewBox.fillRoundedRect(GAME_WIDTH / 2 - 90, 100, 180, 180, 10);
    previewBox.lineStyle(2, COLORS.panelBorder, 1);
    previewBox.strokeRoundedRect(GAME_WIDTH / 2 - 90, 100, 180, 180, 10);

    this.preview = this.add.sprite(GAME_WIDTH / 2, 195, playerTextureKey('scout', 'down', 0)).setScale(5).setDepth(11);

    this.leftArrow = this.add.text(GAME_WIDTH / 2 - 130, 195, '◀', {
      fontFamily: 'Arial', fontSize: '22px', color: '#667788',
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    this.rightArrow = this.add.text(GAME_WIDTH / 2 + 130, 195, '▶', {
      fontFamily: 'Arial', fontSize: '22px', color: '#667788',
    }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
    this.leftArrow.on('pointerdown', () => this.cycle(-1));
    this.rightArrow.on('pointerdown', () => this.cycle(1));

    this.labelText = this.add.text(GAME_WIDTH / 2, 300, '', {
      fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f0f0f0',
    }).setOrigin(0.5).setDepth(10);

    TRAINER_PRESETS.forEach((_, i) => {
      const dot = this.add.text(GAME_WIDTH / 2 - 24 + i * 16, 325, '●', {
        fontFamily: 'Arial', fontSize: '10px', color: '#667788',
      }).setOrigin(0.5).setDepth(10);
      this.dots.push(dot);
    });

    this.add.text(GAME_WIDTH / 2, 355, 'Your name', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5).setDepth(10);

    const nameBox = this.add.graphics().setDepth(10);
    nameBox.fillStyle(0x000000, 0.4);
    nameBox.fillRoundedRect(GAME_WIDTH / 2 - 100, 368, 200, 36, 6);
    nameBox.lineStyle(1, COLORS.panelBorder, 1);
    nameBox.strokeRoundedRect(GAME_WIDTH / 2 - 100, 368, 200, 36, 6);

    this.nameDisplay = this.add.text(GAME_WIDTH / 2, 386, '', {
      fontFamily: '"Courier New", monospace', fontSize: '20px', color: '#f5c542',
    }).setOrigin(0.5).setDepth(10);

    addBlinkingPrompt(this, 'Type name · tap Confirm or press Z', GAME_HEIGHT - 52);

    createTouchButton(this, GAME_WIDTH / 2 - 120, 430, '◀', () => this.cycle(-1), { width: 52, depth: 12 });
    createTouchButton(this, GAME_WIDTH / 2, 430, 'Confirm', () => this.confirm(), { width: 110, depth: 12 });
    createTouchButton(this, GAME_WIDTH / 2 + 120, 430, '▶', () => this.cycle(1), { width: 52, depth: 12 });

    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Backspace') {
        this.nameText = this.nameText.slice(0, -1);
        this.refreshName();
      } else if (ev.key === 'Enter') {
        this.confirm();
      } else if (ev.key.length === 1 && this.nameText.length < 10 && ev.key !== 'Enter') {
        this.nameText += ev.key;
        this.refreshName();
      }
    });

    this.refresh();
  }

  update(_time: number, delta: number): void {
    Input.update();
    if (Input.justPressed('cancel')) {
      fadeToScene(this, 'Menu', undefined, 300);
      return;
    }
    if (Input.justPressed('left')) this.cycle(-1);
    if (Input.justPressed('right')) this.cycle(1);
    if (Input.justPressed('confirm')) this.confirm();

    this.walkTimer += delta;
    if (this.walkTimer >= 250) {
      this.walkTimer = 0;
      this.walkFrame = 1 - this.walkFrame;
      const preset = TRAINER_PRESETS[this.selected];
      this.preview.setTexture(playerTextureKey(preset.id, 'down', this.walkFrame));
    }
  }

  private cycle(dir: number): void {
    this.selected = (this.selected + dir + TRAINER_PRESETS.length) % TRAINER_PRESETS.length;
    Sfx.menuSelect();
    this.tweens.add({
      targets: this.preview, scaleX: 5.3, scaleY: 4.7, duration: 80, yoyo: true,
    });
    this.refresh();
  }

  private refresh(): void {
    const preset = TRAINER_PRESETS[this.selected];
    this.preview.setTexture(playerTextureKey(preset.id, 'down', this.walkFrame));
    this.labelText.setText(preset.label);
    this.dots.forEach((d, i) => d.setColor(i === this.selected ? '#f5c542' : '#667788'));
    this.leftArrow.setColor('#f5c542');
    this.rightArrow.setColor('#f5c542');
    this.refreshName();
  }

  private refreshName(): void {
    const display = this.nameText.length > 0 ? this.nameText : '';
    this.nameDisplay.setText(display.length > 0 ? `${display}_` : 'Trainer_');
  }

  private confirm(): void {
    Sfx.menuConfirm();
    const preset = TRAINER_PRESETS[this.selected];
    GameState.player.characterId = preset.id;
    GameState.player.name = this.nameText.trim() || 'Trainer';
    fadeToScene(this, 'LabIntro', undefined, 400);
  }
}
