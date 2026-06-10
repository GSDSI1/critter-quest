import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { addCreatureImage } from '../utils/assetLoader';
import { fadeToScene } from '../ui/transitions';
import { buildTitleBackdrop, addTitleLogo, addBlinkingPrompt } from '../ui/titleScreen';
import { Input } from '../systems/input';
import { Sfx, resumeAudio } from '../utils/audio';

export class IntroScene extends Phaser.Scene {
  private canSkip = false;
  private skipping = false;

  constructor() {
    super('Intro');
  }

  create(): void {
    resumeAudio();
    Input.bind(this);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    buildTitleBackdrop(this);
    const logo = addTitleLogo(this, 100);
    logo.setAlpha(0).setScale(0.6);
    this.tweens.add({
      targets: logo, alpha: 1, scale: 1, duration: 900, ease: 'Back.easeOut',
      onComplete: () => Sfx.menuConfirm(),
    });

    const tagline = this.add.text(GAME_WIDTH / 2, 155, 'Catch · Battle · Explore', {
      fontFamily: '"Courier New", monospace', fontSize: '15px', color: '#8899aa',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: tagline, alpha: 1, duration: 500, delay: 600 });

    const starters = ['emberpup', 'aqualet', 'leafkit'];
    starters.forEach((id, i) => {
      const spr = addCreatureImage(this, -80, 280 + i * 8, id).setScale(2.2).setAlpha(0);
      this.tweens.add({
        targets: spr,
        x: 120 + i * 200,
        alpha: 1,
        duration: 700,
        delay: 400 + i * 180,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: spr, y: spr.y - 10,
            duration: 1000 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
          });
        },
      });
    });

    const sparkbit = addCreatureImage(this, GAME_WIDTH + 60, 300, 'sparkbit', true).setScale(2).setAlpha(0);
    this.tweens.add({
      targets: sparkbit, x: GAME_WIDTH - 80, alpha: 1, duration: 800, delay: 1000, ease: 'Quad.easeOut',
    });

    this.time.delayedCall(1400, () => Sfx.introJingle());

    for (let i = 0; i < 12; i++) {
      const spark = this.add.circle(
        Phaser.Math.Between(80, GAME_WIDTH - 80),
        Phaser.Math.Between(60, 200),
        2, 0xf5c542, 0,
      );
      this.tweens.add({
        targets: spark, alpha: 0.8, duration: 600 + i * 80, yoyo: true, repeat: -1,
      });
    }

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'v1.0  ·  Verdant Region', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#556677',
    }).setOrigin(0.5);

    addBlinkingPrompt(this, 'Press  A / Z  or  Start  to begin', GAME_HEIGHT - 48);

    // Always skippable after 600ms — don't rely on tween onComplete (tab focus / stacked builds)
    this.time.delayedCall(600, () => { this.canSkip = true; });
    // Auto-advance if the tab opened in the background and no input arrives
    this.time.delayedCall(3500, () => { if (!this.skipping) this.goToMenu(); });

    this.input.once('pointerdown', () => this.goToMenu());
  }

  update(): void {
    Input.update();
    if (this.canSkip && !this.skipping && (Input.justPressed('confirm') || Input.justPressed('pause') || Input.justPressed('cancel'))) {
      this.goToMenu();
    }
  }

  private goToMenu(): void {
    if (this.skipping) return;
    this.skipping = true;
    Sfx.menuConfirm();
    fadeToScene(this, 'Menu', undefined, 400);
  }
}
