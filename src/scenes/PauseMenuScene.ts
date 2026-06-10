import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getBadge } from '../data/badges';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { canFastTravel } from '../systems/healTravel';
import { loadAudioSettings, saveAudioSettings } from '../systems/audioSettings';
import { refreshMusicVolume } from '../utils/music';

export class PauseMenuScene extends Phaser.Scene {
  private selected = 0;
  private options: string[] = [];
  private muted = false;

  constructor() {
    super('PauseMenu');
  }

  create(): void {
    Input.bind(this);
    this.muted = loadAudioSettings().muted;
    this.options = ['Critterdex', 'Party', 'Options'];
    this.options.push(this.muted ? 'Unmute' : 'Mute');
    if (canFastTravel()) this.options.push('Fly');
    this.options.push('Save Game', 'Close');
    this.selected = Math.min(this.selected, this.options.length - 1);
    buildScreenOverlay(this, 0.65);
    buildMenuPanel(this, 170, 70, 300, 360, 5);

    this.add.text(GAME_WIDTH / 2, 110, 'MENU', {
      fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#f5c542',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 132, GameState.player.name, {
      fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 152, `$${GameState.player.money}  |  Badges: ${GameState.player.badges.length}`, {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 168, `v${import.meta.env.VITE_APP_VERSION ?? '1.0.0'}`, {
      fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#556677',
    }).setOrigin(0.5);

    if (GameState.player.badges.length > 0) {
      GameState.player.badges.forEach((b, i) => {
        const badge = getBadge(b);
        this.add.circle(220 + i * 30, 177, 10, badge.color);
      });
    }

    this.renderOptions();
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + this.options.length) % this.options.length;
      this.renderOptions();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % this.options.length;
      this.renderOptions();
    }
    if (Input.justPressed('confirm')) this.confirm();
    if (Input.justPressed('cancel')) this.close();
  }

  private optionTexts: Phaser.GameObjects.Text[] = [];

  private renderOptions(): void {
    this.optionTexts.forEach(t => t.destroy());
    this.optionTexts = [];
    this.options.forEach((opt, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 200 + i * 40, (i === this.selected ? '▶ ' : '  ') + opt, {
        fontFamily: '"Courier New", monospace', fontSize: '16px',
        color: i === this.selected ? '#f5c542' : '#c0c0c0',
      }).setOrigin(0.5);
      this.optionTexts.push(t);
    });
  }

  private confirm(): void {
    Sfx.menuConfirm();
    const opt = this.options[this.selected];
    if (opt === 'Critterdex') {
      this.scene.launch('Critterdex', { fromPause: true });
      this.scene.pause();
    } else if (opt === 'Party') {
      this.scene.launch('Party', { fromPause: true });
      this.scene.pause();
    } else if (opt === 'Options') {
      this.scene.launch('Options');
      this.scene.pause();
    } else if (opt === 'Mute' || opt === 'Unmute') {
      const settings = loadAudioSettings();
      settings.muted = !settings.muted;
      saveAudioSettings(settings);
      refreshMusicVolume();
      this.muted = settings.muted;
      this.options = ['Critterdex', 'Party', 'Options', this.muted ? 'Unmute' : 'Mute'];
      if (canFastTravel()) this.options.push('Fly');
      this.options.push('Save Game', 'Close');
      this.selected = 3;
      this.renderOptions();
    } else if (opt === 'Fly') {
      this.scene.launch('FastTravel', { fromPause: true });
      this.scene.pause();
    } else if (opt === 'Save Game') {
      trySave(this);
      this.close();
    } else {
      this.close();
    }
  }

  close(): void {
    this.scene.stop();
    this.scene.resume('Overworld');
  }
}
