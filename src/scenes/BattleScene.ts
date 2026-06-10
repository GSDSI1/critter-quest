import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { getItem, removeItem } from '../data/items';
import { getBadge } from '../data/badges';
import { getAbility } from '../data/abilities';
import {
  executeMove, tryCatchWithItem, tryRun, pickAiMove, expGain,
  endOfTurnStatus, effectiveSpeed, moneyLossOnBlackout,
  applyEnterAbility, tryHeldBerry, isRunBlocked,
} from '../systems/battle';
import {
  checkEvolution, evolveCritter, processLevelUp, evolutionMessage,
} from '../systems/evolution';
import { getBattleUsableItems, useItemOnCritter } from '../systems/items';
import {
  GameState, type CritterInstance, displayName, firstAlive,
  isFainted, addExp, healParty, registerCaught, registerSeen, expProgress,
} from '../systems/stats';
import { addToParty } from '../systems/save';
import { trySave } from '../utils/saveFeedback';
import { drawHpBar } from '../ui/HUD';
import { statusLabel } from '../systems/status';
import { creatureTextureKey, battleBgForMap } from '../utils/assetLoader';
import { Sfx } from '../utils/audio';
import { Input } from '../systems/input';

type BattlePhase = 'intro' | 'menu' | 'fight' | 'moves' | 'bag' | 'message' | 'enemy' | 'evolve' | 'learn';

const MENU_ITEMS = ['Fight', 'Bag', 'Switch', 'Run'] as const;
const MENU_POS: [number, number][] = [[380, 378], [510, 378], [380, 418], [510, 418]];

export class BattleScene extends Phaser.Scene {
  private enemyParty: CritterInstance[] = [];
  private enemyIndex = 0;
  private wild!: CritterInstance;
  private playerMon!: CritterInstance;
  private isTrainer = false;
  private trainerId = '';
  private trainerName = '';
  private reward = 0;
  private badgeId = '';
  private isRematch = false;
  private mapId = 'route1';

  private phase: BattlePhase = 'intro';
  private messageQueue: string[] = [];
  private pendingLearnMoves: string[] = [];
  private pendingEvolution: string | null = null;
  private evolveStep = 0;
  private menuIndex = 0;
  private moveIndex = 0;
  private bagIndex = 0;
  private menuHighlights: Phaser.GameObjects.Graphics[] = [];
  private moveHighlights: Phaser.GameObjects.Graphics[] = [];
  private bagHighlights: Phaser.GameObjects.Graphics[] = [];

  private enemySprite!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private expBar!: Phaser.GameObjects.Graphics;
  private messageText!: Phaser.GameObjects.Text;
  private menuContainer!: Phaser.GameObjects.Container;
  private moveContainer!: Phaser.GameObjects.Container;
  private bagContainer!: Phaser.GameObjects.Container;
  private enemyNameText!: Phaser.GameObjects.Text;
  private playerHpText!: Phaser.GameObjects.Text;
  private abilityText!: Phaser.GameObjects.Text;

  constructor() {
    super('Battle');
  }

  create(data: {
    enemyParty: CritterInstance[];
    isTrainer?: boolean;
    trainerId?: string;
    trainerName?: string;
    reward?: number;
    badge?: string;
    isRematch?: boolean;
    mapId?: string;
  }): void {
    Sfx.battleStart();
    this.enemyParty = data.enemyParty.map(c => structuredClone(c));
    this.enemyIndex = 0;
    this.wild = this.enemyParty[0];
    this.isTrainer = data.isTrainer ?? false;
    this.trainerId = data.trainerId ?? '';
    this.trainerName = data.trainerName ?? 'Trainer';
    this.reward = data.reward ?? 0;
    this.badgeId = data.badge ?? '';
    this.isRematch = data.isRematch ?? false;
    this.mapId = data.mapId ?? 'route1';
    this.menuIndex = 0;
    this.moveIndex = 0;
    this.bagIndex = 0;
    this.pendingLearnMoves = [];
    this.pendingEvolution = null;
    this.evolveStep = 0;

    const alive = firstAlive(GameState.player.party);
    if (!alive) { this.scene.start('Overworld'); return; }
    this.playerMon = alive;

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, battleBgForMap(this.mapId));
    this.buildUi();
    Input.bind(this);
    this.syncEnemyUi(false);

