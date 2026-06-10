import Phaser from 'phaser';
import { getCreature } from '../../data/creatures';
import { getItem, removeItem } from '../../data/items';
import { getBadge } from '../../data/badges';
import {
  executeMove, tryCatchWithItem, tryRun, pickAiMove, expGain,
  endOfTurnStatus, effectiveSpeed, applyEnterAbility, tryHeldBerry, isRunBlocked,
} from '../../systems/battle';
import { isEliteGauntletActive } from '../../systems/eliteGauntlet';
import {
  checkEvolution, evolveCritter, processLevelUp,
} from '../../systems/evolution';
import { useItemOnCritter } from '../../systems/items';
import {
  GameState, type CritterInstance, displayName, isFainted, addExp, registerCaught, registerSeen,
} from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { creatureTextureKey } from '../../utils/assetLoader';
import { Sfx } from '../../utils/audio';
import type { BattlePhase } from './BattleUi';
import type { BattleUi } from './BattleUi';
import type { BattleAnims } from './BattleAnims';

export interface BattleFlowHost {
  readonly time: Phaser.Time.Clock;
  readonly scene: Phaser.Scenes.ScenePlugin;
  phase: BattlePhase;
  playerMon: CritterInstance;
  wild: CritterInstance;
  isTrainer: boolean;
  enemyParty: CritterInstance[];
  enemyIndex: number;
  trainerId: string;
  trainerName: string;
  reward: number;
  badgeId: string;
  isRematch: boolean;
  pendingLearnMoves: string[];
  pendingEvolution: string | null;
  evolveStep: number;
  ui: BattleUi;
  battleAnims: BattleAnims;
  showNextMessage(): void;
  processPostVictory(): void;
  endBattle(caught: boolean): void;
  promptNickname(caught: CritterInstance): void;
  promptLearnMove(moveId: string): void;
  onPlayerFainted(): void;
}

export class BattleFlow {
  constructor(private host: BattleFlowHost) {}

  useBagItem(itemId: string): void {
    const item = getItem(itemId);
    this.host.ui.bagContainer.setVisible(false);
    if (isEliteGauntletActive() && (item.category === 'heal' || item.revive)) {
      this.host.ui.queueMessage("Can't use healing items during the Elite Gauntlet!");
      this.host.phase = 'message';
      this.host.showNextMessage();
      this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
      return;
    }
    if (item.category === 'capture') {
      if (this.host.isTrainer) return;
      removeItem(GameState.player.items, itemId);
      this.doCatch(itemId);
      return;
    }
    const result = useItemOnCritter(GameState.player.items, itemId, this.host.playerMon);
    this.host.ui.queueMessage(result.message);
    this.host.phase = 'message';
    this.host.ui.refreshPlayerUi();
    this.host.showNextMessage();
    if (result.ok) this.host.time.delayedCall(600, () => this.enemyTurn());
    else this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
  }

  useMove(index: number): void {
    if (this.host.phase !== 'moves') return;
    this.host.ui.moveContainer.setVisible(false);
    this.host.phase = 'fight';
    const result = executeMove(this.host.playerMon, this.host.wild, index);
    this.host.ui.queueMessage(result.message);
    if (result.cantMove) {
      this.host.ui.refreshPlayerUi();
      this.host.phase = 'message';
      this.host.showNextMessage();
      if (result.attackerFainted || isFainted(this.host.playerMon)) {
        this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
      } else {
        this.host.time.delayedCall(600, () => this.enemyTurn());
      }
      return;
    }
    if (result.damage && result.damage > 0) {
      this.host.battleAnims.playHitOnEnemy(this.host.ui.enemySprite);
      this.host.ui.animateEnemyHp();
      this.host.battleAnims.applyEffectivenessTint(this.host.ui.enemySprite, result.effectiveness);
    }
    if (result.fainted) {
      this.host.phase = 'message';
      this.host.showNextMessage();
      this.host.time.delayedCall(400, () => {
        this.host.battleAnims.animateFaint(this.host.ui.enemySprite, () => this.onEnemyFainted());
      });
      return;
    }
    this.host.phase = 'message';
    this.host.showNextMessage();
    this.host.time.delayedCall(600, () => this.enemyTurn());
  }

