import Phaser from 'phaser';
import type { Types } from 'phaser';

type SceneCtor = Types.Scenes.SceneType;

const LAZY_SCENES: { key: string; load: () => Promise<Record<string, SceneCtor>> }[] = [
  { key: 'CharacterSelect', load: () => import('./CharacterSelectScene').then(m => ({ CharacterSelectScene: m.CharacterSelectScene })) },
  { key: 'LabIntro', load: () => import('./LabIntroScene').then(m => ({ LabIntroScene: m.LabIntroScene })) },
  { key: 'StarterSelect', load: () => import('./StarterSelectScene').then(m => ({ StarterSelectScene: m.StarterSelectScene })) },
  { key: 'Overworld', load: () => import('./OverworldScene').then(m => ({ OverworldScene: m.OverworldScene })) },
  { key: 'TrainerIntro', load: () => import('./TrainerIntroScene').then(m => ({ TrainerIntroScene: m.TrainerIntroScene })) },
  { key: 'Victory', load: () => import('./VictoryScene').then(m => ({ VictoryScene: m.VictoryScene })) },
  { key: 'Battle', load: () => import('./BattleScene').then(m => ({ BattleScene: m.BattleScene })) },
  { key: 'Party', load: () => import('./PartyScene').then(m => ({ PartyScene: m.PartyScene })) },
  { key: 'Shop', load: () => import('./ShopScene').then(m => ({ ShopScene: m.ShopScene })) },
  { key: 'PC', load: () => import('./PcScene').then(m => ({ PcScene: m.PcScene })) },
  { key: 'Critterdex', load: () => import('./CritterdexScene').then(m => ({ CritterdexScene: m.CritterdexScene })) },
  { key: 'PauseMenu', load: () => import('./PauseMenuScene').then(m => ({ PauseMenuScene: m.PauseMenuScene })) },
  { key: 'QuestLog', load: () => import('./QuestLogScene').then(m => ({ QuestLogScene: m.QuestLogScene })) },
  { key: 'Options', load: () => import('./OptionsScene').then(m => ({ OptionsScene: m.OptionsScene })) },
  { key: 'FastTravel', load: () => import('./FastTravelScene').then(m => ({ FastTravelScene: m.FastTravelScene })) },
  { key: 'RegionMap', load: () => import('./RegionMapScene').then(m => ({ RegionMapScene: m.RegionMapScene })) },
  { key: 'HallOfFame', load: () => import('./HallOfFameScene').then(m => ({ HallOfFameScene: m.HallOfFameScene })) },
  { key: 'LearnMove', load: () => import('./LearnMoveScene').then(m => ({ LearnMoveScene: m.LearnMoveScene })) },
  { key: 'Nickname', load: () => import('./LearnMoveScene').then(m => ({ NicknameScene: m.NicknameScene })) },
  { key: 'Fishing', load: () => import('./FishingScene').then(m => ({ FishingScene: m.FishingScene })) },
  { key: 'BugCatch', load: () => import('./BugCatchScene').then(m => ({ BugCatchScene: m.BugCatchScene })) },
  { key: 'CritterContest', load: () => import('./CritterContestScene').then(m => ({ CritterContestScene: m.CritterContestScene })) },
];

const loading = new Map<string, Promise<void>>();
let installed = false;

/** Register a single scene chunk on first use. */
export async function ensureSceneRegistered(game: Phaser.Game, key: string): Promise<void> {
  if (game.scene.getScene(key)) return;
  const entry = LAZY_SCENES.find(s => s.key === key);
  if (!entry) return;
  const pending = loading.get(key);
  if (pending) return pending;

  const p = (async () => {
    const mod = await entry.load();
    const SceneClass = Object.values(mod).find(v => typeof v === 'function') as SceneCtor;
    if (!game.scene.getScene(key)) game.scene.add(key, SceneClass, false);
  })();
  loading.set(key, p);
  await p;
}

/** Fire-and-forget prefetch for likely-next scenes. */
export function prefetchScenes(game: Phaser.Game, keys: string[]): void {
  for (const key of keys) void ensureSceneRegistered(game, key);
}

/** Patch scene.start/launch so chunks load on demand instead of at boot. */
export function installLazySceneLoader(game: Phaser.Game): void {
  if (installed) return;
  installed = true;

  const sm = game.scene;
  const origStart = sm.start.bind(sm);
  sm.start = (key: string, data?: object) => {
    void ensureSceneRegistered(game, key).then(() => origStart(key, data));
    return sm;
  };

  // launch lives on ScenePlugin (this.scene), not SceneManager
  const proto = Phaser.Scenes.ScenePlugin.prototype as Phaser.Scenes.ScenePlugin & {
    launch(key: string, data?: object): Phaser.Scenes.ScenePlugin;
  };
  const origLaunch = proto.launch;
  proto.launch = function (this: Phaser.Scenes.ScenePlugin, key: string, data?: object) {
    void ensureSceneRegistered(this.scene.game, key).then(() => origLaunch.call(this, key, data));
    return this;
  };
}

/** @deprecated Use installLazySceneLoader — kept for verify script compatibility. */
export async function registerLazyScenes(game: Phaser.Game): Promise<void> {
  installLazySceneLoader(game);
}
