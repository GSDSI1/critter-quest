import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './data/types';
import { getMap } from './data/maps';
import { resolveTrainerParty } from './data/maps/helpers';
import { getItem, addItem, removeItem } from './data/items';
import { DEX_ORDER } from './data/creatures';
import { pendingDexMilestone, claimDexMilestone } from './systems/dexMilestones';
import { saveGame, depositToStorage, withdrawFromStorage } from './systems/save';
import { GameState, createCritter, registerSeen, registerCaught } from './systems/stats';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { MenuScene } from './scenes/MenuScene';
import { installLazySceneLoader } from './scenes/registerScenes';
import { installCanvasFocusOnBoot } from './utils/focusCanvas';
import type { BattleScene } from './scenes/BattleScene';
import { battleMenuItems } from './scenes/battle/BattleUi';
import { getBattleWeather } from './systems/weather';
import type { OverworldScene } from './scenes/OverworldScene';
import { applyChestReward } from './scenes/overworld/ChestRewards';
import { hasCreatureGraphic } from './utils/assetLoader';
import type { FishingScene } from './scenes/FishingScene';
import type { BugCatchScene } from './scenes/BugCatchScene';
import type { CritterContestScene } from './scenes/CritterContestScene';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0f0f1a',
  pixelArt: true,
  input: {
    gamepad: true,
    keyboard: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 1,
  },
  scene: [BootScene, IntroScene, MenuScene],
  render: { antialias: false, roundPixels: true },
  pauseOnBlur: false,
} as Phaser.Types.Core.GameConfig;

const game = new Phaser.Game(config);
installLazySceneLoader(game);
installCanvasFocusOnBoot();

declare global {
  interface Window {
    __cq?: {
      sceneKeys: () => string[];
      player: () => {
        mapId: string;
        x: number;
        y: number;
        started: boolean;
        name: string;
        badges: string[];
        money: number;
        items: Record<string, number>;
        partyCount: number;
        storageCount: number;
        dexCaught: string[];
        storyFlags: Record<string, boolean>;
      };
      teleport: (mapId: string, x: number, y: number, facing?: 'up' | 'down' | 'left' | 'right') => void;
      startNewGame: () => void;
      skipToMenu: () => void;
      menuContinue: () => void;
      confirmCharacter: () => void;
      startStarterSelect: () => void;
      pickStarter: (id?: string) => void;
      completeTutorial: () => void;
      startWildBattle: (speciesId?: string, mapId?: string) => void;
      openQuestLog: () => void;
      startTrainerBattle: (npcId: string, mapId?: string) => void;
      resolveBattle: (outcome: 'win' | 'lose' | 'catch') => void;
      battleState: () => { phase: string; enemyHp: number; enemyMaxHp: number; weather: string | null } | null;
      battleReady: () => boolean;
      battleTapContinue: () => boolean;
      battlePickMove: (index?: number) => boolean;
      battleMenuForTrainer: () => string[];
      hasCreatureGraphic: (speciesId: string) => boolean;
      openShop: () => void;
      buyShopItem: (itemId?: string) => boolean;
      sellShopItem: (itemId?: string) => boolean;
      claimChest: (chestId: string) => boolean;
      openPc: () => void;
      depositPartySlot: (index: number) => boolean;
      withdrawStorageSlot: (index: number) => boolean;
      addPartyMember: (speciesId: string, level?: number) => void;
      giveBadge: (id: string) => void;
      requestWalk: (tx: number, ty: number) => void;
      openFishing: () => void;
      openBugCatch: () => void;
      openContest: () => void;
      setNight: () => void;
      resolveFishing: (hits: number) => void;
      resolveBugCatch: (score: number) => void;
      resolveContest: () => void;
      fillDex: (count: number) => void;
      claimPendingDexMilestone: () => number;
      walkToWarp: (mapId: string, warpX: number, warpY: number) => void;
      teleportAndWalk: (mapId: string, x: number, y: number, destX: number, destY: number) => void;
    };
  }
}

