#!/usr/bin/env node
/** Static verification for Critter Quest build-out. Run: node scripts/verify-build.mjs */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); failed++; }

function read(rel) { return readFileSync(join(root, rel), 'utf8'); }

console.log('Critter Quest — verification\n');

// ── Assets ──
const metaPath = join(root, 'public/assets/meta.json');
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (meta.placeholder === true) ok('meta.json placeholder mode (procedural art active)');
  else ok('meta.json custom art mode');
} else fail('public/assets/meta.json missing');

const critterPngs = readdirSync(join(root, 'public/assets/critters')).filter(f => f.endsWith('.png') && !f.includes('_sm'));
ok(`${critterPngs.length} critter PNGs on disk`);

// ── Data catalog ──
const creatures = read('src/data/creatures.ts');
const speciesIds = [...creatures.matchAll(/^\s{2}[a-z]+: \{/gm)];
if (speciesIds.length === 27) ok('27 species in creatures.ts');
else fail(`Expected 27 species, found ${speciesIds.length}`);

const mapsSrc = read('src/data/maps.ts');
const ALL_MAPS = [
  'town', 'heal_center', 'mart', 'lab', 'route1', 'forest', 'route2', 'mossgrove',
  'gym1', 'crystal_cave', 'route3', 'ember_city', 'gym2', 'volcanic_path',
];
for (const mapId of ALL_MAPS) {
  if (mapsSrc.includes(`${mapId}:`)) ok(`Map "${mapId}"`);
  else fail(`Map "${mapId}" missing`);
}

for (const theme of ['mapTheme: \'heal\'', 'mapTheme: \'mart\'', 'mapTheme: \'lab\'']) {
  if (mapsSrc.includes(theme)) ok(`Interior theme ${theme.split("'")[1]}`);
  else fail(`Missing ${theme}`);
}

for (const rival of ['rival', 'rival_forest', 'rival2', 'rival3']) {
  if (mapsSrc.includes(`id: '${rival}'`)) ok(`Rival battle "${rival}"`);
  else fail(`Rival "${rival}" missing`);
}

for (const leader of ['gym_leader', 'gym_leader_cole']) {
  if (mapsSrc.includes(`id: '${leader}'`)) ok(`Gym leader "${leader}"`);
  else fail(`Gym leader "${leader}" missing`);
}

// ── Scenes registered ──
const main = read('src/main.ts');
const REQUIRED_SCENES = [
  'BootScene', 'IntroScene', 'MenuScene', 'CharacterSelectScene', 'LabIntroScene',
  'StarterSelectScene', 'OverworldScene', 'TrainerIntroScene', 'BattleScene',
  'PartyScene', 'ShopScene', 'PcScene', 'CritterdexScene', 'PauseMenuScene',
  'LearnMoveScene', 'NicknameScene', 'VictoryScene',
];
for (const scene of REQUIRED_SCENES) {
  if (main.includes(scene)) ok(`${scene} registered`);
  else fail(`${scene} not in main.ts`);
}
if (main.includes('gamepad: true')) ok('Gamepad enabled in Phaser config');
else fail('Gamepad not enabled');

// ── New-game flow chain ──
const boot = read('src/scenes/BootScene.ts');
if (boot.includes("'Intro'")) ok('Boot → Intro');
else fail('Boot does not start Intro');

const intro = read('src/scenes/IntroScene.ts');
if (intro.includes("'Menu'") && intro.includes('buildTitleBackdrop')) ok('Intro → Menu (title backdrop)');
else fail('Intro flow incomplete');

const menu = read('src/scenes/MenuScene.ts');
if (menu.includes("'CharacterSelect'")) ok('Menu New Game → CharacterSelect');
else fail('Menu missing CharacterSelect route');
if (menu.includes('formatPlayTime')) ok('Menu Continue shows save summary');

const charSel = read('src/scenes/CharacterSelectScene.ts');
if (charSel.includes("'LabIntro'") && charSel.includes('cancel')) ok('CharacterSelect → LabIntro (+ back)');
else fail('CharacterSelect flow incomplete');

const lab = read('src/scenes/LabIntroScene.ts');
if (lab.includes("'StarterSelect'")) ok('LabIntro → StarterSelect');
else fail('LabIntro missing StarterSelect route');

const starter = read('src/scenes/StarterSelectScene.ts');
if (starter.includes("'Overworld'") && starter.includes('lab_bench')) ok('StarterSelect → Overworld (lab table)');
else fail('StarterSelect flow incomplete');

// ── Systems ──
const stats = read('src/systems/stats.ts');
for (const field of ['characterId', 'ivs', 'nature', 'ability', 'storyFlags']) {
  if (stats.includes(field)) ok(`Player/critter field: ${field}`);
  else fail(`stats.ts missing ${field}`);
}

const saveSrc = read('src/systems/save.ts');
if (saveSrc.includes('characterId') && saveSrc.includes('critter-quest-save-v3')) ok('Save v3 + characterId migration');
else fail('Save system incomplete');

const battle = read('src/systems/battle.ts');
if (battle.includes('typeMultiplier') || battle.includes('TYPE_CHART')) ok('Battle type effectiveness');
else fail('Battle type chart missing');

const evo = read('src/systems/evolution.ts');
if (evo.includes('checkEvolution') && evo.includes('evolveCritter')) ok('Evolution system');
else fail('Evolution system missing');

const evolutions = read('src/data/evolutions.ts');
if ((evolutions.match(/from:/g) ?? []).length >= 10) ok('Evolution chains defined');
else fail('Too few evolutions');

// ── UI / graphics ──
const assetLoader = read('src/utils/assetLoader.ts');
if (assetLoader.includes('isPlaceholderAssets')) ok('Placeholder asset guard');
if (assetLoader.includes('isExternalTilesetAvailable')) ok('External tileset hook');

if (existsSync(join(root, 'src/ui/screenUi.ts'))) ok('screenUi.ts');
else fail('screenUi.ts missing');
if (existsSync(join(root, 'src/ui/titleScreen.ts'))) ok('titleScreen.ts');
else fail('titleScreen.ts missing');
if (existsSync(join(root, 'src/utils/camera.ts'))) ok('Interior camera helper');
else fail('camera.ts missing');

for (const uiFile of ['DialogBox.ts', 'ControlsPanel.ts', 'HUD.ts']) {
  const ui = read(`src/ui/${uiFile}`);
  if (ui.includes('screenUi') || ui.includes('pinToScreen') || ui.includes('pinContainerChildren')) {
    ok(`${uiFile} pins UI to screen`);
  } else fail(`${uiFile} missing screen pin`);
}
if (read('src/ui/DialogBox.ts').includes('pointerdown')) ok('DialogBox click/tap advance');
else fail('DialogBox missing pointer advance');
if (read('src/ui/ControlsPanel.ts').includes('pointerdown')) ok('ControlsPanel click/tap advance');
else fail('ControlsPanel missing pointer advance');

const sprites = read('src/utils/sprites.ts');
for (const tex of ['title_banner', 'lab_bench', 'starter_orb_${type}', 'tileTextureKey', 'playerTextureKey', 'player_back_']) {
  if (sprites.includes(tex)) ok(`sprites: ${tex}`);
  else fail(`sprites.ts missing ${tex}`);
}

if (existsSync(join(root, 'src/data/characters.ts'))) {
  const chars = read('src/data/characters.ts');
  const presetCount = (chars.match(/id: '/g) ?? []).length;
  if (presetCount >= 4) ok(`${presetCount} trainer presets`);
  else fail(`Expected ≥4 trainer presets, found ${presetCount}`);
} else fail('characters.ts missing');

const overworld = read('src/scenes/OverworldScene.ts');
if (overworld.includes('playerTextureKey') && overworld.includes('applyOverworldCamera')) {
  ok('Overworld: player sprite + camera');
} else fail('OverworldScene incomplete');

const trainerIntro = read('src/scenes/TrainerIntroScene.ts');
if (trainerIntro.includes('playerBackTextureKey') && trainerIntro.includes('GameState.player.name')) {
  ok('TrainerIntro: player back sprite + name');
} else fail('TrainerIntroScene incomplete');

// ── Input on all interactive scenes ──
const inputScenes = [
  'IntroScene', 'MenuScene', 'CharacterSelectScene', 'LabIntroScene', 'StarterSelectScene',
  'OverworldScene', 'BattleScene', 'PartyScene', 'ShopScene', 'PcScene', 'CritterdexScene',
  'PauseMenuScene', 'LearnMoveScene',
];
for (const s of inputScenes) {
  const src = read(`src/scenes/${s}.ts`);
  if (src.includes("from '../systems/input'") && src.includes('Input.bind')) ok(`${s} Input`);
  else fail(`${s} missing Input integration`);
}

// ── Production build ──
if (existsSync(join(root, 'src/ui/mapBanner.ts'))) ok('Map banner + toast UI');
else fail('mapBanner.ts missing');

const victory = read('src/scenes/VictoryScene.ts');
if (victory.includes("'Victory'") && victory.includes('champion')) ok('VictoryScene endgame credits');
else fail('VictoryScene incomplete');

const battleSrc = read('src/scenes/BattleScene.ts');
if (battleSrc.includes("'Victory'") && battleSrc.includes('rival3')) ok('Battle triggers Victory after rival3');
else fail('Battle victory trigger missing');

const dist = join(root, 'dist/index.html');
if (existsSync(dist)) ok('Production dist/ exists');
else fail('dist/ missing — run npm run build');

if (existsSync(join(root, 'scripts/ensure-dev-port.mjs'))) ok('Dev port cleanup script');
else fail('scripts/ensure-dev-port.mjs missing');

const viteCfg = read('vite.config.ts');
if (viteCfg.includes("host: '127.0.0.1'") && viteCfg.includes('strictPort: true')) ok('Vite binds 127.0.0.1 strict port');
else fail('vite.config.ts should bind 127.0.0.1 with strictPort');

if (existsSync(join(root, 'playwright.config.ts'))) ok('Playwright config');
else fail('playwright.config.ts missing');
if (existsSync(join(root, 'e2e/load.spec.ts'))) ok('E2E load spec');
else fail('e2e/load.spec.ts missing');

const dialogBox = read('src/ui/DialogBox.ts');
if (dialogBox.includes("events.once('shutdown'")) ok('DialogBox shutdown cleanup');
else fail('DialogBox missing shutdown cleanup');

if (!battleSrc.includes('setupInput')) ok('BattleScene no duplicate setupInput');
else fail('BattleScene still calls setupInput()');

if (boot.includes('preloadAssetMeta') && boot.includes('isPlaceholderAssets')) ok('BootScene placeholder-aware preload');
else fail('BootScene missing placeholder preload split');

if (read('index.html').includes('load-error')) ok('index.html load-error fallback');
else fail('index.html missing load-error UI');

if (read('src/main.ts').includes('__cq')) ok('Test bridge __cq in main.ts');
else fail('main.ts missing __cq test bridge');

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
