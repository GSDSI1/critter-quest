import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { GameState } from '../systems/stats';
import { loadGame, deleteSave, getSaveStatus } from '../systems/save';
import { getMap } from '../data/maps';
import { getCreature } from '../data/creatures';
import { getTrainer } from '../data/characters';
import { creatureTextureKey } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import {
  buildTitleBackdrop, addTitleLogo, addBlinkingPrompt,
  drawSaveSummaryPanel, formatPlayTime,
} from '../ui/titleScreen';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';

export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private menuItems: { label: string; btn: Phaser.GameObjects.Image; text: Phaser.GameObjects.Text }[] = [];
  private canContinue = false;
  private labels: string[] = [];
  private confirmingDelete = false;
  private deleteSelected = 0;
  private deleteOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super('Menu');
  }

  create(): void {
    Input.bind(this);
    this.confirmingDelete = false;

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

    this.add.text(GAME_WIDTH / 2, 138, 'Catch · Battle · Explore', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5);

    if (saveStatus === 'corrupt') {
      this.add.text(GAME_WIDTH / 2, 200, 'Save file is corrupted.\nDelete it to start fresh.', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#e94560',
        align: 'center',
      }).setOrigin(0.5);
    } else if (this.canContinue) {
      this.showSaveSummary();
    } else {
      ['emberpup', 'aqualet', 'leafkit'].forEach((id, i) => {
        const spr = this.add.image(GAME_WIDTH / 2 - 100 + i * 100, 200, creatureTextureKey(this, id, true)).setScale(2);
        this.tweens.add({
          targets: spr, y: 195, duration: 900 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      });
    }

    this.menuItems = [];
    const menuStartY = this.canContinue ? 300 : 260;
    this.labels.forEach((label, i) => {
      const y = menuStartY + i * 48;
      const btn = this.add.image(GAME_WIDTH / 2, y, 'btn_normal').setOrigin(0.5).setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, label, {
        fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f0f0f0',
      }).setOrigin(0.5);
      btn.on('pointerover', () => { if (!this.confirmingDelete) { this.selected = i; this.refreshMenu(); } });
      btn.on('pointerdown', () => { if (!this.confirmingDelete) { this.selected = i; this.confirm(); } });
      this.menuItems.push({ label, btn, text });
    });

    addBlinkingPrompt(this, '↑↓ select  ·  A / Z confirm', GAME_HEIGHT - 36);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'Keyboard · Controller supported', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#556677',
    }).setOrigin(0.5);

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

    this.add.sprite(520, 210, playerTextureKey(p.characterId, 'down', 0)).setScale(3);
    const preset = getTrainer(p.characterId);
    this.add.text(520, 248, preset.label, {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
    }).setOrigin(0.5);
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
      item.text.setColor(sel ? '#f5c542' : '#c0c0c0');
      item.text.setText(sel ? `▶  ${item.label}` : item.label);
    });
  }

  private confirm(): void {
    Sfx.menuConfirm();
    const choice = this.labels[this.selected];
    if (choice === 'Continue') {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('Overworld'));
    } else if (choice === 'New Game') {
      GameState.reset();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('CharacterSelect'));
    } else if (choice === 'Delete Save' || choice === 'Delete Corrupt Save') {
      this.openDeleteDialog();
    }
  }

  private openDeleteDialog(): void {
    this.confirmingDelete = true;
    this.deleteSelected = 1;
    const overlay = this.add.container(0, 0).setDepth(100);
    overlay.add(this.add.graphics().fillStyle(0x000000, 0.7).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT));

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.98);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 160, 180, 320, 120, 10);
    panel.lineStyle(2, COLORS.accent, 1);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 160, 180, 320, 120, 10);
    overlay.add(panel);

    overlay.add(this.add.text(GAME_WIDTH / 2, 210, 'Delete save file?', {
      fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f5c542',
    }).setOrigin(0.5));

    overlay.add(this.add.text(GAME_WIDTH / 2 - 60, 250, 'Yes', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#8899aa',
    }).setOrigin(0.5).setName('delYes'));

    overlay.add(this.add.text(GAME_WIDTH / 2 + 60, 250, 'No', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#8899aa',
    }).setOrigin(0.5).setName('delNo'));

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
