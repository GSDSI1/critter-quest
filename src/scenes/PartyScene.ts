import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { getItem, removeItem } from '../data/items';
import { getAbility } from '../data/abilities';
import { getNature } from '../data/natures';
import { GameState, displayName, isFainted } from '../systems/stats';
import { drawHpBar } from '../ui/HUD';
import { creatureTextureKey } from '../utils/assetLoader';
import { trySave } from '../utils/saveFeedback';
import { Input } from '../systems/input';

const HELD_ITEMS = ['oran_berry', 'charcoal', 'mystic_water'];

export class PartyScene extends Phaser.Scene {
  private battleSwitch = false;
  private voluntarySwitch = true;
  private fromPause = false;
  private detailIndex: number | null = null;

  constructor() {
    super('Party');
  }

  create(data: { battleSwitch?: boolean; voluntarySwitch?: boolean; forcedSwitch?: boolean; fromPause?: boolean }): void {
    Input.bind(this);
    this.battleSwitch = data.battleSwitch ?? false;
    this.voluntarySwitch = data.forcedSwitch ? false : (data.voluntarySwitch ?? true);
    this.fromPause = data.fromPause ?? false;
    this.detailIndex = null;
    this.render();
  }

  private render(): void {
    this.children.removeAll(true);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, 24, this.battleSwitch ? 'Choose a Critter' : 'Your Party', {
      fontFamily: '"Courier New", monospace', fontSize: '22px', color: '#f5c542',
    }).setOrigin(0.5);

    const party = GameState.player.party;
    if (party.length === 0) {
      this.add.text(GAME_WIDTH / 2, 240, 'No critters yet!', {
        fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#8899aa',
      }).setOrigin(0.5);
    }

    party.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 40 + col * 300;
      const y = 60 + row * 130;
      const def = getCreature(c.speciesId);
      const fainted = isFainted(c);
      const showingDetail = this.detailIndex === i;

      const panel = this.add.graphics();
      panel.fillStyle(COLORS.panel, fainted ? 0.6 : 0.95);
      panel.fillRoundedRect(x, y, 280, showingDetail ? 130 : 115, 8);
      panel.lineStyle(2, fainted ? 0x555555 : COLORS.panelBorder, 1);
      panel.strokeRoundedRect(x, y, 280, showingDetail ? 130 : 115, 8);

      this.add.image(x + 40, y + 58, creatureTextureKey(this, c.speciesId, true)).setScale(2).setAlpha(fainted ? 0.4 : 1);

      def.types.forEach((t, ti) => {
        this.add.image(x + 80 + ti * 18, y + 42, `type_${t}`).setScale(0.6);
      });

      this.add.text(x + 80, y + 12, displayName(c), {
        fontFamily: '"Courier New", monospace', fontSize: '14px', color: fainted ? '#666' : '#f0f0f0', fontStyle: 'bold',
      });
      this.add.text(x + 80, y + 30, `Lv.${c.level}  ${getNature(c.nature).name}`, {
        fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
      });
      this.add.text(x + 80, y + 46, `${c.currentHp}/${c.maxHp} HP  ${getAbility(c.ability).name}`, {
        fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#8899aa',
      });
      drawHpBar(this, x + 80, y + 62, 180, 8, c.currentHp, c.maxHp);

      if (showingDetail) {
        const iv = c.ivs;
        this.add.text(x + 80, y + 78, `IVs HP${iv.hp} ATK${iv.atk} DEF${iv.def} SPA${iv.spa} SPD${iv.spd} SPE${iv.spe}`, {
          fontFamily: '"Courier New", monospace', fontSize: '7px', color: '#667788',
        });
        if (c.heldItem) {
          this.add.text(x + 80, y + 92, `Held: ${getItem(c.heldItem).name}`, {
            fontFamily: '"Courier New", monospace', fontSize: '8px', color: '#f5c542',
          });
        }
      } else {
        const moves = c.moves.map(m => getMove(m.id).name).join(', ');
        this.add.text(x + 80, y + 78, moves, {
          fontFamily: '"Courier New", monospace', fontSize: '8px', color: '#667788', wordWrap: { width: 190 },
        });
      }

      if (this.battleSwitch && !fainted) {
        const btn = this.add.text(x + 230, y + 90, 'Send Out', {
          fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#e94560',
        }).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => this.selectForBattle(i));
      } else if (!this.battleSwitch) {
        const info = this.add.text(x + 220, y + 90, showingDetail ? 'Close' : 'Stats', {
          fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
        }).setInteractive({ useHandCursor: true });
        info.on('pointerdown', () => { this.detailIndex = showingDetail ? null : i; this.render(); });
      }
    });

    if (!this.battleSwitch) this.renderHeldItemMenu();

    if (GameState.player.storage.length > 0) {
      this.add.text(GAME_WIDTH / 2, 420, `+ ${GameState.player.storage.length} in storage`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#667788',
      }).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, 450, '[ ESC / Z to close ]', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.close());

    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-Z');
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-Z', () => this.close());
  }

  update(): void {
    Input.update();
    if (Input.justPressed('cancel')) this.close();
  }

  private renderHeldItemMenu(): void {
    const available = HELD_ITEMS.filter(id => (GameState.player.items[id] ?? 0) > 0);
    if (available.length === 0 || GameState.player.party.length === 0) return;

    this.add.text(40, 400, 'Give held item to lead critter:', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
    });
    available.forEach((id, i) => {
      const item = getItem(id);
      const t = this.add.text(40 + i * 120, 418, item.name, {
        fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#f5c542',
      }).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        if ((GameState.player.items[id] ?? 0) <= 0) return;
        removeItem(GameState.player.items, id);
        GameState.player.party[0].heldItem = id;
        trySave(this);
        this.render();
      });
    });
  }

  private selectForBattle(index: number): void {
    const battle = this.scene.get('Battle') as import('./BattleScene').BattleScene;
    battle.switchTo(index, this.voluntarySwitch);
    this.scene.stop();
  }

  private close(): void {
    this.scene.stop();
    if (this.battleSwitch) this.scene.resume('Battle');
    else if (this.fromPause) this.scene.resume('PauseMenu');
    else this.scene.resume('Overworld');
  }
}
