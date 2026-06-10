import type Phaser from 'phaser';
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
  { key: 'Options', load: () => import('./OptionsScene').then(m => ({ OptionsScene: m.OptionsScene })) },
  { key: 'HallOfFame', load: () => import('./HallOfFameScene').then(m => ({ HallOfFameScene: m.HallOfFameScene })) },
  { key: 'LearnMove', load: () => import('./LearnMoveScene').then(m => ({ LearnMoveScene: m.LearnMoveScene })) },
  { key: 'Nickname', load: () => import('./LearnMoveScene').then(m => ({ NicknameScene: m.NicknameScene })) },
];

/** Lazy-register heavy scenes after boot for Vite code-splitting. */
export async function registerLazyScenes(game: Phaser.Game): Promise<void> {
  await Promise.all(LAZY_SCENES.map(async ({ key, load }) => {
    if (game.scene.getScene(key)) return;
    const mod = await load();
    const SceneClass = Object.values(mod).find(v => typeof v === 'function') as SceneCtor;
    game.scene.add(key, SceneClass, false);
  }));
}
