import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { creatureTextureKey } from '../utils/assetLoader';
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
      const spr = this.add.image(-80, 280 + i * 8, creatureTextureKey(this, id)).setScale(2.2).setAlpha(0);
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

    const sparkbit = this.add.image(GAME_WIDTH + 60, 300, creatureTextureKey(this, 'sparkbit', true)).setScale(2).setAlpha(0);
    this.tweens.add({
      targets: sparkbit, x: GAME_WIDTH - 80, alpha: 1, duration: 800, delay: 1000, ease: 'Quad.easeOut',
    });

    this.time.delayedCall(1400, () => Sfx.introJingle());

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'v1.0  ·  Verdant Region', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#556677',
    }).setOrigin(0.5);

    addBlinkingPrompt(this, 'Press  A / Z  or  Start  to begin', GAME_HEIGHT - 48);

    // Always skippable after 600ms — don't rely on tween onComplete (tab focus / stacked builds)
    this.time.delayedCall(600, () => { this.canSkip = true; });

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
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => this.scene.start('Menu'));
  }
}