  enemyTurn(): void {
    if (isFainted(this.host.wild) || isFainted(this.host.playerMon)) return;
    const berryMsg = tryHeldBerry(this.host.playerMon);
    if (berryMsg) { this.host.ui.queueMessage(berryMsg); this.host.ui.refreshPlayerUi(); }
    const enemyBerry = tryHeldBerry(this.host.wild);
    if (enemyBerry) { this.host.ui.queueMessage(enemyBerry); this.host.ui.animateEnemyHp(); }
    const statusMsg = endOfTurnStatus(this.host.playerMon);
    if (statusMsg) {
      this.host.ui.queueMessage(statusMsg);
      this.host.ui.refreshPlayerUi();
      if (isFainted(this.host.playerMon)) {
        this.host.phase = 'message';
        this.host.showNextMessage();
        this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
        return;
      }
    }
    this.host.phase = 'enemy';
    const result = executeMove(this.host.wild, this.host.playerMon, pickAiMove(this.host.wild, this.host.playerMon));
    this.host.ui.queueMessage(result.message);
    if (result.damage && result.damage > 0) {
      this.host.battleAnims.playHitOnPlayer(this.host.ui.playerSprite);
      this.host.ui.refreshPlayerUi();
    }
    const enemyStatus = endOfTurnStatus(this.host.wild);
    if (enemyStatus) {
      this.host.ui.queueMessage(enemyStatus);
      this.host.ui.animateEnemyHp();
      if (isFainted(this.host.wild)) {
        this.host.phase = 'message';
        this.host.showNextMessage();
        this.host.time.delayedCall(400, () => {
          this.host.battleAnims.animateFaint(this.host.ui.enemySprite, () => this.onEnemyFainted());
        });
        return;
      }
    }
    this.host.phase = 'message';
    this.host.showNextMessage();
    if (isFainted(this.host.playerMon)) this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
  }

