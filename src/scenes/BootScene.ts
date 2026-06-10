import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { generateAssets, ensureAllCreatureTextures } from '../utils/sprites';
import { CREATURES } from '../data/creatures';
import {
  preloadAssetMeta, preloadExternalArt, applyLoadedAssetMeta, isPlaceholderAssets,
} from '../utils/assetLoader';

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadText!: Phaser.GameObjects.Text;

  constructor() {
    super('Boot');
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(0x0f0f1a);
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 160, 'CRITTER QUEST', {
      fontFamily: '"Courier New", monospace', fontSize: '32px', color: '#f5c542',
      stroke: '#e94560', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 195, 'Loading adventure...', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#667788',
    }).setOrigin(0.5);

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(COLORS.panel, 0.9);
    this.progressBox.fillRoundedRect(cx - 170, 280, 340, 28, 6);
    this.progressBox.lineStyle(2, COLORS.panelBorder, 1);
    this.progressBox.strokeRoundedRect(cx - 170, 280, 340, 28, 6);

    this.progressBar = this.add.graphics();
    this.loadText = this.add.text(cx, 320, '0%', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(COLORS.accent, 1);
      this.progressBar.fillRoundedRect(cx - 162, 286, 324 * v, 16, 4);
      this.progressBar.fillStyle(COLORS.gold, 0.4);
      this.progressBar.fillRoundedRect(cx - 162, 286, 324 * v, 4, 2);
      this.loadText.setText(`${Math.floor(v * 100)}%`);
    });

    this.load.on('loaderror', () => { /* fall back to procedural */ });
    preloadAssetMeta(this);
  }

  create(): void {
    applyLoadedAssetMeta(this);

    if (isPlaceholderAssets()) {
      this.finishBoot();
      return;
    }

    this.load.on('complete', () => this.finishBoot());
    preloadExternalArt(this);
    this.load.start();
  }

  private finishBoot(): void {
    applyLoadedAssetMeta(this);
    generateAssets(this);
    ensureAllCreatureTextures(this, Object.keys(CREATURES), id => CREATURES[id]);

    this.loadText.setText('Ready!');
    this.tweens.add({
      targets: this.loadText,
      scale: 1.15,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(350, () => {
      this.scene.start('Intro');
    });
  }
}
