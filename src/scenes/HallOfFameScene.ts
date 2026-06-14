import { titleStyle, bodyStyle, hintStyle } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { getCreature, totalSpecies } from '../data/creatures';
import { getBadge } from '../data/badges';
import { GameState, displayName } from '../systems/stats';
import { formatPlayTime } from '../ui/titleScreen';
import { addCreatureImage, hasCreatureGraphic } from '../utils/assetLoader';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { trySave } from '../utils/saveFeedback';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';

export class HallOfFameScene extends Phaser.Scene {
  private canExit = false;
  private scrollY = 0;
  private creditBlock!: Phaser.GameObjects.Text;

  constructor() {
    super('HallOfFame');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });
    Sfx.levelUp();
    GameState.player.storyFlags.champion = true;
    if (GameState.player.completionTime == null) {
      GameState.player.completionTime = GameState.player.playTime;
    }
    trySave(this);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x1e1b4b, 0x312e81, 0x0f3460, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.6),
      );
      this.tweens.add({
        targets: star, alpha: 0.05, duration: Phaser.Math.Between(800, 2200), yoyo: true, repeat: -1,
      });
    }

    for (let i = 0; i < 24; i++) {
      const c = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT / 2),
        4, 4,
        Phaser.Math.RND.pick([0xf5c542, 0xf472b6, 0x67e8f9, 0x4ade80]),
        0.8,
      );
      this.tweens.add({
        targets: c,
        y: c.y + 120,
        alpha: 0,
        duration: Phaser.Math.Between(1200, 2400),
        repeat: -1,
        delay: Phaser.Math.Between(0, 800),
      });
    }

    this.add.text(GAME_WIDTH / 2, 36, 'HALL OF FAME', titleStyle('26px')).setOrigin(0.5);

    const p = GameState.player;
    this.add.text(GAME_WIDTH / 2, 68, `${p.name} — Regional Champion`, bodyStyle('14px', COLORS.textHex)).setOrigin(0.5);

    const badgeLine = p.badges.map(b => getBadge(b).name.split(' ')[0]).join(' · ');
    this.add.text(GAME_WIDTH / 2, 88, badgeLine || 'No badges', hintStyle('11px')).setOrigin(0.5);

    this.add.text(40, 110, 'Champion Party', titleStyle('13px'));

    p.party.forEach((c, i) => {
      const def = getCreature(c.speciesId);
      const y = 130 + i * 72;
      if (hasCreatureGraphic(this, c.speciesId)) {
        addCreatureImage(this, 70, y + 20, c.speciesId).setScale(2);
      }
      this.add.text(110, y, displayName(c), bodyStyle('14px', COLORS.textHex));
      this.add.text(110, y + 18, `Lv.${c.level}  ${def.types.map(t => TYPE_NAMES[t]).join('/')}`, hintStyle('11px'));
    });

    this.creditBlock = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, [
      `Dex: ${p.dexCaught.length}/${totalSpecies()}  ·  $${p.money}`,
      `Play time: ${formatPlayTime(p.playTime)}`,
      p.completionTime != null ? `Champion run: ${formatPlayTime(p.completionTime)}` : '',
      '',
      'Thank you for playing Critter Quest!',
    ].join('\n'), bodyStyle('12px', COLORS.bodyHex)).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Press A / Z to return to title', hintStyle('11px')).setOrigin(0.5);

    this.time.delayedCall(800, () => { this.canExit = true; });
  }

  update(_time: number, delta: number): void {
    Input.update();
    this.scrollY += delta * 0.012;
    if (this.creditBlock) this.creditBlock.y = GAME_HEIGHT - 72 - this.scrollY * 0.3;
    if (this.canExit && Input.justPressed('confirm')) {
      fadeToScene(this, 'Menu', {}, 400);
    }
  }
}