  onEnemyFainted(): void {
    if (this.host.enemyIndex < this.host.enemyParty.length - 1) {
      this.host.enemyIndex++;
      this.host.wild = structuredClone(this.host.enemyParty[this.host.enemyIndex]);
      registerSeen(GameState.player.dexSeen, this.host.wild.speciesId);
      this.host.ui.enemySprite.setAlpha(0);
      this.host.ui.syncEnemyUi(true);
      this.host.ui.queueMessage(`${this.host.trainerName} sent out ${getCreature(this.host.wild.speciesId).name}!`);
      const enterMsg = applyEnterAbility(this.host.wild, this.host.playerMon);
      if (enterMsg) this.host.ui.queueMessage(enterMsg);
      this.host.phase = 'message';
      this.host.showNextMessage();
      this.host.time.delayedCall(600, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
      return;
    }
    this.onVictory();
  }

  doCatch(itemId: string): void {
    const { caught, shakes, message } = tryCatchWithItem(this.host.wild, itemId);
    this.host.ui.queueMessage(message);
    this.host.phase = 'message';
    this.host.showNextMessage();
    this.host.battleAnims.playCapture(shakes, caught, () => {
      registerCaught(GameState.player.dexCaught, this.host.wild.speciesId, GameState.player.dexSeen);
      this.host.promptNickname(this.host.wild);
    }, () => {
      this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
    });
  }

  doRun(): void {
    if (this.host.isTrainer) {
      this.host.ui.queueMessage("You can't run from a trainer battle!");
      this.host.phase = 'message';
      this.host.showNextMessage();
      this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
      return;
    }
    const blocked = isRunBlocked(this.host.wild.ability);
    const fled = tryRun(effectiveSpeed(this.host.playerMon), effectiveSpeed(this.host.wild), blocked);
    this.host.ui.queueMessage(fled ? 'Got away safely!' : blocked ? "Can't escape!" : "Can't escape!");
    this.host.phase = 'message';
    this.host.showNextMessage();
    if (fled) this.host.time.delayedCall(600, () => this.host.endBattle(false));
    else this.host.time.delayedCall(600, () => this.enemyTurn());
  }

  onVictory(): void {
    const exp = expGain(this.host.wild, !this.host.isTrainer);
    const levels = addExp(this.host.playerMon, exp);
    this.host.ui.queueMessage(`${displayName(this.host.playerMon)} gained ${exp} EXP!`);
    Sfx.levelUp();
    for (const lv of levels) {
      if (lv.leveledUp) {
        this.host.ui.queueMessage(`${displayName(this.host.playerMon)} grew to level ${lv.newLevel}!`);
        const { movesToLearn } = processLevelUp(this.host.playerMon, lv.oldLevel);
        this.host.pendingLearnMoves.push(...movesToLearn);
        const evo = checkEvolution(this.host.playerMon);
        if (evo) this.host.pendingEvolution = evo;
      }
    }
    if (this.host.isTrainer) {
      GameState.player.money += this.host.reward;
      if (this.host.isRematch) {
        if (!GameState.player.defeatedRematch.includes(this.host.trainerId)) {
          GameState.player.defeatedRematch.push(this.host.trainerId);
        }
      } else if (!GameState.player.defeatedTrainers.includes(this.host.trainerId)) {
        GameState.player.defeatedTrainers.push(this.host.trainerId);
      }
      if (this.host.trainerId === 'rival' || this.host.trainerId.startsWith('rival')) {
        GameState.player.storyFlags.running = true;
      }
      if (this.host.trainerId === 'ranger') GameState.player.storyFlags.defeated_ranger = true;
      this.host.ui.queueMessage(`${this.host.trainerName} gave you $${this.host.reward}!`);
      if (this.host.badgeId && !GameState.player.badges.includes(this.host.badgeId)) {
        GameState.player.badges.push(this.host.badgeId);
        const badge = getBadge(this.host.badgeId);
        this.host.ui.queueMessage(`${this.host.trainerName} awarded you the ${badge.name}!`);
        if (this.host.badgeId === 'verdant') GameState.player.storyFlags.verdant_badge = true;
        if (this.host.badgeId === 'ember') GameState.player.storyFlags.ember_badge = true;
        if (this.host.badgeId === 'frost') GameState.player.storyFlags.frost_badge = true;
        if (this.host.badgeId === 'psyche') GameState.player.storyFlags.psyche_badge = true;
      }
    }
    trySave(this.host.scene.scene);
    this.host.ui.refreshPlayerUi();
    this.host.phase = 'message';
    this.host.showNextMessage();
    this.host.time.delayedCall(800, () => this.host.processPostVictory());
  }

  doEvolution(): void {
    if (!this.host.pendingEvolution) { this.host.endBattle(false); return; }
    const to = this.host.pendingEvolution;
    if (this.host.evolveStep === 0) {
      this.host.evolveStep = 1;
      this.host.battleAnims.evolutionFlash(0);
      this.host.ui.playerSprite.setAlpha(0.2);
      this.host.ui.queueMessage('...');
      this.host.showNextMessage();
      return;
    }
    if (this.host.evolveStep === 1) {
      this.host.evolveStep = 2;
      evolveCritter(this.host.playerMon, to);
      this.host.ui.playerSprite.setTexture(creatureTextureKey(this.host.scene.scene, to));
      this.host.ui.playerSprite.setAlpha(1);
      this.host.battleAnims.evolutionFlash(1);
      registerCaught(GameState.player.dexCaught, to, GameState.player.dexSeen);
      const b = getCreature(to).baseStats;
      this.host.ui.queueMessage(`It evolved into ${getCreature(to).name}!`);
      this.host.ui.queueMessage(`Base stats — HP:${b.hp} ATK:${b.atk} DEF:${b.def} SPA:${b.spa} SPD:${b.spd} SPE:${b.spe}`);
      this.host.pendingEvolution = null;
      trySave(this.host.scene.scene);
      this.host.showNextMessage();
      this.host.time.delayedCall(1200, () => this.host.processPostVictory());
    }
  }
}
