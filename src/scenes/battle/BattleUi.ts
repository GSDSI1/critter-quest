import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../../data/types';
import { getCreature } from '../../data/creatures';
import { getMove } from '../../data/moves';
import { getItem, removeItem } from '../../data/items';
import { getBadge } from '../../data/badges';
import { getAbility } from '../../data/abilities';
import {
  executeMove, tryCatchWithItem, tryRun, pickAiMove, expGain,
  endOfTurnStatus, effectiveSpeed, applyEnterAbility, tryHeldBerry, isRunBlocked,
} from '../../systems/battle';
import {
  checkEvolution, evolveCritter, processLevelUp, evolutionMessage,
} from '../../systems/evolution';
import { getBattleUsableItems, useItemOnCritter } from '../../systems/items';
import {
  GameState, type CritterInstance, displayName, expProgress, isFainted, addExp, registerCaught, registerSeen,
} from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { addCreatureImage, applyCreatureTexture, startCritterIdle, type CritterIdleHandle } from '../../utils/assetLoader';
import { Sfx } from '../../utils/audio';
import { drawHpBar } from '../../ui/HUD';
import { statusLabel } from '../../systems/status';
import { pinContainerChildren } from '../../ui/screenUi';
import { createTouchButton } from '../../ui/touchButtons';
import type { BattleAnims } from './BattleAnims';

export const MENU_ITEMS = ['Fight', 'Bag', 'Switch', 'Run'] as const;
const MENU_POS: [number, number][] = [[380, 378], [510, 378], [380, 418], [510, 418]];

export type BattlePhase = 'intro' | 'menu' | 'fight' | 'moves' | 'bag' | 'message' | 'enemy' | 'evolve' | 'learn';

export interface BattleUiHost {
  readonly playerMon: CritterInstance;
  readonly wild: CritterInstance;
  readonly isTrainer: boolean;
  menuIndex: number;
  moveIndex: number;
  bagIndex: number;
  menuChoice(choice: string): void;
  useMove(index: number): void;
  useBagItem(itemId: string): void;
  onConfirm(): void;
}

export class BattleUi {
  enemySprite!: Phaser.GameObjects.Image;
  playerSprite!: Phaser.GameObjects.Image;
  enemyHpBar!: Phaser.GameObjects.Graphics;
  playerHpBar!: Phaser.GameObjects.Graphics;
  expBar!: Phaser.GameObjects.Graphics;
  messageText!: Phaser.GameObjects.Text;
  menuContainer!: Phaser.GameObjects.Container;
  moveContainer!: Phaser.GameObjects.Container;
  bagContainer!: Phaser.GameObjects.Container;
  continueBtn!: ReturnType<typeof createTouchButton>;
  enemyNameText!: Phaser.GameObjects.Text;
  playerHpText!: Phaser.GameObjects.Text;
  abilityText!: Phaser.GameObjects.Text;

  private menuHighlights: Phaser.GameObjects.Graphics[] = [];
  private messageQueue: string[] = [];
  private enemyIdle?: CritterIdleHandle;
  private playerIdle?: CritterIdleHandle;

  constructor(
    private scene: Phaser.Scene,
    private host: BattleUiHost,
    private anims: BattleAnims,
  ) {}

