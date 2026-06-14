import { titleStyle, bodyStyle, hintStyle } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { getItem, removeItem } from '../data/items';
import { getAbility } from '../data/abilities';
import { getNature } from '../data/natures';
import { GameState, displayName, isFainted } from '../systems/stats';
import { paintHpBar } from '../ui/HUD';
import { addCreatureImage, startCritterIdle, type CritterIdleHandle } from '../utils/assetLoader';
import { trySave } from '../utils/saveFeedback';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { TouchMenuNav } from '../ui/touchMenuNav';
import { formatStatLines } from '../ui/statDisplay';

const HELD_ITEMS = [
  'oran_berry', 'sitrus_berry', 'lum_berry',
  'charcoal', 'mystic_water', 'silk_scarf', 'never_melt_ice', 'twisted_spoon',
  'hard_stone', 'magnet', 'shadow_cloth', 'scope_lens',
];

export class PartyScene extends Phaser.Scene {
  private battleSwitch = false;
  private voluntarySwitch = true;
  private fromPause = false;
  private detailIndex: number | null = null;
  private touchNav?: TouchMenuNav;
  private idleHandles: CritterIdleHandle[] = [];

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
    this.idleHandles.forEach(h => h.stop());
    this.idleHandles = [];
    this.children.removeAll(true);

    buildScreenOverlay(this, 0.72);
    const panel = buildMenuPanel(this, 20, 16, GAME_WIDTH - 40, GAME_HEIGHT - 32, 5);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, alpha: 1, duration: 220, ease: 'Back.easeOut' });

    this.add.text(GAME_WIDTH / 2, 24, this.battleSwitch ? 'Choose a Critter' : 'Your Party', titleStyle('22px')).setOrigin(0.5);

    const party = GameState.player.party;
    if (party.length === 0) {
      this.add.text(GAME_WIDTH / 2, 240, 'No critters yet!', bodyStyle('16px', '#8899aa')).setOrigin(0.5);
    }

    party.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 40 + col * 300;
      const y = 60 + row * 125;
      const def = getCreature(c.speciesId);
      const fainted = isFainted(c);
      const showingDetail = this.detailIndex === i;

      const panel = this.add.graphics();
      panel.fillStyle(COLORS.panel, fainted ? 0.6 : 0.95);
      const panelH = showingDetail ? 148 : 112;
      panel.fillRoundedRect(x, y, 280, panelH, 8);
      panel.lineStyle(2, fainted ? 0x555555 : COLORS.panelBorder, 1);
      panel.strokeRoundedRect(x, y, 280, panelH, 8);

      const spr = addCreatureImage(this, x + 40, y + 58, c.speciesId, true).setScale(2).setAlpha(fainted ? 0.4 : 1);
      if (!fainted) this.idleHandles.push(startCritterIdle(this, spr, c.speciesId, y + 58));

      def.types.forEach((t, ti) => {
        this.add.image(x + 80 + ti * 18, y + 42, `type_${t}`).setScale(0.6);
      });

      this.add.text(x + 80, y + 12, `${c.shiny ? '★ ' : ''}${displayName(c)}`, {
        ...bodyStyle('14px', fainted ? '#666666' : c.shiny ? '#f5c542' : '#f0f0f0'),
        fontStyle: 'bold',
      });
      this.add.text(x + 80, y + 30, `Lv.${c.level}  ${getNature(c.nature).name}`, hintStyle('10px'));
      this.add.text(x + 80, y + 46, `${c.currentHp}/${c.maxHp} HP`, hintStyle('9px'));
      const hpGfx = this.add.graphics();
      paintHpBar(hpGfx, x + 80, y + 58, 180, 8, c.currentHp, c.maxHp);

      if (showingDetail) {
        const [s1, s2] = formatStatLines(c);
        this.add.text(x + 80, y + 72, s1, hintStyle('8px'));
        this.add.text(x + 80, y + 84, s2, hintStyle('8px'));
        const iv = c.ivs;
        this.add.text(x + 80, y + 98, `IV HP${iv.hp} ATK${iv.atk} DEF${iv.def} SPA${iv.spa} SPD${iv.spd} SPE${iv.spe}`, hintStyle('7px'));
        const abil = getAbility(c.ability).name;
        this.add.text(x + 80, y + 110, `Ability: ${abil.length > 18 ? abil.slice(0, 16) + '…' : abil}`, hintStyle('7px'));
        if (c.heldItem) {
          this.add.text(x + 80, y + 122, `Held: ${getItem(c.heldItem).name}`, bodyStyle('8px', '#f5c542'));
        }
      } else {
        const moves = c.moves.map(m => getMove(m.id).name).join(', ');
        this.add.text(x + 80, y + 72, moves, {
          ...hintStyle('8px'),
          wordWrap: { width: 190 },
        });
      }

      if (this.battleSwitch && !fainted) {
        const btn = this.add.text(x + 230, y + 90, 'Send Out', bodyStyle('11px', '#e94560')).setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => this.selectForBattle(i));
      } else if (!this.battleSwitch) {
        const info = this.add.text(x + 200, y + 90, showingDetail ? 'Close' : 'Stats', hintStyle('10px')).setInteractive({ useHandCursor: true });
        info.on('pointerdown', () => { this.detailIndex = showingDetail ? null : i; this.render(); });
        const nick = this.add.text(x + 248, y + 90, 'Nick', bodyStyle('10px', '#e94560')).setInteractive({ useHandCursor: true });
        nick.on('pointerdown', () => this.promptNickname(i));
      }
    });

    if (!this.battleSwitch) this.renderHeldItemMenu();

    if (GameState.player.storage.length > 0) {
      this.add.text(GAME_WIDTH / 2, 448, `+ ${GameState.player.storage.length} in storage`, hintStyle('11px')).setOrigin(0.5);
    }

    this.add.text(GAME_WIDTH / 2, 478, '[ ESC / Z to close ]', hintStyle('12px')).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.close());

    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-Z');
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-Z', () => this.close());

    this.touchNav?.destroy();
    this.touchNav = new TouchMenuNav(this, {
      onUp: () => {},
      onDown: () => {},
      onConfirm: () => this.close(),
      onCancel: () => this.close(),
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('cancel')) this.close();
  }

  private renderHeldItemMenu(): void {
    const available = HELD_ITEMS.filter(id => (GameState.player.items[id] ?? 0) > 0);
    if (available.length === 0 || GameState.player.party.length === 0) return;

    this.add.text(40, 388, 'Give held item to lead critter:', hintStyle('10px'));
    available.forEach((id, i) => {
      const item = getItem(id);
      const col = i % 4;
      const row = Math.floor(i / 4);
      const t = this.add.text(40 + col * 148, 404 + row * 16, item.name, bodyStyle('10px', '#f5c542')).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        if ((GameState.player.items[id] ?? 0) <= 0) return;
        removeItem(GameState.player.items, id);
        GameState.player.party[0].heldItem = id;
        trySave(this);
        this.render();
      });
    });
  }

  private promptNickname(index: number): void {
    const c = GameState.player.party[index];
    if (!c) return;
    const def = getCreature(c.speciesId);
    this.scene.launch('Nickname', {
      speciesName: def.name,
      onDone: (nickname: string | undefined) => {
        c.nickname = nickname;
        trySave(this);
        this.scene.resume();
        this.render();
      },
    });
    this.scene.pause();
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
