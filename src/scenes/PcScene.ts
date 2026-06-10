import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { getCreature } from '../data/creatures';
import { GameState, displayName } from '../systems/stats';
import { depositToStorage, withdrawFromStorage } from '../systems/save';
import { trySave } from '../utils/saveFeedback';
import { drawHpBar } from '../ui/HUD';
import { addCreatureImage } from '../utils/assetLoader';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';

export class PcScene extends Phaser.Scene {
  private mode: 'party' | 'storage' = 'party';
  private selected = 0;

  constructor() {
    super('PC');
  }

  create(): void {
    Input.bind(this);
    buildScreenOverlay(this, 0.78);
    buildMenuPanel(this, 16, 12, GAME_WIDTH - 32, GAME_HEIGHT - 24, 3);

    this.add.text(GAME_WIDTH / 2, 16, 'Critter Storage System', {
      fontFamily: '"Courier New", monospace', fontSize: '20px', color: '#3b82f6',
    }).setOrigin(0.5);

    this.add.text(40, 40, 'Tab: switch  ·  A/Z: deposit/withdraw  ·  B/ESC: close', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#667788',
    });

    this.render();
  }

  update(): void {
    Input.update();
    if (Input.justPressed('tab')) {
      this.mode = this.mode === 'party' ? 'storage' : 'party';
      this.selected = 0;
      this.render();
    }
    if (Input.justPressed('up')) {
      this.selected = Math.max(0, this.selected - 1);
      this.render();
    }
    if (Input.justPressed('down')) {
      this.selected = Math.min(Math.max(0, this.list().length - 1), this.selected + 1);
      this.render();
    }
    if (Input.justPressed('confirm')) this.action();
    if (Input.justPressed('cancel')) {
      this.scene.stop();
      this.scene.resume('Overworld');
    }
  }

  private list() {
    return this.mode === 'party' ? GameState.player.party : GameState.player.storage;
  }

  private container!: Phaser.GameObjects.Container;

  private render(): void {
    if (this.container) this.container.destroy();
    this.container = this.add.container(0, 0);

    const label = this.add.text(40, 58, this.mode === 'party' ? `Party (${GameState.player.party.length}/6)` : `Storage (${GameState.player.storage.length})`, {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f5c542',
    });
    this.container.add(label);

    const items = this.list();
    if (items.length === 0) {
      this.container.add(this.add.text(40, 90, '(empty)', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#667788',
      }));
      return;
    }

    items.forEach((c, i) => {
      const def = getCreature(c.speciesId);
      const y = 80 + i * 52;
      const sel = i === this.selected;

      const bg = this.add.graphics();
      bg.fillStyle(sel ? COLORS.panelBorder : COLORS.panel, 0.9);
      bg.fillRoundedRect(36, y, GAME_WIDTH - 72, 46, 6);
      this.container.add(bg);

      const spr = addCreatureImage(this, 60, y + 23, c.speciesId, true).setScale(1.8);
      this.container.add(spr);

      this.container.add(this.add.text(82, y + 6, `${sel ? '▶ ' : ''}${displayName(c)}  Lv.${c.level}`, {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#f0f0f0',
      }));
      this.container.add(this.add.text(82, y + 22, `${TYPE_NAMES[def.types[0]]}  HP ${c.currentHp}/${c.maxHp}`, {
        fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
      }));
      drawHpBar(this, 82, y + 36, 160, 6, c.currentHp, c.maxHp);
    });
  }

  private action(): void {
    if (this.mode === 'party') {
      if (depositToStorage(this.selected)) { trySave(this); this.render(); }
    } else {
      if (withdrawFromStorage(this.selected)) { trySave(this); this.render(); }
    }
  }
}
