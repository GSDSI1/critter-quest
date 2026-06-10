import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from './data/types';
import { saveGame } from './systems/save';
import { GameState, createCritter, registerSeen, registerCaught } from './systems/stats';
import { BootScene } from './scenes/BootScene';
import { IntroScene } from './scenes/IntroScene';
import { MenuScene } from './scenes/MenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { LabIntroScene } from './scenes/LabIntroScene';
import { StarterSelectScene } from './scenes/StarterSelectScene';
import { OverworldScene } from './scenes/OverworldScene';
import { BattleScene } from './scenes/BattleScene';
import { PartyScene } from './scenes/PartyScene';
import { ShopScene } from './scenes/ShopScene';
import { PcScene } from './scenes/PcScene';
import { CritterdexScene } from './scenes/CritterdexScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';
import { TrainerIntroScene } from './scenes/TrainerIntroScene';
import { VictoryScene } from './scenes/VictoryScene';
import { LearnMoveScene, NicknameScene } from './scenes/LearnMoveScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0f0f1a',
  pixelArt: true,
  input: {
    gamepad: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: SCALE / 2,
  },
  scene: [
    BootScene, IntroScene, MenuScene, CharacterSelectScene, LabIntroScene, StarterSelectScene, OverworldScene,
    TrainerIntroScene, VictoryScene, BattleScene, PartyScene, ShopScene, PcScene, CritterdexScene,
    PauseMenuScene, LearnMoveScene, NicknameScene,
  ],
  render: { antialias: false, roundPixels: true },
};

const game = new Phaser.Game(config);

declare global {
  interface Window {
    __cq?: {
      sceneKeys: () => string[];
      player: () => { mapId: string; x: number; y: number; started: boolean; name: string };
      teleport: (mapId: string, x: number, y: number, facing?: 'up' | 'down' | 'left' | 'right') => void;
      startNewGame: () => void;
      menuContinue: () => void;
      confirmCharacter: () => void;
      startStarterSelect: () => void;
      pickStarter: (id?: string) => void;
      completeTutorial: () => void;
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
  };
}

export default game;
