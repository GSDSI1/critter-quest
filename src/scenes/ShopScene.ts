import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { SHOP_STOCK, getItem, addItem } from '../data/items';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { buildMartInterior, buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';

export class ShopScene extends Phaser.Scene {
  private selected = 0;
  private returnMap = 'town';

  constructor() {
    super('Shop');
  }

  create(data: { returnMap?: string }): void {
    Input.bind(this);
    this.returnMap = data.returnMap ?? GameState.player.mapId;

    buildMartInterior(this, -10);
    buildScreenOverlay(this, 0.5, 0);
    buildMenuPanel(this, 40, 60, GAME_WIDTH - 80, 360, 5);

    this.add.text(GAME_WIDTH / 2, 20, 'Verdant Mart', {
      fontFamily: '"Courier New", monospace', fontSize: '22px', color: '#f5c542',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 44, `Your money: $${GameState.player.money}`, {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5);

    this.renderList();

    this.add.text(GAME_WIDTH / 2, 450, '↑↓ select  ·  Z buy  ·  ESC leave', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#667788',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-UP', () => { this.selected = Math.max(0, this.selected - 1); this.renderList(); });
    this.input.keyboard?.on('keydown-DOWN', () => { this.selected = Math.min(SHOP_STOCK.length - 1, this.selected + 1); this.renderList(); });
    this.input.keyboard?.on('keydown-Z', () => this.buy());
    this.input.keyboard?.on('keydown-ESC', () => this.leave());
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) { this.selected = Math.max(0, this.selected - 1); this.renderList(); }
    if (Input.justPressed('down')) { this.selected = Math.min(SHOP_STOCK.length - 1, this.selected + 1); this.renderList(); }
    if (Input.justPressed('confirm')) this.buy();
    if (Input.justPressed('cancel')) this.leave();
  }

  private itemTexts: Phaser.GameObjects.Text[] = [];

  private renderList(): void {
    this.itemTexts.forEach(t => t.destroy());
    this.itemTexts = [];

    SHOP_STOCK.forEach((id, i) => {
      const item = getItem(id);
      const owned = GameState.player.items[id] ?? 0;
      const prefix = i === this.selected ? '▶ ' : '  ';
      const t = this.add.text(40, 70 + i * 28, `${prefix}${item.name.padEnd(14)} $${item.price}  x${owned}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: i === this.selected ? '#f5c542' : '#c0c0c0',
      });
      this.itemTexts.push(t);
    });

    const sel = getItem(SHOP_STOCK[this.selected]);
    this.add.text(40, 400, sel.description, {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setName('desc');
    const old = this.children.getByName('desc');
    // desc recreated each render - fine
  }

  private buy(): void {
    const id = SHOP_STOCK[this.selected];
    const item = getItem(id);
    if (GameState.player.money < item.price) return;
    GameState.player.money -= item.price;
    addItem(GameState.player.items, id);
    trySave(this);
    this.renderList();
  }

  private leave(): void {
    this.scene.stop();
    this.scene.resume('Overworld');
  }
}
