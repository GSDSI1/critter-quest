import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../data/types';
import { generateAssets, ensureAllCreatureTextures } from '../utils/sprites';
import { CREATURES } from '../data/creatures';
import {
  preloadAssetMeta, preloadBootArt, applyLoadedAssetMeta, isPlaceholderAssets,
} from '../utils/assetLoader';
import { initOptions } from '../systems/options';
import { bindAudioScene } from '../utils/audio';
import { bindMusicScene } from '../utils/music';

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
      fontFamily: FONT, fontSize: '32px', color: '#f5c542',
      stroke: '#e94560', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 195, `Loading adventure... v${import.meta.env.VITE_APP_VERSION ?? '1.0.0'}`, {
      fontFamily: FONT, fontSize: '12px', color: '#667788',
    }).setOrigin(0.5);

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(COLORS.panel, 0.9);
    this.progressBox.fillRoundedRect(cx - 170, 280, 340, 28, 6);
    this.progressBox.lineStyle(2, COLORS.panelBorder, 1);
    this.progressBox.strokeRoundedRect(cx - 170, 280, 340, 28, 6);

    this.progressBar = this.add.graphics();
    this.loadText = this.add.text(cx, 320, '0%', {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
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
      void this.finishBoot();
      return;
    }

    this.load.on('complete', () => { void this.finishBoot(); });
    preloadBootArt(this);
    this.load.start();
  }

  private setBootStatus(label: string, progress: number): void {
    const cx = GAME_WIDTH / 2;
    this.loadText.setText(label);
    this.progressBar.clear();
    this.progressBar.fillStyle(COLORS.accent, 1);
    this.progressBar.fillRoundedRect(cx - 162, 286, 324 * progress, 16, 4);
    this.progressBar.fillStyle(COLORS.gold, 0.4);
    this.progressBar.fillRoundedRect(cx - 162, 286, 324 * progress, 4, 2);
  }

  private async finishBoot(): Promise<void> {
    const t0 = import.meta.env.DEV ? performance.now() : 0;
    initOptions();
    bindAudioScene(this);
    bindMusicScene(this);
    this.setBootStatus('Preparing options…', 0.15);
    applyLoadedAssetMeta(this);
    this.setBootStatus('Drawing world tiles…', 0.35);
    generateAssets(this);
    this.setBootStatus('Creating critters…', 0.55);
    ensureAllCreatureTextures(this, Object.keys(CREATURES), id => CREATURES[id]);
    this.setBootStatus('Loading scenes…', 0.75);
    if (import.meta.env.DEV) {
      console.info(`[Critter Quest] Boot finished in ${Math.round(performance.now() - t0)}ms`);
    }

    this.setBootStatus('Ready!', 1);
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
