import Phaser from 'phaser';
import { getCreature } from '../data/creatures';
import { getMove } from '../data/moves';
import { getAbility } from '../data/abilities';
import { applyEnterAbility, expGain, moneyLossOnBlackout } from '../systems/battle';
import { evolutionMessage } from '../systems/evolution';
import { getBattleUsableItems } from '../systems/items';
import {
  GameState, type CritterInstance, displayName, firstAlive,
  isFainted, healParty, registerSeen, registerCaught, addExp,
} from '../systems/stats';
import { addToParty } from '../systems/save';
import { trySave } from '../utils/saveFeedback';
import { preloadCreatureTextures } from '../utils/assetLoader';
import { startWithFadeIn } from '../ui/transitions';
import { buildBattleArena } from '../ui/sceneBackdrops';
import { Sfx } from '../utils/audio';
import { startMusic, stopMusic } from '../utils/music';
import { Input } from '../systems/input';
import { BattleAnims } from './battle/BattleAnims';
import { BattleUi, MENU_ITEMS, type BattlePhase, type BattleUiHost } from './battle/BattleUi';
import { BattleFlow, type BattleFlowHost } from './battle/BattleFlow';
import {
  isEliteGauntletActive, clearEliteGauntlet, nextGauntletTrainerId,
  findGauntletNpc, buildTrainerBattleData,
} from '../systems/eliteGauntlet';

export class BattleScene extends Phaser.Scene implements BattleUiHost, BattleFlowHost {
  enemyParty: CritterInstance[] = [];
  enemyIndex = 0;
  wild!: CritterInstance;
  playerMon!: CritterInstance;
  isTrainer = false;
  trainerId = '';
  trainerName = '';
  reward = 0;
  badgeId = '';
  isRematch = false;
  private mapId = 'route1';

  phase: BattlePhase = 'intro';
  pendingLearnMoves: string[] = [];
  pendingEvolution: string | null = null;
  evolveStep = 0;
  menuIndex = 0;
  moveIndex = 0;
  bagIndex = 0;

