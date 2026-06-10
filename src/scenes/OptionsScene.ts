import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getOptions, setOptions, type TextSpeed } from '../systems/options';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';

const SPEEDS: TextSpeed[] = ['slow', 'normal', 'fast'];

export class OptionsScene extends Phaser.Scene {
  private selected = 0;
  private textSpeed: TextSpeed = 'normal';
  private alwaysRun = false;
  private optionTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Options');
  }

  create(): void {
    Input.bind(this);
    const opts = getOptions();
    this.textSpeed = opts.textSpeed;
    this.alwaysRun = opts.alwaysRun;

    buildScreenOverlay(this, 0.65);
    buildMenuPanel(this, 120, 60, 400, 360, 5);

    this.add.text(GAME_WIDTH / 2, 90, 'OPTIONS', {
      fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#f5c542',
    }).setOrigin(0.5);

    this.renderOptions();
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + 3) % 3;
      this.renderOptions();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % 3;
      this.renderOptions();
    }
    if (Input.justPressed('left') || Input.justPressed('right')) this.adjust();
    if (Input.justPressed('confirm')) {
      if (this.selected === 2) this.close();
      else this.adjust();
    }
    if (Input.justPressed('cancel')) this.close();
  }

  private label(): string[] {
    const runLabel = this.alwaysRun ? 'ON' : 'OFF';
    return [
      `Text Speed:  ${this.textSpeed.toUpperCase()}`,
      `Always Run:  ${runLabel}`,
      'Back',
    ];
  }

  private renderOptions(): void {
    this.optionTexts.forEach(t => t.destroy());
    this.optionTexts = [];
    this.label().forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 150 + i * 44, (i === this.selected ? '▶ ' : '  ') + opt, {
        fontFamily: '"Courier New", monospace', fontSize: '16px',
        color: i === this.selected ? '#f5c542' : '#c0c0c0',
      }).setOrigin(0.5);
      this.optionTexts.push(t);
    });
  }

  private adjust(): void {
    Sfx.menuConfirm();
    if (this.selected === 0) {
      const idx = SPEEDS.indexOf(this.textSpeed);
      this.textSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
      setOptions({ textSpeed: this.textSpeed });
    } else if (this.selected === 1) {
      this.alwaysRun = !this.alwaysRun;
      setOptions({ alwaysRun: this.alwaysRun });
    }
    this.renderOptions();
  }

  private close(): void {
    Sfx.menuConfirm();
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