if (import.meta.env.DEV) {
  window.__cq = {
    sceneKeys: () => game.scene.getScenes(true).map(s => s.scene.key),
    player: () => ({
      mapId: GameState.player.mapId,
      x: GameState.player.x,
      y: GameState.player.y,
      started: GameState.player.started,
      name: GameState.player.name,
      badges: [...GameState.player.badges],
      money: GameState.player.money,
      items: { ...GameState.player.items },
      partyCount: GameState.player.party.length,
      storageCount: GameState.player.storage.length,
      dexCaught: [...GameState.player.dexCaught],
      storyFlags: { ...GameState.player.storyFlags },
    }),
    teleport(mapId, x, y, facing = 'up') {
      GameState.player.mapId = mapId;
      GameState.player.x = x;
      GameState.player.y = y;
      GameState.player.facing = facing;
      const ow = game.scene.getScene('Overworld');
      if (ow?.scene.isActive()) ow.scene.restart({});
    },
    startNewGame() {
      GameState.reset();
      game.scene.start('CharacterSelect');
    },
    skipToMenu() {
      game.scene.start('Menu');
    },
    menuContinue() {
      game.scene.start('Overworld');
    },
    confirmCharacter() {
      GameState.player.characterId = GameState.player.characterId || 'scout';
      GameState.player.name = GameState.player.name || 'Trainer';
      game.scene.start('LabIntro');
    },
    startStarterSelect() {
      game.scene.start('StarterSelect');
    },
    pickStarter(id = 'emberpup') {
      const starter = createCritter(id, 5);
      GameState.player.starterId = id;
      GameState.player.party = [starter];
      registerSeen(GameState.player.dexSeen, id);
      registerCaught(GameState.player.dexCaught, id, GameState.player.dexSeen);
      GameState.player.started = true;
      GameState.player.mapId = 'town';
      GameState.player.x = 10;
      GameState.player.y = 13;
      saveGame();
      game.scene.start('Overworld', { showIntro: true });
    },
    completeTutorial() {
      GameState.player.storyFlags.saw_controls = true;
      saveGame();
    },
    startWildBattle(speciesId = 'mossling', mapId = 'route1') {
      if (!GameState.player.party.length) {
        GameState.player.party = [createCritter('emberpup', 10)];
      }
      const wild = createCritter(speciesId, 5);
      game.scene.start('Battle', { enemyParty: [wild], mapId });
    },
    openQuestLog() {
      const ow = game.scene.getScene('Overworld');
      if (ow?.scene.isActive()) {
        ow.scene.pause();
        ow.scene.launch('QuestLog');
      } else {
        game.scene.start('QuestLog');
      }
    },
    startTrainerBattle(npcId, mapId = 'gym1') {
      const map = getMap(mapId);
      const npc = map.npcs?.find(n => n.id === npcId);
      if (!npc?.trainer) return;
      if (!GameState.player.party.length) {
        GameState.player.party = [createCritter('emberpup', 18)];
      }
      const resolved = resolveTrainerParty(npc.trainer.party, GameState.player.starterId);
      const party = resolved.map(m => createCritter(m.creatureId, m.level));
      game.scene.start('Battle', {
        enemyParty: party,
        isTrainer: true,
        trainerId: npc.id,
        trainerName: npc.name,
        reward: npc.trainer.reward,
        badge: npc.trainer.badge ?? '',
        mapId,
      });
    },
    resolveBattle(outcome) {
      const battle = game.scene.getScene('Battle') as BattleScene | undefined;
      battle?.resolveBattle(outcome);
    },
    battleReady() {
      const battle = game.scene.getScene('Battle') as BattleScene | undefined;
      return Boolean(battle?.scene.isActive() && battle.battleReady);
    },
    battleState() {
      const battle = game.scene.getScene('Battle') as BattleScene | undefined;
      if (!battle?.scene.isActive() || !battle.battleReady) return null;
      return {
        phase: battle.phase,
        enemyHp: battle.wild.currentHp,
        enemyMaxHp: battle.wild.maxHp,
        weather: getBattleWeather(),
      };
    },
    battleTapContinue() {
      const battle = game.scene.getScene('Battle') as BattleScene | undefined;
      if (!battle?.battleReady) return false;
      battle.onConfirm();
      return true;
    },
    battlePickMove(index = 0) {
      const battle = game.scene.getScene('Battle') as BattleScene | undefined;
      if (!battle?.battleReady || battle.phase !== 'menu') return false;
      battle.menuChoice('Fight');
      battle.useMove(index);
      return true;
    },
    battleMenuForTrainer() {
      return [...battleMenuItems(true)];
    },
    hasCreatureGraphic(speciesId: string) {
      const menu = game.scene.getScene('Menu');
      return menu ? hasCreatureGraphic(menu, speciesId) : false;
    },
    openShop() {
      const ow = game.scene.getScene('Overworld');
      if (ow?.scene.isActive()) {
        ow.scene.pause();
        ow.scene.launch('Shop', { returnMap: GameState.player.mapId });
      } else {
        game.scene.start('Shop', { returnMap: GameState.player.mapId });
      }
    },
    buyShopItem(itemId = 'potion') {
      const item = getItem(itemId);
      if (GameState.player.money < item.price) return false;
      GameState.player.money -= item.price;
      addItem(GameState.player.items, itemId);
      saveGame();
      return true;
    },
    sellShopItem(itemId = 'potion') {
      if ((GameState.player.items[itemId] ?? 0) <= 0) return false;
      const sellPrice = Math.max(1, Math.floor(getItem(itemId).price / 2));
      removeItem(GameState.player.items, itemId);
      GameState.player.money += sellPrice;
      saveGame();
      return true;
    },
    claimChest(chestId) {
      if (GameState.player.storyFlags[chestId]) return false;
      GameState.player.storyFlags[chestId] = true;
      applyChestReward(chestId);
      saveGame();
      return true;
    },
    openPc() {
      const ow = game.scene.getScene('Overworld');
      if (ow?.scene.isActive()) {
        ow.scene.pause();
        ow.scene.launch('PC');
      } else {
        game.scene.start('PC');
      }
    },
    depositPartySlot(index) {
      const ok = depositToStorage(index);
      if (ok) saveGame();
      return ok;
    },
    withdrawStorageSlot(index) {
      const ok = withdrawFromStorage(index);
      if (ok) saveGame();
      return ok;
    },
    addPartyMember(speciesId, level = 5) {
      const c = createCritter(speciesId, level);
      if (GameState.player.party.length < 6) GameState.player.party.push(c);
      else GameState.player.storage.push(c);
      saveGame();
    },
    giveBadge(id: string) {
      if (!GameState.player.badges.includes(id)) GameState.player.badges.push(id);
      saveGame();
    },
    requestWalk(tx, ty) {
      const ow = game.scene.getScene('Overworld') as OverworldScene | null;
      if (!ow?.scene.isActive()) return;
      ow.time.delayedCall(100, () => ow.requestWalkTo(tx, ty, { force: true }));
    },
    openFishing() {
      const ow = game.scene.getScene('Overworld');
      if (!ow) return;
      ow.scene.launch('Fishing', { returnMap: GameState.player.mapId });
      ow.scene.pause();
    },
    openBugCatch() {
      const ow = game.scene.getScene('Overworld');
      if (!ow) return;
      ow.scene.launch('BugCatch');
      ow.scene.pause();
    },
    openContest() {
      const ow = game.scene.getScene('Overworld');
      if (!ow) return;
      ow.scene.launch('CritterContest');
      ow.scene.pause();
    },
    setNight() {
      GameState.player.playTime = 264;
      saveGame();
    },
    resolveFishing(hits) {
      (game.scene.getScene('Fishing') as FishingScene | null)?.devFinish(hits);
    },
    resolveBugCatch(score) {
      (game.scene.getScene('BugCatch') as BugCatchScene | null)?.devFinish(score);
    },
    resolveContest() {
      (game.scene.getScene('CritterContest') as CritterContestScene | null)?.devWin();
    },
    fillDex(count) {
      const n = Math.max(0, Math.min(DEX_ORDER.length, count));
      GameState.player.dexCaught = DEX_ORDER.slice(0, n);
      GameState.player.dexSeen = [...GameState.player.dexCaught];
      saveGame();
    },
    claimPendingDexMilestone() {
      const m = pendingDexMilestone(GameState.player);
      if (m) claimDexMilestone(GameState.player, m);
      saveGame();
      return m?.count ?? 0;
    },
    walkToWarp(mapId, warpX, warpY) {
      GameState.player.mapId = mapId;
      GameState.player.x = warpX;
      GameState.player.y = warpY + 1;
      GameState.player.facing = 'up';
      game.scene.start('Overworld', { walkTarget: { x: warpX, y: warpY } });
    },
    teleportAndWalk(mapId, x, y, destX, destY) {
      GameState.player.mapId = mapId;
      GameState.player.x = x;
      GameState.player.y = y;
      GameState.player.facing = 'up';
      game.scene.start('Overworld', { walkTarget: { x: destX, y: destY } });
    },
  };
}

export default game;