  ui!: BattleUi;
  battleAnims!: BattleAnims;
  private flow!: BattleFlow;

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
    void this.initBattle(data);
  }

  private async initBattle(data: {
    enemyParty: CritterInstance[];
    isTrainer?: boolean;
    trainerId?: string;
    trainerName?: string;
    reward?: number;
    badge?: string;
    isRematch?: boolean;
    mapId?: string;
  }): Promise<void> {
    const species = new Set<string>();
    data.enemyParty.forEach(c => species.add(c.speciesId));
    GameState.player.party.forEach(c => species.add(c.speciesId));
    await preloadCreatureTextures(this, [...species]);

    Sfx.battleStart();
    stopMusic();
    startMusic('battle');
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

    this.battleAnims = new BattleAnims(this);
    this.ui = new BattleUi(this, this, this.battleAnims);
    this.flow = new BattleFlow(this);

    buildBattleArena(this, this.mapId);
    this.ui.build();
    Input.bind(this);
    this.ui.syncEnemyUi(false);
    registerSeen(GameState.player.dexSeen, this.wild.speciesId);

    if (this.isTrainer) {
      this.ui.queueMessage(`${this.trainerName} wants to battle!`);
      this.ui.queueMessage(`${this.trainerName} sent out ${getCreature(this.wild.speciesId).name}!`);
      const enterMsg = applyEnterAbility(this.wild, this.playerMon);
      if (enterMsg) this.ui.queueMessage(enterMsg);
    } else {
      this.ui.queueMessage(`A wild ${getCreature(this.wild.speciesId).name} appeared!`);
    }
    this.ui.queueMessage(`Go, ${displayName(this.playerMon)}!`);
    const playerEnter = applyEnterAbility(this.playerMon, this.wild);
    if (playerEnter) this.ui.queueMessage(playerEnter);

    this.ui.abilityText.setText(getAbility(this.playerMon.ability).name);
    this.phase = 'intro';
    this.ui.playerSprite.setX(-80);
    this.ui.enemySprite.setAlpha(0);
    this.time.delayedCall(200, () => {
      this.battleAnims.animateSendOut(this.ui.playerSprite, 160, true);
      this.battleAnims.fadeIn(this.ui.enemySprite);
      this.phase = 'message';
      this.showNextMessage();
    });
  }

  update(): void {
    Input.update();
    this.ui.setContinueVisible(this.phase);
    if (Input.justPressed('up')) this.ui.onNav(this.phase, -1, 0);
    if (Input.justPressed('down')) this.ui.onNav(this.phase, 1, 0);
    if (Input.justPressed('left')) this.ui.onNav(this.phase, 0, -1);
    if (Input.justPressed('right')) this.ui.onNav(this.phase, 0, 1);
    if (Input.justPressed('confirm')) this.onConfirm();
    if (Input.justPressed('cancel') && (this.phase === 'moves' || this.phase === 'bag')) {
      this.phase = 'menu';
      this.ui.returnToMenu();
    }
  }

  onConfirm(): void {
    if (this.phase === 'message' || this.phase === 'intro') this.showNextMessage();
    else if (this.phase === 'evolve') this.flow.doEvolution();
    else if (this.phase === 'menu') this.menuChoice(MENU_ITEMS[this.menuIndex]);
    else if (this.phase === 'moves') this.useMove(this.moveIndex);
    else if (this.phase === 'bag') {
      const items = getBattleUsableItems(GameState.player.items, !this.isTrainer);
      if (items[this.bagIndex]) this.useBagItem(items[this.bagIndex]);
    }
  }

  menuChoice(choice: string): void {
    if (this.phase !== 'menu') return;
    Sfx.menuConfirm();
    switch (choice) {
      case 'Fight':
        this.phase = 'moves';
        this.ui.openMoveMenu();
        break;
      case 'Bag':
        this.phase = 'bag';
        this.ui.openBagMenu();
        break;
      case 'Switch':
        this.scene.launch('Party', { battleSwitch: true, voluntarySwitch: true });
        this.scene.pause();
        break;
      case 'Run':
        this.ui.menuContainer.setVisible(false);
        this.flow.doRun();
        break;
    }
  }

  useBagItem(itemId: string): void { this.flow.useBagItem(itemId); }
  useMove(index: number): void { this.flow.useMove(index); }

  promptNickname(caught: CritterInstance): void {
    this.scene.launch('Nickname', {
      speciesName: getCreature(caught.speciesId).name,
      onDone: (nickname: string | undefined) => {
        if (nickname) caught.nickname = nickname;
        addToParty(caught);
        trySave(this);
        this.endBattle(true);
      },
    });
    this.scene.pause();
  }

  processPostVictory(): void {
    if (this.pendingLearnMoves.length > 0) {
      this.promptLearnMove(this.pendingLearnMoves.shift()!);
      return;
    }
    if (this.pendingEvolution) {
      this.phase = 'evolve';
      this.evolveStep = 0;
      this.ui.queueMessage(evolutionMessage(this.playerMon.speciesId, this.pendingEvolution));
      this.showNextMessage();
      return;
    }
    this.endBattle(false);
  }

  promptLearnMove(moveId: string): void {
    this.phase = 'learn';
    this.scene.launch('LearnMove', {
      critter: this.playerMon,
      moveId,
      onDone: (result: { learned: boolean; replaced?: string }) => {
        if (result.learned) {
          this.ui.queueMessage(`${displayName(this.playerMon)} learned ${getMove(moveId).name}!`);
        }
        this.scene.resume();
        this.phase = 'message';
        this.showNextMessage();
        this.time.delayedCall(600, () => this.processPostVictory());
      },
    });
    this.scene.pause();
  }

  onPlayerFainted(): void {
    const next = GameState.player.party.find(c => !isFainted(c) && c.uid !== this.playerMon.uid);
    if (next) {
      this.scene.launch('Party', { battleSwitch: true, forcedSwitch: true });
      this.scene.pause();
    } else {
      this.blackout();
    }
  }

  private blackout(): void {
    if (isEliteGauntletActive()) clearEliteGauntlet();
    GameState.player.money -= moneyLossOnBlackout(GameState.player.money);
    healParty(GameState.player.party);
    GameState.player.mapId = 'heal_center';
    GameState.player.x = 4;
    GameState.player.y = 7;
    trySave(this);
    this.battleAnims.fadeOut(400, () => startWithFadeIn(this, 'Overworld', { blackout: true }));
  }

  /** DEV test bridge — resolve battle without playing through message queues. */
  resolveBattle(outcome: 'win' | 'lose' | 'catch'): void {
    this.pendingLearnMoves = [];
    this.pendingEvolution = null;
    if (outcome === 'lose') {
      this.blackout();
      return;
    }
    if (outcome === 'catch') {
      if (this.isTrainer) return;
      registerCaught(GameState.player.dexCaught, this.wild.speciesId, GameState.player.dexSeen);
      if (GameState.player.party.length < 6) addToParty(this.wild);
      else GameState.player.storage.push(this.wild);
      trySave(this);
      this.endBattle(true);
      return;
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
      if (this.badgeId && !GameState.player.badges.includes(this.badgeId)) {
        GameState.player.badges.push(this.badgeId);
        if (this.badgeId === 'verdant') GameState.player.storyFlags.verdant_badge = true;
        if (this.badgeId === 'ember') GameState.player.storyFlags.ember_badge = true;
        if (this.badgeId === 'frost') GameState.player.storyFlags.frost_badge = true;
        if (this.badgeId === 'psyche') GameState.player.storyFlags.psyche_badge = true;
      }
    } else {
      addExp(this.playerMon, expGain(this.wild, true));
    }
    trySave(this);
    this.endBattle(false);
  }

  endBattle(_caught: boolean): void {
    const gauntletNext = isEliteGauntletActive() && this.isTrainer
      ? nextGauntletTrainerId(this.trainerId)
      : null;
    if (this.trainerId === 'champion' && isEliteGauntletActive()) clearEliteGauntlet();
    const triggerVictory = this.trainerId === 'rival3'
      && GameState.player.badges.length >= 2
      && !GameState.player.storyFlags.league_ready;
    const triggerHallOfFame = this.trainerId === 'champion'
      && GameState.player.badges.length >= 4
      && !GameState.player.storyFlags.champion;
    this.battleAnims.fadeOut(300, () => {
      if (gauntletNext) {
        const npc = findGauntletNpc(gauntletNext);
        const battleData = npc ? buildTrainerBattleData(npc) : null;
        if (battleData) {
          this.scene.start('TrainerIntro', {
            trainerName: npc!.name,
            isTrainer: true,
            battleData,
          });
          return;
        }
        clearEliteGauntlet();
      }
      if (triggerHallOfFame) startWithFadeIn(this, 'HallOfFame');
      else if (triggerVictory) startWithFadeIn(this, 'Victory');
      else startWithFadeIn(this, 'Overworld', { fromBattle: true });
    });
  }

  showNextMessage(): void {
    this.ui.showNextMessage(() => {
      if (this.phase === 'message' || this.phase === 'intro') {
        this.phase = 'menu';
        this.ui.showMenu();
      }
    });
  }

  switchTo(index: number, voluntary = true): void {
    const c = GameState.player.party[index];
    if (!c || isFainted(c) || c.uid === this.playerMon.uid) return;
    this.playerMon = c;
    this.ui.refreshPlayerSprite(c.speciesId);
    this.ui.playerSprite.setAlpha(1);
    this.ui.refreshPlayerUi();
    this.ui.abilityText.setText(getAbility(c.ability).name);
    this.battleAnims.animateSendOut(this.ui.playerSprite, 160, true);
    const enterMsg = applyEnterAbility(c, this.wild);
    this.ui.queueMessage(`${displayName(c)} was sent out!`);
    if (enterMsg) this.ui.queueMessage(enterMsg);
    this.phase = 'message';
    this.ui.moveContainer.setVisible(false);
    this.showNextMessage();
    this.scene.resume();
    const after = voluntary
      ? () => this.flow.enemyTurn()
      : () => { this.phase = 'menu'; this.ui.showMenu(); };
    this.time.delayedCall(600, after);
  }
}
