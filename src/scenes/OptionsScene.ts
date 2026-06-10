import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getOptions, setOptions, type TextSpeed } from '../systems/options';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';

import { loadAudioSettings, saveAudioSettings, type AudioSettings } from '../systems/audioSettings';
import { startMusic, refreshMusicVolume } from '../utils/music';

const SPEEDS: TextSpeed[] = ['slow', 'normal', 'fast'];
const VOL_STEPS = [0, 0.25, 0.5, 0.75, 1];

function volIndex(v: number): number {
  let idx = 0;
  let diff = Infinity;
  VOL_STEPS.forEach((s, i) => {
    const d = Math.abs(s - v);
    if (d < diff) { diff = d; idx = i; }
  });
  return idx;
}

export class OptionsScene extends Phaser.Scene {
  private selected = 0;
  private textSpeed: TextSpeed = 'normal';
  private alwaysRun = false;
  private audio: AudioSettings = loadAudioSettings();
  private optionTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Options');
  }

  create(): void {
    Input.bind(this);
    const opts = getOptions();
    this.textSpeed = opts.textSpeed;
    this.alwaysRun = opts.alwaysRun;
    this.audio = loadAudioSettings();

    buildScreenOverlay(this, 0.65);
    buildMenuPanel(this, 120, 40, 400, 420, 5);

    this.add.text(GAME_WIDTH / 2, 70, 'OPTIONS', {
      fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#f5c542',
    }).setOrigin(0.5);

    this.renderOptions();
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + this.optionCount()) % this.optionCount();
      this.renderOptions();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % this.optionCount();
      this.renderOptions();
    }
    if (Input.justPressed('left') || Input.justPressed('right')) this.adjust();
    if (Input.justPressed('confirm')) {
      if (this.selected === this.optionCount() - 1) this.close();
      else this.adjust();
    }
    if (Input.justPressed('cancel')) this.close();
  }

  private optionCount(): number { return 6; }

  private volLabel(v: number): string {
    return v === 0 ? 'OFF' : `${Math.round(v * 100)}%`;
  }

  private label(): string[] {
    const runLabel = this.alwaysRun ? 'ON' : 'OFF';
    const muteLabel = this.audio.muted ? 'ON' : 'OFF';
    return [
      `Text Speed:  ${this.textSpeed.toUpperCase()}`,
      `Always Run:  ${runLabel}`,
      `Music Vol:   ${this.volLabel(this.audio.music)}`,
      `SFX Vol:     ${this.volLabel(this.audio.sfx)}`,
      `Mute All:    ${muteLabel}`,
      'Back',
    ];
  }

  private renderOptions(): void {
    this.optionTexts.forEach(t => t.destroy());
    this.optionTexts = [];
    this.label().forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 110 + i * 38, (i === this.selected ? '▶ ' : '  ') + opt, {
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
    } else if (this.selected === 2) {
      const idx = volIndex(this.audio.music);
      this.audio.music = VOL_STEPS[(idx + 1) % VOL_STEPS.length];
      saveAudioSettings(this.audio);
      startMusic('overworld');
      refreshMusicVolume();
    } else if (this.selected === 3) {
      const idx = volIndex(this.audio.sfx);
      this.audio.sfx = VOL_STEPS[(idx + 1) % VOL_STEPS.length];
      saveAudioSettings(this.audio);
    } else if (this.selected === 4) {
      this.audio.muted = !this.audio.muted;
      saveAudioSettings(this.audio);
      if (!this.audio.muted) startMusic('overworld');
      refreshMusicVolume();
    }
    this.renderOptions();
  }

  private close(): void {
    Sfx.menuConfirm();
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
