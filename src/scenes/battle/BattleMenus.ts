import { FONT } from '../../ui/theme';
import Phaser from 'phaser';
import { COLORS } from '../../data/types';
import { getMove } from '../../data/moves';
import { getItem } from '../../data/items';
import { getBattleUsableItems } from '../../systems/items';
import { GameState } from '../../systems/stats';
import { pinContainerChildren } from '../../ui/screenUi';
import type { BattlePhase, BattleUiHost } from './BattleUi';

export const MENU_ITEMS = ['Fight', 'Bag', 'Switch', 'Run'] as const;
const TRAINER_MENU_ITEMS = ['Fight', 'Bag', 'Switch'] as const;
const MENU_POS_4: [number, number][] = [[380, 350], [510, 350], [380, 390], [510, 390]];
const MENU_POS_3: [number, number][] = [[380, 350], [510, 350], [445, 390]];

export function battleMenuItems(isTrainer: boolean): readonly string[] {
  return isTrainer ? TRAINER_MENU_ITEMS : MENU_ITEMS;
}

/** Battle command menu, move list, and bag list (built once, refreshed per turn). */
export class BattleMenus {
  menuContainer!: Phaser.GameObjects.Container;
  moveContainer!: Phaser.GameObjects.Container;
  bagContainer!: Phaser.GameObjects.Container;

  private menuHighlights: Phaser.GameObjects.Graphics[] = [];
  private menuLabels: string[] = [];

  constructor(
    private scene: Phaser.Scene,
    private host: BattleUiHost,
  ) {}

  build(): void {
    this.buildMenu();
    this.moveContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(1100);
    this.bagContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(1100);
    pinContainerChildren(this.moveContainer, 1100);
    pinContainerChildren(this.bagContainer, 1100);
  }

  private buildMenu(): void {
    this.menuContainer = this.scene.add.container(0, 0).setDepth(1100);
    pinContainerChildren(this.menuContainer, 1100);
    this.menuHighlights = [];
    this.menuLabels = [...battleMenuItems(this.host.isTrainer)];
    const positions = this.menuLabels.length === 3 ? MENU_POS_3 : MENU_POS_4;
    this.menuLabels.forEach((label, i) => {
      const [x, y] = positions[i];
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, 0.8);
      bg.fillRoundedRect(x - 8, y - 8, 126, 44, 6);
      const t = this.scene.add.text(x + 55, y + 12, label, {
        fontFamily: FONT, fontSize: '14px', color: '#f0f0f0',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-55, -16, 126, 44), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
      t.on('pointerdown', () => { this.host.menuIndex = i; this.updateMenuHighlight(); this.host.menuChoice(label); });
      const hi = this.scene.add.graphics();
      this.menuHighlights.push(hi);
      this.menuContainer.add([bg, t, hi]);
    });
    this.menuContainer.setVisible(false);
    this.updateMenuHighlight();
  }

  updateMenuHighlight(): void {
    this.menuHighlights.forEach((hi, i) => {
      hi.clear();
      if (i !== this.host.menuIndex) return;
      const positions = this.menuLabels.length === 3 ? MENU_POS_3 : MENU_POS_4;
      const [x, y] = positions[i];
      hi.lineStyle(2, COLORS.accent, 1);
      hi.strokeRoundedRect(x - 4, y - 4, 110, 32, 6);
    });
  }

  onNav(phase: BattlePhase, dy: number, dx: number): void {
    if (phase === 'menu') {
      const count = this.menuLabels.length;
      if (count === 3) {
        if (dx !== 0) this.host.menuIndex = (this.host.menuIndex + (dx > 0 ? 1 : -1) + count) % count;
        if (dy !== 0) this.host.menuIndex = this.host.menuIndex === 2 ? 0 : 2;
      } else {
        if (dx !== 0) this.host.menuIndex = (this.host.menuIndex + (dx > 0 ? 1 : -1) + 4) % 4;
        if (dy !== 0) this.host.menuIndex = (this.host.menuIndex + (dy > 0 ? 2 : -2) + 4) % 4;
      }
      this.updateMenuHighlight();
    } else if (phase === 'moves') {
      if (dx !== 0) this.host.moveIndex = Phaser.Math.Clamp(this.host.moveIndex + dx, 0, this.host.playerMon.moves.length - 1);
      if (dy !== 0) {
        const next = this.host.moveIndex + dy * 2;
        if (next >= 0 && next < this.host.playerMon.moves.length) this.host.moveIndex = next;
      }
      this.refreshMoveMenu();
    } else if (phase === 'bag') {
      const items = getBattleUsableItems(GameState.player.items, !this.host.isTrainer);
      if (items.length === 0) return;
      this.host.bagIndex = Phaser.Math.Clamp(this.host.bagIndex + dy, 0, items.length - 1);
      this.refreshBagMenu();
    }
  }

  openMoveMenu(): void {
    this.host.moveIndex = 0;
    this.menuContainer.setVisible(false);
    this.refreshMoveMenu();
    this.moveContainer.setVisible(true);
  }

  openBagMenu(): void {
    this.host.bagIndex = 0;
    this.menuContainer.setVisible(false);
    this.refreshBagMenu();
    this.bagContainer.setVisible(true);
  }

  refreshMoveMenu(): void {
    this.moveContainer.removeAll(true);
    this.host.playerMon.moves.forEach((m, i) => {
      const move = getMove(m.id);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 32 + col * 290;
      const y = 352 + row * 34;
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.host.moveIndex ? 1 : 0.85);
      bg.fillRoundedRect(x, y, 270, 30, 5);
      this.scene.add.image(x + 8, y + 15, `type_${move.type}`).setOrigin(0, 0.5).setScale(0.7);
      const label = this.scene.add.text(x + 28, y + 6, `${move.name}  ${m.pp}/${m.maxPp}`, {
        fontFamily: FONT, fontSize: '11px', color: i === this.host.moveIndex ? '#f5c542' : '#f0f0f0',
      }).setOrigin(0, 0).setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(0, 0, 240, 28),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      });
      label.on('pointerdown', () => { this.host.moveIndex = i; this.host.useMove(i); });
      this.moveContainer.add([bg, label]);
    });
  }

  refreshBagMenu(): void {
    this.bagContainer.removeAll(true);
    const items = getBattleUsableItems(GameState.player.items, !this.host.isTrainer);
    if (items.length === 0) {
      this.bagContainer.add(this.scene.add.text(40, 390, 'No usable items!', {
        fontFamily: FONT, fontSize: '12px', color: '#8899aa',
      }));
      return;
    }
    items.forEach((id, i) => {
      const item = getItem(id);
      const y = 350 + i * 26;
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.host.bagIndex ? 1 : 0.85);
      bg.fillRoundedRect(32, y, 300, 24, 4);
      const label = this.scene.add.text(40, y + 4, `${i === this.host.bagIndex ? '▶ ' : ''}${item.name} x${GameState.player.items[id]}`, {
        fontFamily: FONT, fontSize: '11px', color: i === this.host.bagIndex ? '#f5c542' : '#f0f0f0',
      }).setInteractive({
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(0, 0, 280, 22),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      });
      label.on('pointerdown', () => { this.host.bagIndex = i; this.host.useBagItem(id); });
      this.bagContainer.add([bg, label]);
    });
  }
}
