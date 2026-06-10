import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { GameState } from '../systems/stats';
import { getCreature, totalSpecies } from '../data/creatures';
import { getBadge } from '../data/badges';
import { formatPlayTime } from '../ui/titleScreen';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { trySave } from '../utils/saveFeedback';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';

export class VictoryScene extends Phaser.Scene {
  private scrollY = 0;
  private canExit = false;
  private creditTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Victory');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });
    Sfx.levelUp();
    GameState.player.storyFlags.league_ready = true;
    trySave(this);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0f1a, 0x16213e, 0x1a2e1a, 0x0f3460, 1);
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

    const p = GameState.player;
    const leader = p.party[0] ? getCreature(p.party[0].speciesId).name : '—';
    const badgeNames = p.badges.map(b => getBadge(b).name.split(' ')[0]).join(' & ');

    const lines = [
      'CRITTER QUEST',
      '',
      `Congratulations, ${p.name}!`,
      '',
      'You conquered the Verdant Region!',
      `${badgeNames || 'Gym'} Badge${p.badges.length !== 1 ? 's' : ''} earned.`,
      'Rival Kai — final victory!',
      '',
      `Critterdex: ${p.dexCaught.length}/${totalSpecies()} caught`,
      `Partner: ${leader}  ·  $${p.money}`,
      `Play time: ${formatPlayTime(p.playTime)}`,
      '',
      'Thank you for playing!',
      '',
      'Press A / Z to return to title',
    ];

    this.creditTexts = lines.map((line, i) =>
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT + i * 28, line, {
        fontFamily: '"Courier New", monospace',
        fontSize: line === 'CRITTER QUEST' ? '22px' : '13px',
        color: line.startsWith('Congratulations') ? '#f5c542' : '#c0c0c0',
        fontStyle: line === 'CRITTER QUEST' ? 'bold' : 'normal',
      }).setOrigin(0.5),
    );

    this.time.delayedCall(2000, () => { this.canExit = true; });

    this.input.once('pointerdown', () => { this.canExit = true; });
  }

  update(_time: number, delta: number): void {
    Input.update();
    this.scrollY -= delta * 0.04;
    this.creditTexts.forEach((t, i) => {
      t.y = GAME_HEIGHT + i * 28 + this.scrollY;
    });

    if (this.canExit && (Input.justPressed('confirm') || Input.justPressed('cancel'))) {
      Sfx.menuConfirm();
      fadeToScene(this, 'Menu', undefined, 400);
    }
  }
}