  build(): void {
    this.scene.add.image(480, 175, 'battle_platform').setAlpha(0.9);
    this.enemySprite = addCreatureImage(this.scene, 480, 130, this.host.wild.speciesId).setScale(1.5);
    this.enemyIdle = startCritterIdle(this.scene, this.enemySprite, this.host.wild.speciesId, 130);

    const eBox = this.scene.add.graphics();
    eBox.fillStyle(COLORS.panel, 0.92);
    eBox.fillRoundedRect(340, 24, 260, 80, 8);
    eBox.lineStyle(2, COLORS.panelBorder, 1);
    eBox.strokeRoundedRect(340, 24, 260, 80, 8);

    this.enemyNameText = this.scene.add.text(356, 32, '', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.enemyHpBar = drawHpBar(this.scene, 356, 68, 180, 10, 0, 1);

    this.scene.add.image(180, 340, 'battle_platform').setAlpha(0.9);
    this.playerSprite = addCreatureImage(this.scene, 160, 290, this.host.playerMon.speciesId, false, 'back').setScale(2).setFlipX(true);
    this.playerIdle = startCritterIdle(this.scene, this.playerSprite, this.host.playerMon.speciesId, 290);

    const pBox = this.scene.add.graphics();
    pBox.fillStyle(COLORS.panel, 0.92);
    pBox.fillRoundedRect(40, 248, 260, 88, 8);
    pBox.lineStyle(2, COLORS.panelBorder, 1);
    pBox.strokeRoundedRect(40, 248, 260, 88, 8);

    this.scene.add.text(56, 256, displayName(this.host.playerMon), {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.scene.add.text(56, 274, `Lv.${this.host.playerMon.level}`, {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    });
    this.abilityText = this.scene.add.text(200, 274, '', {
      fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#667788',
    }).setOrigin(1, 0);
    this.playerHpText = this.scene.add.text(230, 274, '', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
    });
    this.playerHpBar = drawHpBar(this.scene, 56, 292, 180, 10, 0, 1);
    this.expBar = drawHpBar(this.scene, 56, 308, 180, 6, 0, 1, 50);

    if (this.scene.textures.exists('dialog_frame')) {
      this.scene.add.image(GAME_WIDTH / 2, 416, 'dialog_frame').setOrigin(0.5);
    } else {
      const msgBg = this.scene.add.graphics();
      msgBg.fillStyle(COLORS.panel, 0.97);
      msgBg.fillRoundedRect(16, 368, GAME_WIDTH - 32, 96, 10);
      msgBg.lineStyle(3, COLORS.panelBorder, 1);
      msgBg.strokeRoundedRect(16, 368, GAME_WIDTH - 32, 96, 10);
    }

    this.messageText = this.scene.add.text(32, 384, '', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
      wordWrap: { width: GAME_WIDTH - 64 },
    });

    this.buildMenu();
    this.moveContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(1100);
    this.bagContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(1100);
    pinContainerChildren(this.moveContainer, 1100);
    pinContainerChildren(this.bagContainer, 1100);
    this.continueBtn = createTouchButton(
      this.scene, GAME_WIDTH - 70, 416, 'Continue ▶',
      () => this.host.onConfirm(),
      { width: 110, height: 34, depth: 1101, fontSize: '11px' },
    );
    this.continueBtn.setVisible(false);
    this.refreshPlayerUi();
  }

  syncEnemyUi(animate = true): void {
    const def = getCreature(this.host.wild.speciesId);
    this.enemyNameText.setText(`${def.name}  Lv.${this.host.wild.level}  ${statusLabel(this.host.wild.status)}`);
    this.enemyIdle?.stop();
    applyCreatureTexture(this.enemySprite, this.scene, this.host.wild.speciesId);
    this.enemySprite.setAlpha(1);
    this.enemyIdle = startCritterIdle(this.scene, this.enemySprite, this.host.wild.speciesId, 130);
    this.animateHp(this.enemyHpBar, this.host.wild.currentHp, this.host.wild.maxHp, 356, 68);
    const old = this.scene.children.getByName('enemyTypes');
    if (old) old.destroy();
    def.types.forEach((t, i) => {
      this.scene.add.image(520 + i * 20, 50, `type_${t}`).setScale(0.8).setName('enemyTypes');
    });
    if (animate) this.anims.animateSendOut(this.enemySprite, 480, false);
  }

  refreshPlayerSprite(speciesId: string): void {
    this.playerIdle?.stop();
    applyCreatureTexture(this.playerSprite, this.scene, speciesId, false, 'back');
    this.playerIdle = startCritterIdle(this.scene, this.playerSprite, speciesId, 290);
  }

  refreshPlayerUi(): void {
    const mon = this.host.playerMon;
    this.playerHpText.setText(`${mon.currentHp}/${mon.maxHp} ${statusLabel(mon.status)}`);
    this.animateHp(this.playerHpBar, mon.currentHp, mon.maxHp, 56, 292);
    this.expBar.clear();
    const prog = expProgress(mon);
    const expG = drawHpBar(this.scene, 56, 308, 180, 6, prog * 180, 180, 50);
    this.expBar.destroy();
    this.expBar = expG;
    this.abilityText.setText(getAbility(mon.ability).name);
  }

  animateEnemyHp(): void {
    this.animateHp(this.enemyHpBar, this.host.wild.currentHp, this.host.wild.maxHp, 356, 68);
  }

  setContinueVisible(phase: BattlePhase): void {
    const show = phase === 'message' || phase === 'intro';
    this.continueBtn?.setVisible(show);
    this.continueBtn?.setEnabled(show);
  }

  showMenu(): void {
    this.menuContainer.setVisible(true);
    this.updateMenuHighlight();
  }

  hideMenus(): void {
    this.menuContainer.setVisible(false);
    this.moveContainer.setVisible(false);
    this.bagContainer.setVisible(false);
  }

  returnToMenu(): void {
    this.hideMenus();
    this.showMenu();
  }

  private buildMenu(): void {
    this.menuContainer = this.scene.add.container(0, 0).setDepth(1100);
    pinContainerChildren(this.menuContainer, 1100);
    this.menuHighlights = [];
    MENU_ITEMS.forEach((label, i) => {
      const [x, y] = MENU_POS[i];
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, 0.8);
      bg.fillRoundedRect(x - 4, y - 4, 110, 32, 6);
      const t = this.scene.add.text(x + 55, y + 12, label, {
        fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
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
      const [x, y] = MENU_POS[i];
      hi.lineStyle(2, COLORS.accent, 1);
      hi.strokeRoundedRect(x - 4, y - 4, 110, 32, 6);
    });
  }

  onNav(phase: BattlePhase, dy: number, dx: number): void {
    if (phase === 'menu') {
      if (dx !== 0) this.host.menuIndex = (this.host.menuIndex + (dx > 0 ? 1 : -1) + 4) % 4;
      if (dy !== 0) this.host.menuIndex = (this.host.menuIndex + (dy > 0 ? 2 : -2) + 4) % 4;
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
      const y = 380 + row * 36;
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.host.moveIndex ? 1 : 0.85);
      bg.fillRoundedRect(x, y, 270, 30, 5);
      this.scene.add.image(x + 8, y + 15, `type_${move.type}`).setOrigin(0, 0.5).setScale(0.7);
      const label = this.scene.add.text(x + 28, y + 6, `${move.name}  ${m.pp}/${m.maxPp}`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: i === this.host.moveIndex ? '#f5c542' : '#f0f0f0',
      }).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => { this.host.moveIndex = i; this.host.useMove(i); });
      this.moveContainer.add([bg, label]);
    });
  }

  refreshBagMenu(): void {
    this.bagContainer.removeAll(true);
    const items = getBattleUsableItems(GameState.player.items, !this.host.isTrainer);
    if (items.length === 0) {
      this.bagContainer.add(this.scene.add.text(40, 390, 'No usable items!', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
      }));
      return;
    }
    items.forEach((id, i) => {
      const item = getItem(id);
      const y = 378 + i * 28;
      const bg = this.scene.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.host.bagIndex ? 1 : 0.85);
      bg.fillRoundedRect(32, y, 300, 24, 4);
      const label = this.scene.add.text(40, y + 4, `${i === this.host.bagIndex ? '▶ ' : ''}${item.name} x${GameState.player.items[id]}`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: i === this.host.bagIndex ? '#f5c542' : '#f0f0f0',
      }).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => { this.host.bagIndex = i; this.host.useBagItem(id); });
      this.bagContainer.add([bg, label]);
    });
  }

  queueMessage(msg: string): void { this.messageQueue.push(msg); }

  showNextMessage(onExhausted: () => void): void {
    if (this.messageQueue.length === 0) {
      this.continueBtn?.setVisible(false);
      onExhausted();
      return;
    }
    this.messageText.setText(this.messageQueue.shift()!);
    this.continueBtn?.setVisible(true);
  }

  private animateHp(bar: Phaser.GameObjects.Graphics, current: number, max: number, x: number, y: number): void {
    bar.clear();
    const newBar = drawHpBar(this.scene, x, y, 180, 10, current, max, bar.depth);
    bar.destroy();
    if (bar === this.enemyHpBar) this.enemyHpBar = newBar;
    else this.playerHpBar = newBar;
  }
}
