import Phaser from 'phaser';
import { getCreature } from '../../data/creatures';
import { getItem, removeItem } from '../../data/items';
import { getMove } from '../../data/moves';
import { getBadge } from '../../data/badges';
import {
  executeMove, tryCatchWithItem, tryRun, pickAiMove, pickAiSwitch, expGain,
  endOfTurnStatus, effectiveSpeed, applyEnterAbility, tryHeldBerry, isRunBlocked,
  resolveTurnOrder, shouldAiHealItem, applyAiHealItem,
} from '../../systems/battle';
import { isEliteGauntletActive } from '../../systems/eliteGauntlet';
import {
  checkEvolution, evolveCritter, processLevelUp,
} from '../../systems/evolution';
import { useItemOnCritter } from '../../systems/items';
import {
  GameState, type CritterInstance, displayName, isFainted, addExp, registerSeen,
} from '../../systems/stats';
import { registerCaughtWithMilestone } from '../../systems/dexNotify';
import type { BattleScene } from '../BattleScene';
import { trySave } from '../../utils/saveFeedback';
import { Sfx } from '../../utils/audio';
import type { BattlePhase } from './BattleUi';
import type { BattleUi } from './BattleUi';
import type { BattleAnims } from './BattleAnims';
import type { BattleResult } from '../../systems/battle';
import { applyHailChip } from '../../systems/weather';

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
    if (result.ok) this.host.battleAnims.animateHeal(this.host.ui.playerSprite);
    this.host.ui.refreshPlayerUi();
    this.host.showNextMessage();
    if (result.ok) this.host.time.delayedCall(600, () => this.enemyTurnOnly());
    else this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
  }

  useMove(index: number): void {
    if (this.host.phase !== 'moves') return;
    this.host.ui.moveContainer.setVisible(false);
    this.host.phase = 'fight';

    if (this.host.isTrainer) {
      if (shouldAiHealItem(this.host.wild, this.host.trainerId)) {
        const msg = applyAiHealItem(this.host.wild, this.host.trainerName);
        this.host.ui.queueMessage(msg);
        this.host.battleAnims.animateHeal(this.host.ui.enemySprite);
        this.host.ui.animateEnemyHp();
        this.host.phase = 'message';
        this.host.showNextMessage();
        this.host.time.delayedCall(600, () => {
          if (this.turnEnded()) return;
          this.runSide(true, index, () => this.finishTurn());
        });
        return;
      }
      const switchIdx = pickAiSwitch(
        this.host.wild, this.host.enemyParty, this.host.enemyIndex, this.host.playerMon,
      );
      if (switchIdx >= 0) {
        this.runEnemySwitch(switchIdx, () => {
          if (this.turnEnded()) return;
          this.runSide(true, index, () => this.finishTurn());
        });
        return;
      }
    }

    const enemyMove = pickAiMove(this.host.wild, this.host.playerMon);
    const playerMoveId = this.host.playerMon.moves[index]?.id;
    const enemyMoveId = this.host.wild.moves[enemyMove]?.id;
    const playerFirst = resolveTurnOrder(
      this.host.playerMon, this.host.wild, undefined, playerMoveId, enemyMoveId,
    ) === 'player';

    if (playerFirst) {
      this.runSide(true, index, () => {
        if (this.turnEnded()) return;
        this.runSide(false, enemyMove, () => this.finishTurn());
      });
    } else {
      this.runSide(false, enemyMove, () => {
        if (this.turnEnded()) return;
        this.runSide(true, index, () => this.finishTurn());
      });
    }
  }

  private turnEnded(): boolean {
    return isFainted(this.host.wild) || isFainted(this.host.playerMon);
  }

  /** Trainer AI withdraws the active mon for a better matchup (costs its turn). */
  private runEnemySwitch(targetIdx: number, onComplete: () => void): void {
    const outgoing = structuredClone(this.host.wild);
    outgoing.vol = { ...outgoing.vol, aiSwitched: true };
    this.host.enemyParty[this.host.enemyIndex] = outgoing;
    this.host.enemyIndex = targetIdx;
    this.host.wild = structuredClone(this.host.enemyParty[targetIdx]);
    registerSeen(GameState.player.dexSeen, this.host.wild.speciesId);
    this.host.ui.enemySprite.setAlpha(0);
    this.host.ui.syncEnemyUi(true);
    this.host.ui.queueMessage(
      `${this.host.trainerName} withdrew ${getCreature(outgoing.speciesId).name} and sent out ${getCreature(this.host.wild.speciesId).name}!`,
    );
    const enterMsg = applyEnterAbility(this.host.wild, this.host.playerMon);
    if (enterMsg) this.host.ui.queueMessage(enterMsg);
    this.host.phase = 'message';
    this.host.showNextMessage();
    this.host.time.delayedCall(600, onComplete);
  }

  private runSide(isPlayer: boolean, moveIndex: number, onComplete: () => void): void {
    const attacker = isPlayer ? this.host.playerMon : this.host.wild;
    const defender = isPlayer ? this.host.wild : this.host.playerMon;
    const attackerSprite = isPlayer ? this.host.ui.playerSprite : this.host.ui.enemySprite;
    const defenderSprite = isPlayer ? this.host.ui.enemySprite : this.host.ui.playerSprite;
    const towardEnemy = isPlayer;

    const result = executeMove(attacker, defender, moveIndex);
    this.host.ui.queueMessage(result.message);
    this.host.phase = 'message';

    const afterMessages = () => {
      this.host.showNextMessage();
      this.host.time.delayedCall(400, onComplete);
    };

    if (result.cantMove) {
      if (isPlayer) this.host.ui.refreshPlayerUi();
      if (result.attackerFainted || isFainted(this.host.playerMon)) {
        this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
        return;
      }
      afterMessages();
      return;
    }

    if (result.missed) {
      this.host.battleAnims.animateMiss(attackerSprite, afterMessages);
      return;
    }

    if (result.healed) {
      this.host.battleAnims.animateHeal(attackerSprite);
      if (isPlayer) this.host.ui.refreshPlayerUi();
      else this.host.ui.animateEnemyHp();
      afterMessages();
      return;
    }

    if (result.statChange) {
      const targetSprite = result.statChange.target === 'attacker' ? attackerSprite : defenderSprite;
      this.host.battleAnims.animateStatBoost(targetSprite, result.statChange.stages > 0);
      if (!isPlayer && result.statChange.target === 'defender') this.host.ui.animateEnemyHp();
      if (isPlayer) this.host.ui.refreshPlayerUi();
      afterMessages();
      return;
    }

    if (result.damage && result.damage > 0) {
      const moveType = getMove((isPlayer ? this.host.playerMon : this.host.wild).moves[moveIndex].id).type;
      this.host.battleAnims.animateAttackLunge(attackerSprite, towardEnemy, () => {
        if (towardEnemy) {
          this.host.battleAnims.playHitOnEnemy(defenderSprite, moveType, result.effectiveness);
          this.host.ui.animateEnemyHp();
          this.host.battleAnims.applyEffectivenessTint(defenderSprite, result.effectiveness);
        } else {
          this.host.battleAnims.playHitOnPlayer(defenderSprite, moveType);
          this.host.ui.refreshPlayerUi();
        }
        this.handleFaintOrContinue(result, isPlayer, defenderSprite, afterMessages);
      });
      return;
    }

    this.handleFaintOrContinue(result, isPlayer, defenderSprite, afterMessages);
  }

  private handleFaintOrContinue(
    result: BattleResult,
    playerWasAttacker: boolean,
    defenderSprite: Phaser.GameObjects.Image,
    onContinue: () => void,
  ): void {
    if (result.fainted) {
      this.host.showNextMessage();
      this.host.time.delayedCall(400, () => {
        this.host.battleAnims.animateFaint(defenderSprite, () => {
          if (playerWasAttacker) this.onEnemyFainted();
          else this.host.onPlayerFainted();
        });
      });
      return;
    }
    onContinue();
  }

  private finishTurn(): void {
    if (this.turnEnded()) return;

    const playerBerry = tryHeldBerry(this.host.playerMon);
    if (playerBerry) {
      this.host.ui.queueMessage(playerBerry);
      this.host.ui.refreshPlayerUi();
    }
    const enemyBerry = tryHeldBerry(this.host.wild);
    if (enemyBerry) {
      this.host.ui.queueMessage(enemyBerry);
      this.host.ui.animateEnemyHp();
    }

    const playerStatus = endOfTurnStatus(this.host.playerMon);
    if (playerStatus) {
      this.host.ui.queueMessage(playerStatus);
      this.host.ui.refreshPlayerUi();
      if (isFainted(this.host.playerMon)) {
        this.host.phase = 'message';
        this.host.showNextMessage();
        this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
        return;
      }
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

    const playerHail = applyHailChip(this.host.playerMon);
    if (playerHail) {
      this.host.ui.queueMessage(playerHail);
      this.host.ui.refreshPlayerUi();
      if (isFainted(this.host.playerMon)) {
        this.host.phase = 'message';
        this.host.showNextMessage();
        this.host.time.delayedCall(800, () => this.host.onPlayerFainted());
        return;
      }
    }
    const enemyHail = applyHailChip(this.host.wild);
    if (enemyHail) {
      this.host.ui.queueMessage(enemyHail);
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

    if (playerBerry || enemyBerry || playerStatus || enemyStatus || playerHail || enemyHail) {
      this.host.phase = 'message';
      this.host.showNextMessage();
      this.host.time.delayedCall(400, () => { this.host.phase = 'menu'; this.host.ui.showMenu(); });
      return;
    }

    this.host.phase = 'menu';
    this.host.ui.showMenu();
  }

  /** Enemy acts alone (after bag item, failed run, etc.). */
  enemyTurnOnly(): void {
    if (this.turnEnded()) return;
    const aiMove = pickAiMove(this.host.wild, this.host.playerMon);
    this.host.phase = 'enemy';
    this.runSide(false, aiMove, () => this.finishTurn());
  }

  onEnemyFainted(): void {
    this.host.enemyParty[this.host.enemyIndex] = structuredClone(this.host.wild);
    const nextIdx = this.host.enemyParty.findIndex(
      (m, i) => i !== this.host.enemyIndex && m.currentHp > 0,
    );
    if (nextIdx >= 0) {
      this.host.enemyIndex = nextIdx;
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
      registerCaughtWithMilestone(GameState.player, this.host.wild.speciesId, this.host as BattleScene);
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
    else this.host.time.delayedCall(600, () => this.enemyTurnOnly());
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
      this.host.ui.refreshPlayerSprite(to);
      this.host.ui.playerSprite.setAlpha(1);
      this.host.battleAnims.evolutionFlash(1);
      registerCaughtWithMilestone(GameState.player, to, this.host as BattleScene);
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