    registerSeen(GameState.player.dexSeen, this.wild.speciesId);

    if (this.isTrainer) {
      this.queueMessage(`${this.trainerName} wants to battle!`);
      this.queueMessage(`${this.trainerName} sent out ${getCreature(this.wild.speciesId).name}!`);
      const enterMsg = applyEnterAbility(this.wild, this.playerMon);
      if (enterMsg) this.queueMessage(enterMsg);
    } else {
      this.queueMessage(`A wild ${getCreature(this.wild.speciesId).name} appeared!`);
    }
    this.queueMessage(`Go, ${displayName(this.playerMon)}!`);
    const playerEnter = applyEnterAbility(this.playerMon, this.wild);
    if (playerEnter) this.queueMessage(playerEnter);

    this.abilityText.setText(getAbility(this.playerMon.ability).name);
    this.phase = 'intro';
    this.playerSprite.setX(-80);
    this.enemySprite.setAlpha(0);
    this.time.delayedCall(200, () => {
      this.animateSendOut(this.playerSprite, 160);
      this.tweens.add({ targets: this.enemySprite, alpha: 1, duration: 400 });
      this.phase = 'message';
      this.showNextMessage();
    });
  }

  private buildUi(): void {
    this.add.image(480, 175, 'battle_platform').setAlpha(0.9);
    this.enemySprite = this.add.image(480, 130, creatureTextureKey(this, this.wild.speciesId)).setScale(1.5);
    this.tweens.add({ targets: this.enemySprite, y: 125, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const eBox = this.add.graphics();
    eBox.fillStyle(COLORS.panel, 0.92);
    eBox.fillRoundedRect(340, 24, 260, 80, 8);
    eBox.lineStyle(2, COLORS.panelBorder, 1);
    eBox.strokeRoundedRect(340, 24, 260, 80, 8);

    this.enemyNameText = this.add.text(356, 32, '', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.enemyHpBar = drawHpBar(this, 356, 68, 180, 10, 0, 1);

    this.add.image(180, 340, 'battle_platform').setAlpha(0.9);
    this.playerSprite = this.add.image(160, 290, creatureTextureKey(this, this.playerMon.speciesId)).setScale(2).setFlipX(true);
    this.tweens.add({ targets: this.playerSprite, y: 285, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const pBox = this.add.graphics();
    pBox.fillStyle(COLORS.panel, 0.92);
    pBox.fillRoundedRect(40, 248, 260, 88, 8);
    pBox.lineStyle(2, COLORS.panelBorder, 1);
    pBox.strokeRoundedRect(40, 248, 260, 88, 8);

    this.add.text(56, 256, displayName(this.playerMon), {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0', fontStyle: 'bold',
    });
    this.add.text(56, 274, `Lv.${this.playerMon.level}`, {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    });
    this.abilityText = this.add.text(200, 274, '', {
      fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#667788',
    }).setOrigin(1, 0);
    this.playerHpText = this.add.text(230, 274, '', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
    });
    this.playerHpBar = drawHpBar(this, 56, 292, 180, 10, 0, 1);
    this.expBar = drawHpBar(this, 56, 308, 180, 6, 0, 1, 50);

    const msgBg = this.add.graphics();
    msgBg.fillStyle(COLORS.panel, 0.97);
    msgBg.fillRoundedRect(16, 368, GAME_WIDTH - 32, 96, 10);
    msgBg.lineStyle(3, COLORS.panelBorder, 1);
    msgBg.strokeRoundedRect(16, 368, GAME_WIDTH - 32, 96, 10);

    this.messageText = this.add.text(32, 384, '', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
      wordWrap: { width: GAME_WIDTH - 64 },
    });

    this.buildMenu();
    this.moveContainer = this.add.container(0, 0).setVisible(false);
    this.bagContainer = this.add.container(0, 0).setVisible(false);
    this.refreshPlayerUi();
  }

  private syncEnemyUi(animate = true): void {
    const def = getCreature(this.wild.speciesId);
    this.enemyNameText.setText(`${def.name}  Lv.${this.wild.level}  ${statusLabel(this.wild.status)}`);
    this.enemySprite.setTexture(creatureTextureKey(this, this.wild.speciesId));
    this.enemySprite.setAlpha(1);
    this.animateHp(this.enemyHpBar, this.wild.currentHp, this.wild.maxHp, 356, 68);
    const old = this.children.getByName('enemyTypes');
    if (old) old.destroy();
    def.types.forEach((t, i) => {
      this.add.image(520 + i * 20, 50, `type_${t}`).setScale(0.8).setName('enemyTypes');
    });
    if (animate) this.animateSendOut(this.enemySprite, 480);
  }

  private refreshPlayerUi(): void {
    this.playerHpText.setText(`${this.playerMon.currentHp}/${this.playerMon.maxHp} ${statusLabel(this.playerMon.status)}`);
    this.animateHp(this.playerHpBar, this.playerMon.currentHp, this.playerMon.maxHp, 56, 292);
    this.expBar.clear();
    const prog = expProgress(this.playerMon);
    const expG = drawHpBar(this, 56, 308, 180, 6, prog * 180, 180, 50);
    this.expBar.destroy();
    this.expBar = expG;
    this.abilityText.setText(getAbility(this.playerMon.ability).name);
  }

  private buildMenu(): void {
    this.menuContainer = this.add.container(0, 0);
    this.menuHighlights = [];
    MENU_ITEMS.forEach((label, i) => {
      const [x, y] = MENU_POS[i];
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.panelBorder, 0.8);
      bg.fillRoundedRect(x - 4, y - 4, 110, 32, 6);
      const t = this.add.text(x + 55, y + 12, label, {
        fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f0f0f0',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.menuIndex = i; this.updateMenuHighlight(); this.menuChoice(label); });
      const hi = this.add.graphics();
      this.menuHighlights.push(hi);
      this.menuContainer.add([bg, t, hi]);
    });
    this.menuContainer.setVisible(false);
    this.updateMenuHighlight();
  }

  private updateMenuHighlight(): void {
    this.menuHighlights.forEach((hi, i) => {
      hi.clear();
      if (i !== this.menuIndex) return;
      const [x, y] = MENU_POS[i];
      hi.lineStyle(2, COLORS.accent, 1);
      hi.strokeRoundedRect(x - 4, y - 4, 110, 32, 6);
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) this.onNav(-1, 0);
    if (Input.justPressed('down')) this.onNav(1, 0);
    if (Input.justPressed('left')) this.onNav(0, -1);
    if (Input.justPressed('right')) this.onNav(0, 1);
    if (Input.justPressed('confirm')) this.onConfirm();
    if (Input.justPressed('cancel') && (this.phase === 'moves' || this.phase === 'bag')) {
      this.phase = 'menu';
      this.moveContainer.setVisible(false);
      this.bagContainer.setVisible(false);
      this.menuContainer.setVisible(true);
      this.updateMenuHighlight();
    }
  }

  private onNav(dy: number, dx: number): void {
    if (this.phase === 'menu') {
      if (dx !== 0) this.menuIndex = (this.menuIndex + (dx > 0 ? 1 : -1) + 4) % 4;
      if (dy !== 0) this.menuIndex = (this.menuIndex + (dy > 0 ? 2 : -2) + 4) % 4;
      this.updateMenuHighlight();
    } else if (this.phase === 'moves') {
      if (dx !== 0) this.moveIndex = Phaser.Math.Clamp(this.moveIndex + dx, 0, this.playerMon.moves.length - 1);
      if (dy !== 0) {
        const next = this.moveIndex + dy * 2;
        if (next >= 0 && next < this.playerMon.moves.length) this.moveIndex = next;
      }
      this.refreshMoveMenu();
    } else if (this.phase === 'bag') {
      const items = getBattleUsableItems(GameState.player.items, !this.isTrainer);
      if (items.length === 0) return;
      this.bagIndex = Phaser.Math.Clamp(this.bagIndex + dy, 0, items.length - 1);
      this.refreshBagMenu();
    }
  }

  private onConfirm(): void {
    if (this.phase === 'message' || this.phase === 'intro') this.showNextMessage();
    else if (this.phase === 'evolve') this.doEvolution();
    else if (this.phase === 'menu') this.menuChoice(MENU_ITEMS[this.menuIndex]);
    else if (this.phase === 'moves') this.useMove(this.moveIndex);
    else if (this.phase === 'bag') {
      const items = getBattleUsableItems(GameState.player.items, !this.isTrainer);
      if (items[this.bagIndex]) this.useBagItem(items[this.bagIndex]);
    }
  }

  private menuChoice(choice: string): void {
    if (this.phase !== 'menu') return;
    Sfx.menuConfirm();
    switch (choice) {
      case 'Fight':
        this.phase = 'moves';
        this.moveIndex = 0;
        this.menuContainer.setVisible(false);
        this.refreshMoveMenu();
        this.moveContainer.setVisible(true);
        break;
      case 'Bag':
        this.phase = 'bag';
        this.bagIndex = 0;
        this.menuContainer.setVisible(false);
        this.refreshBagMenu();
        this.bagContainer.setVisible(true);
        break;
      case 'Switch':
        this.scene.launch('Party', { battleSwitch: true, voluntarySwitch: true });
        this.scene.pause();
        break;
      case 'Run':
        this.menuContainer.setVisible(false);
        this.doRun();
        break;
    }
  }

  private refreshMoveMenu(): void {
    this.moveContainer.removeAll(true);
    this.moveHighlights = [];
    this.playerMon.moves.forEach((m, i) => {
      const move = getMove(m.id);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 32 + col * 290;
      const y = 380 + row * 36;
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.moveIndex ? 1 : 0.85);
      bg.fillRoundedRect(x, y, 270, 30, 5);
      this.add.image(x + 8, y + 15, `type_${move.type}`).setOrigin(0, 0.5).setScale(0.7);
      const label = this.add.text(x + 28, y + 6, `${move.name}  ${m.pp}/${m.maxPp}`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: i === this.moveIndex ? '#f5c542' : '#f0f0f0',
      }).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => { this.moveIndex = i; this.useMove(i); });
      this.moveContainer.add([bg, label]);
    });
  }

  private refreshBagMenu(): void {
    this.bagContainer.removeAll(true);
    const items = getBattleUsableItems(GameState.player.items, !this.isTrainer);
    if (items.length === 0) {
      this.bagContainer.add(this.add.text(40, 390, 'No usable items!', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
      }));
      return;
    }
    items.forEach((id, i) => {
      const item = getItem(id);
      const y = 378 + i * 28;
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.panelBorder, i === this.bagIndex ? 1 : 0.85);
      bg.fillRoundedRect(32, y, 300, 24, 4);
      const label = this.add.text(40, y + 4, `${i === this.bagIndex ? '▶ ' : ''}${item.name} x${GameState.player.items[id]}`, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: i === this.bagIndex ? '#f5c542' : '#f0f0f0',
      }).setInteractive({ useHandCursor: true });
      label.on('pointerdown', () => { this.bagIndex = i; this.useBagItem(id); });
      this.bagContainer.add([bg, label]);
    });
  }

  private useBagItem(itemId: string): void {
    const item = getItem(itemId);
    this.bagContainer.setVisible(false);

    if (item.category === 'capture') {
      if (this.isTrainer) return;
      removeItem(GameState.player.items, itemId);
      this.doCatch(itemId);
      return;
    }

    const result = useItemOnCritter(GameState.player.items, itemId, this.playerMon);
    this.queueMessage(result.message);
    this.phase = 'message';
    this.refreshPlayerUi();
    this.showNextMessage();
    if (result.ok) {
      this.time.delayedCall(600, () => this.enemyTurn());
    } else {
      this.time.delayedCall(400, () => { this.phase = 'menu'; this.menuContainer.setVisible(true); });
    }
  }

  private useMove(index: number): void {
    if (this.phase !== 'moves') return;
    this.moveContainer.setVisible(false);
    this.phase = 'fight';

    const result = executeMove(this.playerMon, this.wild, index);
    this.queueMessage(result.message);

    if (result.cantMove) {
      this.refreshPlayerUi();
      this.phase = 'message';
      this.showNextMessage();
      if (result.attackerFainted || isFainted(this.playerMon)) {
        this.time.delayedCall(800, () => this.onPlayerFainted());
      } else {
        this.time.delayedCall(600, () => this.enemyTurn());
      }
      return;
    }

    if (result.damage && result.damage > 0) {
      Sfx.hit();
      this.cameras.main.shake(120, 0.004);
      this.tweens.add({ targets: this.enemySprite, x: 490, duration: 50, yoyo: true, repeat: 3 });
      this.animateHp(this.enemyHpBar, this.wild.currentHp, this.wild.maxHp, 356, 68);
      if (result.effectiveness && result.effectiveness > 1) {
        this.enemySprite.setTint(0xff4444);
        this.time.delayedCall(350, () => this.enemySprite.clearTint());
      } else if (result.effectiveness && result.effectiveness < 1) {
        this.enemySprite.setTint(0x888888);
        this.time.delayedCall(350, () => this.enemySprite.clearTint());
      }
    }

    if (result.fainted) {
      this.phase = 'message';
      this.showNextMessage();
      this.time.delayedCall(400, () => {
        this.animateFaint(this.enemySprite, () => this.onEnemyFainted());
      });
      return;
    }

    this.phase = 'message';
    this.showNextMessage();
    this.time.delayedCall(600, () => this.enemyTurn());
  }

  private enemyTurn(): void {
    if (isFainted(this.wild) || isFainted(this.playerMon)) return;

    const berryMsg = tryHeldBerry(this.playerMon);
    if (berryMsg) {
      this.queueMessage(berryMsg);
      this.refreshPlayerUi();
    }
    const enemyBerry = tryHeldBerry(this.wild);
    if (enemyBerry) {
      this.queueMessage(enemyBerry);
      this.animateHp(this.enemyHpBar, this.wild.currentHp, this.wild.maxHp, 356, 68);
    }

    const statusMsg = endOfTurnStatus(this.playerMon);
    if (statusMsg) {
      this.queueMessage(statusMsg);
      this.refreshPlayerUi();
      if (isFainted(this.playerMon)) {
        this.phase = 'message';
        this.showNextMessage();
        this.time.delayedCall(800, () => this.onPlayerFainted());
        return;
      }
    }

    this.phase = 'enemy';
    const aiMove = pickAiMove(this.wild, this.playerMon);
    const result = executeMove(this.wild, this.playerMon, aiMove);
    this.queueMessage(result.message);

    if (result.damage && result.damage > 0) {
      Sfx.hit();
      this.cameras.main.shake(120, 0.004);
      this.tweens.add({ targets: this.playerSprite, x: 150, duration: 50, yoyo: true, repeat: 3 });
      this.refreshPlayerUi();
    }

    const enemyStatus = endOfTurnStatus(this.wild);
    if (enemyStatus) {
      this.queueMessage(enemyStatus);
      this.animateHp(this.enemyHpBar, this.wild.currentHp, this.wild.maxHp, 356, 68);
      if (isFainted(this.wild)) {
        this.phase = 'message';
        this.showNextMessage();
        this.time.delayedCall(400, () => {
          this.animateFaint(this.enemySprite, () => this.onEnemyFainted());
        });
        return;
      }
    }

    this.phase = 'message';
    this.showNextMessage();
    if (isFainted(this.playerMon)) {
      this.time.delayedCall(800, () => this.onPlayerFainted());
    }
  }

  private onEnemyFainted(): void {
    if (this.enemyIndex < this.enemyParty.length - 1) {
      this.enemyIndex++;
      this.wild = structuredClone(this.enemyParty[this.enemyIndex]);
      registerSeen(GameState.player.dexSeen, this.wild.speciesId);
      this.enemySprite.setAlpha(0);
      this.syncEnemyUi(true);
      this.queueMessage(`${this.trainerName} sent out ${getCreature(this.wild.speciesId).name}!`);
      const enterMsg = applyEnterAbility(this.wild, this.playerMon);
      if (enterMsg) this.queueMessage(enterMsg);
      this.phase = 'message';
      this.showNextMessage();
      this.time.delayedCall(600, () => { this.phase = 'menu'; this.menuContainer.setVisible(true); });
      return;
    }
    this.onVictory();
  }

  private doCatch(itemId: string): void {
    const { caught, shakes, message } = tryCatchWithItem(this.wild, itemId);
    this.queueMessage(message);
    this.phase = 'message';
    this.showNextMessage();

    const orb = this.add.image(GAME_WIDTH / 2, 200, 'capture_orb').setScale(3);
    this.tweens.add({
      targets: orb, y: 130, duration: 300,
      onComplete: () => {
        let shakeCount = 0;
        const doShake = () => {
          if (shakeCount >= shakes) {
            if (caught) {
              Sfx.catch();
              registerCaught(GameState.player.dexCaught, this.wild.speciesId, GameState.player.dexSeen);
              orb.destroy();
              this.promptNickname(this.wild);
            } else {
              orb.destroy();
              this.time.delayedCall(400, () => { this.phase = 'menu'; this.menuContainer.setVisible(true); });
            }
            return;
          }
          shakeCount++;
          this.tweens.add({
            targets: orb, angle: { from: -20, to: 20 }, duration: 150, yoyo: true,
            onComplete: doShake,
          });
        };
        doShake();
      },
    });
  }

  private promptNickname(caught: CritterInstance): void {
    const def = getCreature(caught.speciesId);
    this.scene.launch('Nickname', {
      speciesName: def.name,
      onDone: (nickname: string | undefined) => {
        if (nickname) caught.nickname = nickname;
        addToParty(caught);
        trySave(this);
        this.endBattle(true);
      },
    });
    this.scene.pause();
  }

  private doRun(): void {
    if (this.isTrainer) {
      this.queueMessage("You can't run from a trainer battle!");
      this.phase = 'message';
      this.showNextMessage();
      this.time.delayedCall(400, () => { this.phase = 'menu'; this.menuContainer.setVisible(true); });
      return;
    }
    const blocked = isRunBlocked(this.wild.ability);
    const fled = tryRun(effectiveSpeed(this.playerMon), effectiveSpeed(this.wild), blocked);
    this.queueMessage(fled ? 'Got away safely!' : blocked ? "Can't escape!" : "Can't escape!");
    this.phase = 'message';
    this.showNextMessage();
    if (fled) this.time.delayedCall(600, () => this.endBattle(false));
    else this.time.delayedCall(600, () => this.enemyTurn());
  }

  private onVictory(): void {
    const exp = expGain(this.wild, !this.isTrainer);
    const levels = addExp(this.playerMon, exp);
    this.queueMessage(`${displayName(this.playerMon)} gained ${exp} EXP!`);
    Sfx.levelUp();

    for (const lv of levels) {
      if (lv.leveledUp) {
        this.queueMessage(`${displayName(this.playerMon)} grew to level ${lv.newLevel}!`);
        const { movesToLearn } = processLevelUp(this.playerMon, lv.oldLevel);
        this.pendingLearnMoves.push(...movesToLearn);
        const evo = checkEvolution(this.playerMon);
        if (evo) this.pendingEvolution = evo;
      }
    }

    if (this.isTrainer) {
      GameState.player.money += this.reward;
      if (this.isRematch) {
        if (!GameState.player.defeatedRematch.includes(this.trainerId)) {
          GameState.player.defeatedRematch.push(this.trainerId);
        }
      } else if (!GameState.player.defeatedTrainers.includes(this.trainerId)) {
        GameState.player.defeatedTrainers.push(this.trainerId);
      }

      if (this.trainerId === 'rival' || this.trainerId.startsWith('rival')) {
        GameState.player.storyFlags.running = true;
      }
      if (this.trainerId === 'ranger') GameState.player.storyFlags.defeated_ranger = true;

      this.queueMessage(`${this.trainerName} gave you $${this.reward}!`);

      if (this.badgeId && !GameState.player.badges.includes(this.badgeId)) {
        GameState.player.badges.push(this.badgeId);
        const badge = getBadge(this.badgeId);
        this.queueMessage(`${this.trainerName} awarded you the ${badge.name}!`);
        if (this.badgeId === 'verdant') GameState.player.storyFlags.verdant_badge = true;
        if (this.badgeId === 'ember') GameState.player.storyFlags.ember_badge = true;
      }
    }

    trySave(this);
    this.refreshPlayerUi();
    this.phase = 'message';
    this.showNextMessage();
    this.time.delayedCall(800, () => this.processPostVictory());
  }

  private processPostVictory(): void {
    if (this.pendingLearnMoves.length > 0) {
      this.promptLearnMove(this.pendingLearnMoves.shift()!);
      return;
    }
    if (this.pendingEvolution) {
      this.phase = 'evolve';
      this.evolveStep = 0;
      this.queueMessage(evolutionMessage(this.playerMon.speciesId, this.pendingEvolution!));
      this.showNextMessage();
      return;
    }
    this.endBattle(false);
  }

  private promptLearnMove(moveId: string): void {
    this.phase = 'learn';
    this.scene.launch('LearnMove', {
      critter: this.playerMon,
      moveId,
      onDone: (result: { learned: boolean; replaced?: string }) => {
        if (result.learned) {
          const move = getMove(moveId);
          this.queueMessage(`${displayName(this.playerMon)} learned ${move.name}!`);
        }
        this.scene.resume();
        this.phase = 'message';
        this.showNextMessage();
        this.time.delayedCall(600, () => this.processPostVictory());
      },
    });
    this.scene.pause();
  }

  private doEvolution(): void {
    if (!this.pendingEvolution) { this.endBattle(false); return; }
    const to = this.pendingEvolution;
    const from = this.playerMon.speciesId;

    if (this.evolveStep === 0) {
      this.evolveStep = 1;
      this.cameras.main.flash(400, 255, 255, 255);
      this.playerSprite.setAlpha(0.2);
      this.queueMessage('...');
      this.showNextMessage();
      return;
    }

    if (this.evolveStep === 1) {
      this.evolveStep = 2;
      evolveCritter(this.playerMon, to);
      this.playerSprite.setTexture(creatureTextureKey(this, to));
      this.playerSprite.setAlpha(1);
      this.cameras.main.flash(300, 255, 255, 200);
      registerCaught(GameState.player.dexCaught, to, GameState.player.dexSeen);
      const b = getCreature(to).baseStats;
      this.queueMessage(`It evolved into ${getCreature(to).name}!`);
      this.queueMessage(`Base stats — HP:${b.hp} ATK:${b.atk} DEF:${b.def} SPA:${b.spa} SPD:${b.spd} SPE:${b.spe}`);
      this.pendingEvolution = null;
      trySave(this);
      this.showNextMessage();
      this.time.delayedCall(1200, () => this.processPostVictory());
    }
  }

  private onPlayerFainted(): void {
    const next = GameState.player.party.find(c => !isFainted(c) && c.uid !== this.playerMon.uid);
    if (next) {
      this.scene.launch('Party', { battleSwitch: true, forcedSwitch: true });
      this.scene.pause();
    } else {
      this.blackout();
    }
  }

  private blackout(): void {
    const loss = moneyLossOnBlackout(GameState.player.money);
    GameState.player.money -= loss;
    healParty(GameState.player.party);
    GameState.player.mapId = 'heal_center';
    GameState.player.x = 4;
    GameState.player.y = 7;
    trySave(this);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('Overworld', { blackout: true });
    });
  }

  private endBattle(_caught: boolean): void {
    const triggerVictory = this.trainerId === 'rival3'
      && GameState.player.badges.length >= 2
      && !GameState.player.storyFlags.champion;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      if (triggerVictory) this.scene.start('Victory');
      else this.scene.start('Overworld', { fromBattle: true });
    });
  }

  private queueMessage(msg: string): void { this.messageQueue.push(msg); }

  private showNextMessage(): void {
    if (this.messageQueue.length === 0) {
      if (this.phase === 'message' || this.phase === 'intro') {
        this.phase = 'menu';
        this.menuContainer.setVisible(true);
        this.updateMenuHighlight();
      }
      return;
    }
    this.messageText.setText(this.messageQueue.shift()!);
  }

  private animateHp(bar: Phaser.GameObjects.Graphics, current: number, max: number, x: number, y: number): void {
    bar.clear();
    const newBar = drawHpBar(this, x, y, 180, 10, current, max, bar.depth);
    bar.destroy();
    if (bar === this.enemyHpBar) this.enemyHpBar = newBar;
    else this.playerHpBar = newBar;
  }

  private animateSendOut(sprite: Phaser.GameObjects.Image, endX: number): void {
    const startX = sprite === this.playerSprite ? -80 : GAME_WIDTH + 80;
    sprite.x = startX;
    this.tweens.add({ targets: sprite, x: endX, duration: 450, ease: 'Back.easeOut' });
  }

  private animateFaint(sprite: Phaser.GameObjects.Image, onDone: () => void): void {
    this.tweens.add({
      targets: sprite, alpha: 0, y: sprite.y + 30, duration: 500,
      onComplete: onDone,
    });
  }

  switchTo(index: number, voluntary = true): void {
    const c = GameState.player.party[index];
    if (!c || isFainted(c) || c.uid === this.playerMon.uid) return;
    this.playerMon = c;
    this.playerSprite.setTexture(creatureTextureKey(this, c.speciesId));
    this.playerSprite.setAlpha(1);
    this.refreshPlayerUi();
    this.abilityText.setText(getAbility(c.ability).name);
    this.animateSendOut(this.playerSprite, 160);
    const enterMsg = applyEnterAbility(c, this.wild);
    this.queueMessage(`${displayName(c)} was sent out!`);
    if (enterMsg) this.queueMessage(enterMsg);
    this.phase = 'message';
    this.moveContainer.setVisible(false);
    this.showNextMessage();
    this.scene.resume();
    if (voluntary) {
      this.time.delayedCall(600, () => this.enemyTurn());
    } else {
      this.time.delayedCall(600, () => { this.phase = 'menu'; this.menuContainer.setVisible(true); });
    }
  }
}
