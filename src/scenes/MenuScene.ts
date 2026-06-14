import { titleStyle, bodyStyle, hintStyle } from '../ui/theme';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { GameState } from '../systems/stats';
import { loadGame, deleteSave, getSaveStatus } from '../systems/save';
import { getMap } from '../data/maps';
import { getCreature } from '../data/creatures';
import { getTrainer } from '../data/characters';
import { addCreatureImage, preloadAllRemainingCreatures, startCritterIdle, type CritterIdleHandle } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import {
  buildTitleBackdrop, addTitleLogo, addBlinkingPrompt,
  drawSaveSummaryPanel, formatPlayTime,
} from '../ui/titleScreen';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { prefetchScenes } from './registerScenes';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';
import { buildMenuPanel } from '../ui/sceneBackdrops';

export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private menuItems: { label: string; btn: Phaser.GameObjects.Image; text: Phaser.GameObjects.Text }[] = [];
  private canContinue = false;
  private labels: string[] = [];
  private confirmingDelete = false;
  private deleteSelected = 0;
  private deleteOverlay?: Phaser.GameObjects.Container;
  private titleIdles: CritterIdleHandle[] = [];

  constructor() {
    super('Menu');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });
    this.confirmingDelete = false;
    prefetchScenes(this.game, ['CharacterSelect', 'Overworld']);
    void preloadAllRemainingCreatures(this);

    const saveStatus = getSaveStatus();
    if (saveStatus === 'corrupt') {
      this.canContinue = false;
      this.labels = ['New Game', 'Delete Corrupt Save'];
      this.selected = 0;
      this.buildMenu(saveStatus);
      return;
    }

    this.canContinue = saveStatus === 'valid' && loadGame();
    this.labels = this.canContinue ? ['Continue', 'New Game', 'Delete Save'] : ['New Game'];
    this.selected = 0;
    this.buildMenu(saveStatus);
  }

  private buildMenu(saveStatus: ReturnType<typeof getSaveStatus>): void {
    buildTitleBackdrop(this);
    addTitleLogo(this, 88);

    this.add.text(GAME_WIDTH / 2, 138, 'Catch · Battle · Explore', hintStyle('12px')).setOrigin(0.5);

    if (saveStatus === 'corrupt') {
      this.add.text(GAME_WIDTH / 2, 200, 'Save file is corrupted.\nDelete it to start fresh.', {
        ...bodyStyle('12px', '#e94560'),
        align: 'center',
      }).setOrigin(0.5);
    } else if (this.canContinue) {
      this.showSaveSummary();
    } else {
      this.titleIdles.forEach(h => h.stop());
      this.titleIdles = [];
      ['emberpup', 'aqualet', 'leafkit'].forEach((id, i) => {
        const spr = addCreatureImage(this, GAME_WIDTH / 2 - 100 + i * 100, 200, id, true).setScale(2);
        this.titleIdles.push(startCritterIdle(this, spr, id, 200));
      });
    }

    this.menuItems = [];
    const menuStartY = this.canContinue ? 300 : 260;
    this.labels.forEach((label, i) => {
      const y = menuStartY + i * 48;
      const btn = this.add.image(GAME_WIDTH / 2, y, 'btn_normal').setOrigin(0.5).setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, label, bodyStyle('18px', '#f0f0f0')).setOrigin(0.5);
      btn.on('pointerover', () => {
        if (!this.confirmingDelete) {
          this.selected = i;
          this.refreshMenu();
          btn.setTexture('btn_hover');
        }
      });
      btn.on('pointerout', () => { if (i !== this.selected) btn.setTexture('btn_normal'); });
      btn.on('pointerdown', () => { if (!this.confirmingDelete) { this.selected = i; this.confirm(); } });
      this.menuItems.push({ label, btn, text });
    });

    addBlinkingPrompt(this, '↑↓ select  ·  A / Z confirm', GAME_HEIGHT - 36);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'Keyboard · Controller supported', hintStyle('10px')).setOrigin(0.5);

    this.refreshMenu();
  }

  private showSaveSummary(): void {
    const p = GameState.player;
    const mapName = getMap(p.mapId).name;
    const leader = p.party[0] ? getCreature(p.party[0].speciesId).name : '—';
    const badges = p.badges.length;

    drawSaveSummaryPanel(this, GAME_WIDTH / 2, 168, [
      p.name,
      `${mapName}  ·  ${formatPlayTime(p.playTime)}`,
      `Leader: ${leader}  ·  Badges: ${badges}  ·  $${p.money}`,
    ]);

    this.add.sprite(520, 210, playerTextureKey(this,p.characterId, 'down', 0)).setScale(3);
    const preset = getTrainer(p.characterId);
    this.add.text(520, 248, preset.label, hintStyle('10px')).setOrigin(0.5);
  }

  update(): void {
    Input.update();
    if (this.confirmingDelete) {
      if (Input.justPressed('left') || Input.justPressed('right')) {
        this.deleteSelected = 1 - this.deleteSelected;
        this.refreshDeleteDialog();
      }
      if (Input.justPressed('confirm')) {
        if (this.deleteSelected === 0) {
          deleteSave();
          GameState.reset();
          this.scene.restart();
        } else {
          this.closeDeleteDialog();
        }
      }
      if (Input.justPressed('cancel')) this.closeDeleteDialog();
      return;
    }

    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + this.labels.length) % this.labels.length;
      Sfx.menuSelect();
      this.refreshMenu();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % this.labels.length;
      Sfx.menuSelect();
      this.refreshMenu();
    }
    if (Input.justPressed('confirm')) this.confirm();
  }

  private refreshMenu(): void {
    this.menuItems.forEach((item, i) => {
      const sel = i === this.selected;
      item.btn.setTexture(sel ? 'btn_selected' : 'btn_normal');
      if (sel) item.btn.setScale(1.04);
      else item.btn.setScale(1);
      item.text.setColor(sel ? '#f5c542' : '#c0c0c0');
      item.text.setText(sel ? `▶  ${item.label}` : item.label);
    });
  }

  private confirm(): void {
    Sfx.menuConfirm();
    const choice = this.labels[this.selected];
    if (choice === 'Continue') {
      fadeToScene(this, 'Overworld', undefined, 300);
    } else if (choice === 'New Game') {
      GameState.reset();
      fadeToScene(this, 'CharacterSelect', undefined, 300);
    } else if (choice === 'Delete Save' || choice === 'Delete Corrupt Save') {
      this.openDeleteDialog();
    }
  }

  private openDeleteDialog(): void {
    this.confirmingDelete = true;
    this.deleteSelected = 1;
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT));

    const panel = buildMenuPanel(this, GAME_WIDTH / 2 - 160, 180, 320, 120, 101);
    panel.setScale(0.85);
    overlay.add(panel);
    this.tweens.add({ targets: panel, scale: 1, duration: 200, ease: 'Back.easeOut' });

    overlay.add(this.add.text(GAME_WIDTH / 2, 210, 'Delete save file?', titleStyle('16px')).setOrigin(0.5));

    overlay.add(this.add.text(GAME_WIDTH / 2 - 60, 250, 'Yes', bodyStyle('14px', '#8899aa')).setOrigin(0.5).setName('delYes'));

    overlay.add(this.add.text(GAME_WIDTH / 2 + 60, 250, 'No', bodyStyle('14px', '#8899aa')).setOrigin(0.5).setName('delNo'));

    this.deleteOverlay = overlay;
    this.refreshDeleteDialog();
  }

  private refreshDeleteDialog(): void {
    if (!this.deleteOverlay) return;
    const yes = this.deleteOverlay.getByName('delYes') as Phaser.GameObjects.Text;
    const no = this.deleteOverlay.getByName('delNo') as Phaser.GameObjects.Text;
    yes.setColor(this.deleteSelected === 0 ? '#f5c542' : '#8899aa');
    yes.setText(this.deleteSelected === 0 ? '▶ Yes' : 'Yes');
    no.setColor(this.deleteSelected === 1 ? '#f5c542' : '#8899aa');
    no.setText(this.deleteSelected === 1 ? '▶ No' : 'No');
  }

  private closeDeleteDialog(): void {
    this.confirmingDelete = false;
    this.deleteOverlay?.destroy();
    this.deleteOverlay = undefined;
  }
}
