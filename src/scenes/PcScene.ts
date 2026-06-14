import { titleStyle, bodyStyle, hintStyle } from '../ui/theme';
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
import { TouchMenuNav } from '../ui/touchMenuNav';

export class PcScene extends Phaser.Scene {
  private mode: 'party' | 'storage' = 'party';
  private selected = 0;
  private touchNav?: TouchMenuNav;
  private container!: Phaser.GameObjects.Container;

  constructor() {
    super('PC');
  }

  create(): void {
    Input.bind(this);
    buildScreenOverlay(this, 0.78);
    buildMenuPanel(this, 16, 12, GAME_WIDTH - 32, GAME_HEIGHT - 24, 3);

    this.add.text(GAME_WIDTH / 2, 16, 'Critter Storage System', titleStyle('20px')).setOrigin(0.5);
    this.add.text(40, 40, 'Tab: switch  ·  A/Z: deposit/withdraw  ·  B/ESC: close', hintStyle('10px'));

    this.container = this.add.container(0, 0);
    this.render();
    this.touchNav = new TouchMenuNav(this, {
      onUp: () => { this.selected = Math.max(0, this.selected - 1); this.render(); },
      onDown: () => { this.selected = Math.min(Math.max(0, this.list().length - 1), this.selected + 1); this.render(); },
      onConfirm: () => this.action(),
      onCancel: () => { this.scene.stop(); this.scene.resume('Overworld'); },
    });
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

  private render(): void {
    this.container.removeAll(true);

    this.container.add(this.add.text(40, 58, this.mode === 'party' ? `Party (${GameState.player.party.length}/6)` : `Storage (${GameState.player.storage.length})`, titleStyle('14px')));

    const items = this.list();
    if (items.length === 0) {
      this.container.add(this.add.text(40, 90, '(empty)', hintStyle('12px')));
      return;
    }

    items.forEach((c, i) => {
      const def = getCreature(c.speciesId);
      const y = 80 + i * 52;
      const sel = i === this.selected;

      const card = buildMenuPanel(this, 36, y, GAME_WIDTH - 72, 46, 0);
      card.setAlpha(sel ? 1 : 0.85);
      this.container.add(card);

      const spr = addCreatureImage(this, 60, y + 23, c.speciesId, true).setScale(1.8);
      if (c.shiny) spr.setTint(0xffd966);
      this.container.add(spr);

      this.container.add(this.add.text(82, y + 6, `${sel ? '▶ ' : ''}${c.shiny ? '★ ' : ''}${displayName(c)}  Lv.${c.level}`, bodyStyle('12px', c.shiny ? COLORS.goldHex : COLORS.textHex)));
      this.container.add(this.add.text(82, y + 22, `${TYPE_NAMES[def.types[0]]}  HP ${c.currentHp}/${c.maxHp}`, hintStyle('10px')));
      drawHpBar(this, 82, y + 36, 160, 6, c.currentHp, c.maxHp);
    });
  }

  private action(): void {
    const ok = this.mode === 'party'
      ? depositToStorage(this.selected)
      : withdrawFromStorage(this.selected);
    if (ok) {
      trySave(this);
      this.container.x = 8;
      this.tweens.add({ targets: this.container, x: 0, duration: 150, ease: 'Back.easeOut' });
      this.render();
    }
  }
}
