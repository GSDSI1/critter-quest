import { titleStyle, bodyStyle, hintStyle } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../data/types';
import { getBadge } from '../data/badges';
import { GameState } from '../systems/stats';
import { totalSpecies } from '../data/creatures';
import { trySave } from '../utils/saveFeedback';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { canFastTravel } from '../systems/healTravel';
import { loadAudioSettings, saveAudioSettings } from '../systems/audioSettings';
import { refreshMusicVolume } from '../utils/music';
import { TouchMenuNav } from '../ui/touchMenuNav';
import { formatMinigameBests } from '../systems/minigameScores';
import { claimableQuests } from '../data/quests';

const MENU_ICONS: Record<string, string> = {
  Critterdex: '◇',
  Party: '♦',
  Quests: '!',
  'Region Map': '◎',
  Options: '⚙',
  Mute: '♪',
  Unmute: '♪',
  Fly: '✦',
  'Save Game': '💾',
  Close: '×',
};

export class PauseMenuScene extends Phaser.Scene {
  private selected = 0;
  private options: string[] = [];
  private muted = false;
  private touchNav?: TouchMenuNav;

  constructor() {
    super('PauseMenu');
  }

  create(): void {
    Input.bind(this);
    this.muted = loadAudioSettings().muted;
    this.options = this.buildOptions();
    this.selected = Math.min(this.selected, this.options.length - 1);
    buildScreenOverlay(this, 0.65);
    const panel = buildMenuPanel(this, 150, 70, 300, 360, 5);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, x: 170, alpha: 1, duration: 220, ease: 'Back.easeOut' });

    this.add.text(GAME_WIDTH / 2, 110, 'MENU', titleStyle('24px')).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 132, GameState.player.name, bodyStyle('13px', COLORS.textHex)).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 152, `$${GameState.player.money}  |  Badges: ${GameState.player.badges.length}`, hintStyle('11px')).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 164, `Dex: ${GameState.player.dexCaught.length}/${totalSpecies()}  Maps: ${GameState.player.visitedMaps.length}  Signs: ${GameState.player.signsRead}`, hintStyle('10px')).setOrigin(0.5);

    const bests = formatMinigameBests();
    if (bests) {
      this.add.text(GAME_WIDTH / 2, 176, bests, hintStyle('10px')).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, bests ? 188 : 176, `v${import.meta.env.VITE_APP_VERSION ?? '1.0.0'}`, hintStyle('10px')).setOrigin(0.5);

    if (GameState.player.badges.length > 0) {
      GameState.player.badges.forEach((b, i) => {
        const badge = getBadge(b);
        this.add.circle(220 + i * 30, 177, 10, badge.color);
      });
    }

    this.renderOptions();
    this.touchNav = new TouchMenuNav(this, {
      onUp: () => { this.selected = (this.selected - 1 + this.options.length) % this.options.length; this.renderOptions(); },
      onDown: () => { this.selected = (this.selected + 1) % this.options.length; this.renderOptions(); },
      onConfirm: () => this.confirm(),
      onCancel: () => this.close(),
    });
  }

  private buildOptions(): string[] {
    const questMark = claimableQuests(GameState.player).length > 0 ? ' !' : '';
    const opts = ['Critterdex', 'Party', `Quests${questMark}`, 'Region Map', 'Options', this.muted ? 'Unmute' : 'Mute'];
    if (canFastTravel()) opts.push('Fly');
    opts.push('Save Game', 'Close');
    return opts;
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
      const base = opt.replace(/ !/, '');
      const icon = MENU_ICONS[base] ?? MENU_ICONS[opt] ?? '•';
      const t = this.add.text(GAME_WIDTH / 2, 200 + i * 36, (i === this.selected ? '▶ ' : '  ') + `${icon} ${opt}`, bodyStyle('15px', i === this.selected ? COLORS.goldHex : COLORS.bodyHex)).setOrigin(0.5);
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
    } else if (opt.startsWith('Quests')) {
      this.scene.launch('QuestLog');
      this.scene.pause();
    } else if (opt === 'Region Map') {
      this.scene.launch('RegionMap');
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
      this.options = this.buildOptions();
      this.selected = this.options.findIndex(o => o === 'Mute' || o === 'Unmute');
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
