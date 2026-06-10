import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { getCreature, totalSpecies } from '../data/creatures';
import { getBadge } from '../data/badges';
import { GameState, displayName } from '../systems/stats';
import { formatPlayTime } from '../ui/titleScreen';
import { creatureTextureKey } from '../utils/assetLoader';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { trySave } from '../utils/saveFeedback';

export class HallOfFameScene extends Phaser.Scene {
  private canExit = false;

  constructor() {
    super('HallOfFame');
  }

  create(): void {
    Input.bind(this);
    Sfx.levelUp();
    GameState.player.storyFlags.champion = true;
    if (GameState.player.completionTime == null) {
      GameState.player.completionTime = GameState.player.playTime;
    }
    trySave(this);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f172a, 0x1e1b4b, 0x312e81, 0x0f3460, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, 36, 'HALL OF FAME', {
      fontFamily: '"Courier New", monospace', fontSize: '26px', color: '#f5c542', fontStyle: 'bold',
    }).setOrigin(0.5);

    const p = GameState.player;
    this.add.text(GAME_WIDTH / 2, 68, `${p.name} — Regional Champion`, {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
    }).setOrigin(0.5);

    const badgeLine = p.badges.map(b => getBadge(b).name.split(' ')[0]).join(' · ');
    this.add.text(GAME_WIDTH / 2, 88, badgeLine || 'No badges', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.add.text(40, 110, 'Champion Party', {
      fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#f5c542',
    });

    p.party.forEach((c, i) => {
      const def = getCreature(c.speciesId);
      const y = 130 + i * 72;
      if (this.textures.exists(creatureTextureKey(this, c.speciesId))) {
        this.add.image(70, y + 20, creatureTextureKey(this, c.speciesId)).setScale(2);
      }
      this.add.text(110, y, displayName(c), {
        fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
      });
      this.add.text(110, y + 18, `Lv.${c.level}  ${def.types.map(t => TYPE_NAMES[t]).join('/')}`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
      });
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, [
      `Dex: ${p.dexCaught.length}/${totalSpecies()}  ·  $${p.money}`,
      `Play time: ${formatPlayTime(p.playTime)}`,
      p.completionTime != null ? `Champion run: ${formatPlayTime(p.completionTime)}` : '',
      '',
      'Thank you for playing Critter Quest!',
    ].join('\n'), {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#c0c0c0', align: 'center',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, 'Press A / Z to return to title', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => { this.canExit = true; });
    this.input.once('pointerdown', () => { this.canExit = true; });
  }

  update(): void {
    Input.update();
    if (this.canExit && (Input.justPressed('confirm') || Input.justPressed('cancel'))) {
      Sfx.menuConfirm();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('Menu'));
    }
  }
}
