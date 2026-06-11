import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { SHOP_STOCK, getItem, addItem, removeItem } from '../data/items';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { buildMartInterior, buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { TouchMenuNav } from '../ui/touchMenuNav';

export class ShopScene extends Phaser.Scene {
  private selected = 0;
  private mode: 'buy' | 'sell' = 'buy';
  private returnMap = 'town';
  private touchNav?: TouchMenuNav;

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
      fontFamily: FONT, fontSize: '22px', color: '#f5c542',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 44, `Your money: $${GameState.player.money}`, {
      fontFamily: FONT, fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5);

    this.renderList();

    this.add.text(GAME_WIDTH / 2, 450, '↑↓ item  ·  ←→ mode  ·  Z confirm  ·  ESC leave', {
      fontFamily: FONT, fontSize: '11px', color: '#667788',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown-UP', () => { this.selected = Math.max(0, this.selected - 1); this.renderList(); });
    this.input.keyboard?.on('keydown-DOWN', () => { this.selected = Math.min(SHOP_STOCK.length - 1, this.selected + 1); this.renderList(); });
    this.input.keyboard?.on('keydown-Z', () => this.buy());
    this.input.keyboard?.on('keydown-ESC', () => this.leave());

    this.touchNav = new TouchMenuNav(this, {
      onUp: () => { this.selected = Math.max(0, this.selected - 1); this.renderList(); },
      onDown: () => { this.selected = Math.min(SHOP_STOCK.length - 1, this.selected + 1); this.renderList(); },
      onConfirm: () => this.buy(),
      onCancel: () => this.leave(),
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) { this.selected = Math.max(0, this.selected - 1); this.renderList(); }
    if (Input.justPressed('down')) { this.selected = Math.min(SHOP_STOCK.length - 1, this.selected + 1); this.renderList(); }
    if (Input.justPressed('left') || Input.justPressed('right')) {
      this.mode = this.mode === 'buy' ? 'sell' : 'buy';
      this.renderList();
    }
    if (Input.justPressed('confirm')) this.transact();
    if (Input.justPressed('cancel')) this.leave();
  }

  private itemTexts: Phaser.GameObjects.Text[] = [];

  private renderList(): void {
    this.itemTexts.forEach(t => t.destroy());
    this.itemTexts = [];
    this.children.getByName('modeLabel')?.destroy();
    this.children.getByName('desc')?.destroy();

    this.add.text(GAME_WIDTH / 2, 28, this.mode === 'buy' ? 'BUY' : 'SELL', {
      fontFamily: FONT, fontSize: '14px', color: '#f5c542',
    }).setOrigin(0.5).setName('modeLabel');

    SHOP_STOCK.forEach((id, i) => {
      const item = getItem(id);
      const owned = GameState.player.items[id] ?? 0;
      const prefix = i === this.selected ? '▶ ' : '  ';
      const t = this.add.text(40, 70 + i * 28, `${prefix}${item.name.padEnd(14)} $${item.price}  x${owned}`, {
        fontFamily: FONT,
        fontSize: '12px',
        color: i === this.selected ? '#f5c542' : '#c0c0c0',
      });
      this.itemTexts.push(t);
    });

    const sel = getItem(SHOP_STOCK[this.selected]);
    this.add.text(40, 400, sel.description, {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
    }).setName('desc');
    const old = this.children.getByName('desc');
    // desc recreated each render - fine
  }

  private transact(): void {
    const id = SHOP_STOCK[this.selected];
    const item = getItem(id);
    if (this.mode === 'buy') {
      if (GameState.player.money < item.price) return;
      GameState.player.money -= item.price;
      addItem(GameState.player.items, id);
    } else {
      if ((GameState.player.items[id] ?? 0) <= 0) return;
      const sellPrice = Math.max(1, Math.floor(item.price / 2));
      removeItem(GameState.player.items, id);
      GameState.player.money += sellPrice;
    }
    Sfx.menuConfirm();
    trySave(this);
    this.renderList();
  }

  private buy(): void {
    this.mode = 'buy';
    this.transact();
  }

  private leave(): void {
    this.scene.stop();
    this.scene.resume('Overworld');
  }
}
