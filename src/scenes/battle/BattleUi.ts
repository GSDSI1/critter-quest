import { FONT } from '../../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../../data/types';
import { getCreature } from '../../data/creatures';
import { getAbility } from '../../data/abilities';
import {
  GameState, type CritterInstance, displayName, expProgress,
} from '../../systems/stats';
import { addCreatureImage, applyCreatureTexture, startCritterIdle, type CritterIdleHandle } from '../../utils/assetLoader';
import { drawHpBar } from '../../ui/HUD';
import { statusLabel } from '../../systems/status';
import { createTouchButton } from '../../ui/touchButtons';
import { formatStatCompact } from '../../ui/statDisplay';
import type { BattleAnims } from './BattleAnims';
import { BattleMenus } from './BattleMenus';

export { MENU_ITEMS, battleMenuItems } from './BattleMenus';

function truncateLabel(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

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
  continueBtn!: ReturnType<typeof createTouchButton>;
  enemyNameText!: Phaser.GameObjects.Text;
  playerHpText!: Phaser.GameObjects.Text;
  abilityText!: Phaser.GameObjects.Text;
  playerStatsText!: Phaser.GameObjects.Text;

  private menus: BattleMenus;
  private messageQueue: string[] = [];
  private enemyIdle?: CritterIdleHandle;
  private playerIdle?: CritterIdleHandle;
  private enemyDisplayedHp = 0;
  private playerDisplayedHp = 0;

  constructor(
    private scene: Phaser.Scene,
    private host: BattleUiHost,
    private anims: BattleAnims,
  ) {
    this.menus = new BattleMenus(scene, host);
  }

  get menuContainer(): Phaser.GameObjects.Container { return this.menus.menuContainer; }
  get moveContainer(): Phaser.GameObjects.Container { return this.menus.moveContainer; }
  get bagContainer(): Phaser.GameObjects.Container { return this.menus.bagContainer; }

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
      fontFamily: FONT, fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.enemyHpBar = drawHpBar(this.scene, 356, 68, 180, 10, 0, 1);

    this.scene.add.image(180, 340, 'battle_platform').setAlpha(0.9);
    this.playerSprite = addCreatureImage(this.scene, 160, 290, this.host.playerMon.speciesId, false, 'back').setScale(2).setFlipX(true);
    if (this.host.playerMon.shiny) {
      this.playerSprite.setTint(0xffd966);
      this.playerSprite.setData('baseTint', 0xffd966);
    }
    this.playerIdle = startCritterIdle(this.scene, this.playerSprite, this.host.playerMon.speciesId, 290, 'back');

    const pBox = this.scene.add.graphics();
    pBox.fillStyle(COLORS.panel, 0.92);
    pBox.fillRoundedRect(40, 248, 260, 100, 8);
    pBox.lineStyle(2, COLORS.panelBorder, 1);
    pBox.strokeRoundedRect(40, 248, 260, 100, 8);

    this.scene.add.text(56, 256, displayName(this.host.playerMon), {
      fontFamily: FONT, fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.scene.add.text(56, 274, `Lv.${this.host.playerMon.level}`, {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
    });
    this.playerHpText = this.scene.add.text(200, 274, '', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    }).setOrigin(1, 0);
    this.abilityText = this.scene.add.text(56, 288, '', {
      fontFamily: FONT, fontSize: '8px', color: '#667788',
    });
    this.playerHpBar = drawHpBar(this.scene, 56, 300, 180, 10, 0, 1);
    this.expBar = drawHpBar(this.scene, 56, 316, 180, 6, 0, 1, 50);
    this.playerStatsText = this.scene.add.text(56, 330, '', {
      fontFamily: FONT, fontSize: '8px', color: '#8899aa',
    });

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
      fontFamily: FONT, fontSize: '13px', color: '#f0f0f0',
      wordWrap: { width: GAME_WIDTH - 80 },
      maxLines: 3,
    });

    this.menus.build();
    this.continueBtn = createTouchButton(
      this.scene, GAME_WIDTH - 70, 416, 'Continue ▶',
      () => this.host.onConfirm(),
      { width: 110, height: 34, depth: 1101, fontSize: '11px' },
    );
    this.continueBtn.setVisible(false);
    this.enemyDisplayedHp = this.host.wild.currentHp;
    this.playerDisplayedHp = this.host.playerMon.currentHp;
    this.refreshPlayerUi();
  }

  syncEnemyUi(animate = true): void {
    const def = getCreature(this.host.wild.speciesId);
    const status = statusLabel(this.host.wild.status);
    const star = this.host.wild.shiny ? '★ ' : '';
    this.enemyNameText.setText(truncateLabel(`${star}${def.name} Lv.${this.host.wild.level}${status ? ` ${status}` : ''}`, 22));
    this.enemyIdle?.stop();
    applyCreatureTexture(this.enemySprite, this.scene, this.host.wild.speciesId);
    this.enemySprite.setAlpha(1);
    if (this.host.wild.shiny) {
      this.enemySprite.setTint(0xffd966);
      this.enemySprite.setData('baseTint', 0xffd966);
      this.anims.playShinySparkle(this.enemySprite);
    } else {
      this.enemySprite.clearTint();
      this.enemySprite.setData('baseTint', undefined);
    }
    this.enemyIdle = startCritterIdle(this.scene, this.enemySprite, this.host.wild.speciesId, 130);
    this.animateHp(this.enemyHpBar, this.host.wild.currentHp, this.host.wild.maxHp, 356, 68, true);
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
    this.playerIdle = startCritterIdle(this.scene, this.playerSprite, speciesId, 290, 'back');
  }

  refreshPlayerUi(): void {
    const mon = this.host.playerMon;
    this.playerHpText.setText(`${mon.currentHp}/${mon.maxHp} ${statusLabel(mon.status)}`);
    this.animateHp(this.playerHpBar, mon.currentHp, mon.maxHp, 56, 300, false);
    this.expBar.clear();
    const prog = expProgress(mon);
    const expG = drawHpBar(this.scene, 56, 316, 180, 6, prog * 180, 180, 50);
    this.expBar.destroy();
    this.expBar = expG;
    this.abilityText.setText(`Ability: ${truncateLabel(getAbility(mon.ability).name, 20)}`);
    this.playerStatsText.setText(formatStatCompact(mon));
  }

  animateEnemyHp(): void {
    this.animateHp(this.enemyHpBar, this.host.wild.currentHp, this.host.wild.maxHp, 356, 68, true);
  }

  setContinueVisible(phase: BattlePhase): void {
    const show = phase === 'message' || phase === 'intro';
    this.continueBtn?.setVisible(show);
    this.continueBtn?.setEnabled(show);
    this.messageText.setWordWrapWidth(show ? GAME_WIDTH - 150 : GAME_WIDTH - 80);
  }

  showMenu(): void {
    this.continueBtn?.setVisible(false);
    this.menuContainer.setVisible(true);
    this.menus.updateMenuHighlight();
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

  updateMenuHighlight(): void {
    this.menus.updateMenuHighlight();
  }

  onNav(phase: BattlePhase, dy: number, dx: number): void {
    this.menus.onNav(phase, dy, dx);
  }

  openMoveMenu(): void {
    this.continueBtn?.setVisible(false);
    this.menus.openMoveMenu();
  }

  openBagMenu(): void {
    this.continueBtn?.setVisible(false);
    this.menus.openBagMenu();
  }

  refreshMoveMenu(): void {
    this.menus.refreshMoveMenu();
  }

  refreshBagMenu(): void {
    this.menus.refreshBagMenu();
  }

  queueMessage(msg: string): void { this.messageQueue.push(msg); }

  showNextMessage(onExhausted: () => void): boolean {
    if (this.messageQueue.length === 0) {
      this.continueBtn?.setVisible(false);
      onExhausted();
      return false;
    }
    this.messageText.setText(this.messageQueue.shift()!);
    this.continueBtn?.setVisible(true);
    return true;
  }

  private animateHp(
    bar: Phaser.GameObjects.Graphics,
    targetCurrent: number,
    max: number,
    x: number,
    y: number,
    isEnemy: boolean,
  ): void {
    const key = isEnemy ? 'enemyDisplayedHp' : 'playerDisplayedHp';
    const start = this[key];
    if (start === targetCurrent) {
      bar.clear();
      const newBar = drawHpBar(this.scene, x, y, 180, 10, targetCurrent, max, bar.depth);
      bar.destroy();
      if (isEnemy) this.enemyHpBar = newBar;
      else this.playerHpBar = newBar;
      return;
    }
    this.scene.tweens.addCounter({
      from: start,
      to: targetCurrent,
      duration: 300,
      ease: 'Quad.easeOut',
      onUpdate: tween => {
        const val = Math.round(tween.getValue() ?? targetCurrent);
        this[key] = val;
        bar.clear();
        const newBar = drawHpBar(this.scene, x, y, 180, 10, val, max, bar.depth);
        bar.destroy();
        if (isEnemy) this.enemyHpBar = newBar;
        else this.playerHpBar = newBar;
        bar = newBar;
      },
      onComplete: () => { this[key] = targetCurrent; },
    });
  }
}
