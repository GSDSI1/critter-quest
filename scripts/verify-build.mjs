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

if (existsSync(join(root, 'GAMEPLAN.md'))) ok('GAMEPLAN.md in repo');
else fail('GAMEPLAN.md missing');

if (read('package.json').includes('"test:unit"')) ok('vitest test:unit script');
else fail('test:unit script missing');

if (existsSync(join(root, 'src/systems/rng.ts'))) ok('injectable Rng module');
else fail('src/systems/rng.ts missing');

if (existsSync(join(root, '.github/workflows/ci.yml'))) ok('GitHub Actions CI');
else fail('.github/workflows/ci.yml missing');

// ── Assets ──
const metaPath = join(root, 'public/assets/meta.json');
  if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (meta.placeholder === true) ok('meta.json placeholder mode (procedural art active)');
  else ok('meta.json custom art mode');
  if (meta.atlas === true) {
    if (existsSync(join(root, 'public/assets/critters/atlas.png'))) ok('Critter atlas PNG (meta.atlas)');
    else fail('public/assets/critters/atlas.png missing — run npm run gen-assets');
  }
} else fail('public/assets/meta.json missing');

if (existsSync(join(root, 'public/assets/tiles/tileset.png'))) ok('tileset.png present');
else fail('public/assets/tiles/tileset.png missing');

const audioDir = join(root, 'public/assets/audio');
if (existsSync(join(audioDir, 'menu_select.wav'))) ok('Generated SFX audio');
else fail('public/assets/audio missing');
if (existsSync(join(audioDir, 'music_overworld.wav'))) ok('Chiptune BGM loops');
else fail('music_overworld.wav missing — run npm run gen-assets');

const critterPngs = readdirSync(join(root, 'public/assets/critters')).filter(f => f.endsWith('.png') && !f.includes('_sm'));
ok(`${critterPngs.length} critter PNGs on disk`);

// ── Data catalog ──
const creatures = read('src/data/creatures.ts');
const speciesIds = [...creatures.matchAll(/^\s{2}[a-z]+: \{/gm)];
if (speciesIds.length === 100) ok('100 species in creatures.ts');
else fail(`Expected 100 species, found ${speciesIds.length}`);

const movesSrc = read('src/data/moves.ts');
const moveCount = (movesSrc.match(/^\s{2}[a-z][a-z0-9_]*: \{ id:/gm) ?? []).length;
if (moveCount >= 55) ok(`${moveCount} moves in moves.ts`);
else fail(`Expected ≥55 moves, found ${moveCount}`);
if (movesSrc.includes('thunder_dive') && movesSrc.includes('gleam_pulse')) ok('Batch-5 species moves');
else fail('moves.ts missing thunder_dive/gleam_pulse');

function readMapsBundle() {
  const index = read('src/data/maps/index.ts');
  const dir = join(root, 'src/data/maps');
  const parts = readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts' && f !== 'tiles.ts' && f !== 'helpers.ts');
  return index + parts.map(f => read(`src/data/maps/${f}`)).join('\n');
}
const mapsSrc = readMapsBundle();
const ALL_MAPS = [
  'town', 'heal_center', 'mart', 'lab', 'route1', 'forest', 'route2', 'mossgrove',
  'gym1', 'crystal_cave', 'route3', 'ember_city', 'gym2', 'volcanic_path',
  'route4', 'glacier_pass', 'frostvale', 'gym3', 'route5', 'mindspire', 'gym4', 'victory_road',
  'fishing_pier', 'secret_grove', 'contest_hall',
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

for (const leader of ['gym_leader', 'gym_leader_cole', 'gym_leader_glacier', 'gym_leader_sage']) {
  if (mapsSrc.includes(`id: '${leader}'`)) ok(`Gym leader "${leader}"`);
  else fail(`Gym leader "${leader}" missing`);
}

// ── Scenes registered ──
const main = read('src/main.ts');
const registerScenes = existsSync(join(root, 'src/scenes/registerScenes.ts'))
  ? read('src/scenes/registerScenes.ts') : '';
const EAGER_SCENES = ['BootScene', 'IntroScene', 'MenuScene'];
const LAZY_SCENE_KEYS = [
  'CharacterSelect', 'LabIntro', 'StarterSelect', 'Overworld', 'TrainerIntro', 'Battle',
  'Party', 'Shop', 'PC', 'Critterdex', 'PauseMenu', 'Options', 'FastTravel', 'RegionMap', 'HallOfFame', 'LearnMove', 'Nickname', 'Victory',
  'Fishing', 'BugCatch', 'CritterContest',
];
for (const scene of EAGER_SCENES) {
  if (main.includes(scene)) ok(`${scene} registered (eager)`);
  else fail(`${scene} not in main.ts`);
}
for (const key of LAZY_SCENE_KEYS) {
  if (registerScenes.includes(`'${key}'`)) ok(`Scene "${key}" lazy-registered`);
  else fail(`Scene "${key}" missing from registerScenes.ts`);
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
if (starter.includes("'Overworld'") && (starter.includes('chooseBtn') || starter.includes('Choose!'))) {
  ok('StarterSelect → Overworld (touch picker)');
} else fail('StarterSelect flow incomplete');

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
if (existsSync(join(root, 'public/assets/critters/atlas.json'))) ok('Critter texture atlas');
else fail('public/assets/critters/atlas.json missing — run npm run pack-critters');
if (assetLoader.includes('usesCreatureAtlas')) ok('Atlas-aware asset loader');
else fail('assetLoader missing preloadBootArt');
if (existsSync(join(root, 'src/scenes/registerScenes.ts'))) {
  const reg = read('src/scenes/registerScenes.ts');
  if (reg.includes('installLazySceneLoader') && reg.includes('ensureSceneRegistered')) ok('On-demand lazy scene loader');
  else fail('registerScenes.ts missing lazy loader');
}

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
const dialogBoxEarly = read('src/ui/DialogBox.ts');
if (dialogBoxEarly.includes('createTouchButton') || dialogBoxEarly.includes('pointerdown')) ok('DialogBox touch/click advance');
else fail('DialogBox missing touch advance');
if (read('src/ui/ControlsPanel.ts').includes('pointerdown')) ok('ControlsPanel click/tap advance');
else fail('ControlsPanel missing pointer advance');

function readSpritesBundle() {
  const dir = join(root, 'src/utils/sprites');
  if (!existsSync(dir)) return read('src/utils/sprites.ts');
  const files = readdirSync(dir).filter(f => f.endsWith('.ts'));
  return read('src/utils/sprites.ts') + files.map(f => read(`src/utils/sprites/${f}`)).join('\n');
}
const sprites = readSpritesBundle();
for (const tex of ['title_banner', 'starter_lab_bg', 'starter_orb_${type}', 'tileTextureKey', 'playerTextureKey', 'player_back_']) {
  if (sprites.includes(tex)) ok(`sprites: ${tex}`);
  else fail(`sprites bundle missing ${tex}`);
}
if (sprites.includes('dialog_frame') && (sprites.includes('drawNpc32') || sprites.includes('generateNpcAssets'))) {
  ok('Upgraded sprites (dialog_frame + 32px NPCs)');
} else fail('sprites bundle missing dialog_frame or NPC generator');

if (existsSync(join(root, 'src/data/characters.ts'))) {
  const chars = read('src/data/characters.ts');
  const presetCount = (chars.match(/id: '/g) ?? []).length;
  if (presetCount >= 4) ok(`${presetCount} trainer presets`);
  else fail(`Expected ≥4 trainer presets, found ${presetCount}`);
} else fail('characters.ts missing');

const overworld = read('src/scenes/OverworldScene.ts');
if (existsSync(join(root, 'src/ui/touchButtons.ts'))) ok('touchButtons.ts on-screen controls');
else fail('src/ui/touchButtons.ts missing');

const npcMgr = existsSync(join(root, 'src/scenes/overworld/NpcManager.ts'))
  ? read('src/scenes/overworld/NpcManager.ts') : '';
const owBundle = overworld + npcMgr + read('src/scenes/overworld/PlayerMovement.ts');
if (overworld.includes('OverworldTouchPad')) ok('Overworld touch D-pad');
else fail('OverworldScene missing touch pad');
if (read('src/ui/touchMenuNav.ts').includes('shouldShowOverworldTouchPad')) ok('Overworld touch pad always-on helper');
else fail('touchMenuNav missing shouldShowOverworldTouchPad');
if (existsSync(join(root, 'src/utils/focusCanvas.ts'))) ok('Canvas keyboard focus helper');
else fail('focusCanvas.ts missing');
if (existsSync(join(root, 'src/ui/statDisplay.ts'))) ok('Stat display helper (6 stats)');
else fail('statDisplay.ts missing');
if (existsSync(join(root, 'scripts/critter-art/starters.mjs'))) ok('Starter pixel art overrides');
else fail('critter-art/starters.mjs missing');
if (existsSync(join(root, 'scripts/critter-art/batch5.mjs'))) ok('Batch-5 pixel art overrides');
else fail('critter-art/batch5.mjs missing');
if (existsSync(join(root, 'scripts/critter-art/batch6.mjs'))) ok('Batch-6 pixel art overrides');
else fail('critter-art/batch6.mjs missing');
if (existsSync(join(root, 'scripts/critter-art/batch8.mjs'))) ok('Batch-8 early-route pixel art overrides');
else fail('critter-art/batch8.mjs missing');
if (existsSync(join(root, 'scripts/critter-art/batch9.mjs'))) ok('Batch-9 mid-route pixel art overrides');
else fail('critter-art/batch9.mjs missing');
for (const id of ['mossling', 'sparkbit', 'pebblite', 'cinderkit', 'thornling']) {
  if (existsSync(join(root, `public/assets/critters/${id}.png`))) ok(`Batch-8 PNG ${id}`);
  else fail(`Missing batch-8 critter PNG: ${id}.png (run npm run gen-assets)`);
}
for (const id of ['bloomoss', 'rockord', 'voltwing', 'tidewisp', 'coralite']) {
  if (existsSync(join(root, `public/assets/critters/${id}.png`))) ok(`Batch-9 PNG ${id}`);
  else fail(`Missing batch-9 critter PNG: ${id}.png (run npm run gen-assets)`);
}
if (existsSync(join(root, 'src/scenes/overworld/CaveSparkles.ts'))) ok('Cave sparkle overlay');
else fail('CaveSparkles.ts missing');
if (existsSync(join(root, 'src/scenes/overworld/ForestFireflies.ts'))) ok('Forest firefly overlay');
else fail('ForestFireflies.ts missing');
if (existsSync(join(root, 'src/ui/overworldPointer.ts'))) ok('Overworld pointer zones (tap map/D-pad)');
else fail('overworldPointer.ts missing');
if (owBundle.includes('playerTextureKey') && overworld.includes('applyOverworldCamera')) {
  ok('Overworld: player sprite + camera');
} else fail('OverworldScene incomplete');
if (existsSync(join(root, 'src/scenes/overworld/MapRenderer.ts'))) ok('MapRenderer extracted');
else fail('MapRenderer.ts missing');
if (existsSync(join(root, 'src/scenes/overworld/OverworldInputHandler.ts'))) ok('OverworldInputHandler extracted');
else fail('OverworldInputHandler.ts missing');
const owLines = overworld.split('\n').length;
if (owLines <= 350) ok(`OverworldScene ${owLines} LOC (target ≤350)`);
else fail(`OverworldScene ${owLines} LOC exceeds 350`);

const trainerIntro = read('src/scenes/TrainerIntroScene.ts');
if (trainerIntro.includes('playerBackTextureKey') && trainerIntro.includes('GameState.player.name')) {
  ok('TrainerIntro: player back sprite + name');
} else fail('TrainerIntroScene incomplete');

// ── Input on all interactive scenes ──
const inputScenes = [
  'IntroScene', 'MenuScene', 'CharacterSelectScene', 'LabIntroScene', 'StarterSelectScene',
  'OverworldScene', 'BattleScene', 'PartyScene', 'ShopScene', 'PcScene', 'CritterdexScene',
  'PauseMenuScene', 'OptionsScene', 'LearnMoveScene',
];
for (const s of inputScenes) {
  const src = read(`src/scenes/${s}.ts`);
  const inputHandler = s === 'OverworldScene' && existsSync(join(root, 'src/scenes/overworld/OverworldInputHandler.ts'))
    ? read('src/scenes/overworld/OverworldInputHandler.ts') : '';
  const bundle = src + inputHandler;
  if (bundle.includes('Input.bind') || bundle.includes('Input.update')) ok(`${s} Input`);
  else fail(`${s} missing Input integration`);
}

// ── Production build ──
const npcRouter = existsSync(join(root, 'src/scenes/overworld/npcInteractRouter.ts'))
  ? read('src/scenes/overworld/npcInteractRouter.ts') : '';
if (npcRouter.includes('resolveRematch') && npcRouter.includes('storyFlags.champion')) {
  ok('NPC router post-champion rematch gate');
} else fail('npcInteractRouter missing champion rematch gate');

if (existsSync(join(root, 'src/data/rematches.ts'))) {
  const rematchSrc = read('src/data/rematches.ts');
  const rosterCount = (rematchSrc.match(/^\s+[a-z0-9_]+: \{/gm) ?? []).length;
  if (rosterCount >= 35) ok(`${rosterCount} post-champion rematch rosters`);
  else fail(`Expected ≥35 rematch rosters, found ${rosterCount}`);
} else fail('src/data/rematches.ts missing');

if (existsSync(join(root, 'src/utils/tileAutotile.ts'))) {
  const autotile = read('src/utils/tileAutotile.ts');
  if (autotile.includes('applyGrassPathAutotiles') && autotile.includes('AUTOTILE_GRASS_PATH_BASE')) {
    ok('Grass↔path 16-case autotile helper');
  } else fail('tileAutotile.ts incomplete');
  if (autotile.includes('applyWaterShoreAutotiles') && autotile.includes('AUTOTILE_WATER_SHORE_BASE')) {
    ok('Water-shore autotile helper');
  } else fail('tileAutotile.ts missing water shore autotiles');
} else fail('src/utils/tileAutotile.ts missing');

const battleSrc = read('src/systems/battle.ts');
if (battleSrc.includes('lum_berry') || read('src/data/items.ts').includes('lum_berry')) ok('Lum Berry held item');
else fail('Lum Berry missing');

if (battleSrc.includes('sitrus_berry') && read('src/data/items.ts').includes('sitrus_berry')) ok('Sitrus Berry held item');
else fail('Sitrus Berry missing');

if (read('src/data/items.ts').includes('hard_stone') && read('src/data/items.ts').includes('shadow_cloth')) {
  ok('Type-boost held items in catalog');
} else fail('items.ts missing type-boost held items');

const pauseMenu = read('src/scenes/PauseMenuScene.ts');
if (pauseMenu.includes('Mute') && pauseMenu.includes('loadAudioSettings')) ok('Pause menu mute toggle');
else fail('PauseMenuScene missing mute toggle');
if (pauseMenu.includes('Region Map')) ok('Pause menu region map entry');
else fail('PauseMenuScene missing Region Map');

if (existsSync(join(root, 'src/scenes/RegionMapScene.ts')) && existsSync(join(root, 'src/data/regionMap.ts'))) {
  ok('Region map scene + data');
} else fail('RegionMapScene or regionMap.ts missing');

const battleScene = read('src/scenes/BattleScene.ts');
if (battleScene.includes('shouldAutoAdvanceText') && battleScene.includes('messageAutoTimer')) {
  ok('Battle text speed auto-advance');
} else fail('BattleScene missing text speed wiring');

const battleAnims = read('src/scenes/battle/BattleAnims.ts');
if (battleAnims.includes('add.particles') && battleAnims.includes('ELEMENT_EMITTERS')) ok('Particle battle move VFX');
else fail('BattleAnims missing particle VFX');
if (battleAnims.includes('animateAttackLunge')) ok('Battle attack lunge animation');
else fail('BattleAnims missing attack lunge');
if (battleAnims.includes('flashSuperEffective')) ok('Super-effective hit flash');

if (existsSync(join(root, 'src/ui/theme.ts'))) {
  const theme = read('src/ui/theme.ts');
  if (theme.includes('Press Start 2P') && read('src/ui/DialogBox.ts').includes('FONT')) ok('UI theme + Press Start 2P font');
  else fail('theme.ts or DialogBox FONT wiring incomplete');
} else fail('src/ui/theme.ts missing');

const transitions = read('src/ui/transitions.ts');
if (transitions.includes('wipeToScene') && transitions.includes('wipeRestartScene')) ok('Wipe scene transitions');
else fail('transitions.ts missing wipe helpers');

if (overworld.includes('buildHealInterior') && overworld.includes('buildSkyLayer')) ok('Heal interior + sky parallax');
else fail('OverworldScene missing atmosphere layers');
if (existsSync(join(root, 'src/scenes/overworld/CityAtmosphere.ts'))) ok('City atmosphere tints');
else fail('CityAtmosphere.ts missing');
const skyLayer = read('src/scenes/overworld/SkyLayer.ts');
if (skyLayer.includes('SKY_BY_MAP') && skyLayer.includes('skySpecForMap')) ok('Biome sky gradients');
else fail('SkyLayer missing biome sky');

if (existsSync(join(root, 'src/ui/touchMenuNav.ts'))) ok('Touch menu navigation');
else fail('touchMenuNav.ts missing');
if (battleScene.includes('TouchMenuNav')) ok('Battle touch menu nav');
else fail('BattleScene missing touch nav');

if (existsSync(join(root, 'scripts/critter-art/shapelib.mjs'))) ok('Shape-based hand art library');
else fail('shapelib.mjs missing');
if (!existsSync(join(root, 'scripts/critter-art/batch7.mjs'))) ok('batch7 retired (shapelib covers early route)');
else fail('batch7.mjs should be removed — use shapelib');
if (existsSync(join(root, 'src/data/npcDialogs.ts'))) ok('NPC dialog data module');
else fail('src/data/npcDialogs.ts missing');
if (existsSync(join(root, 'src/scenes/overworld/npcInteractRouter.ts'))) ok('NPC interact router');
else fail('npcInteractRouter.ts missing');
if (existsSync(join(root, 'src/systems/npcGates.ts'))) ok('NPC gate logic module');
else fail('npcGates.ts missing');
if (existsSync(join(root, 'src/scenes/overworld/WeatherLayer.ts'))) ok('Overworld weather VFX layer');
else fail('WeatherLayer.ts missing');
if (existsSync(join(root, 'src/ui/encounterTransition.ts'))) ok('Wild encounter transition');
else fail('encounterTransition.ts missing');
if (existsSync(join(root, 'public/pwa-192.png'))) ok('PWA icon pwa-192.png');
else fail('public/pwa-192.png missing — run npm run gen-assets');
const genAssets = read('scripts/generate-png-assets.mjs');
if (genAssets.indexOf('drawStarterOverride') < genAssets.indexOf('drawBatch6Override')) {
  ok('Art override priority: starters before batch6');
} else fail('generate-png-assets: starters must override before batch6/batch7');
if (existsSync(join(root, 'scripts/fetch-kenney-tileset.mjs'))) ok('Kenney fetch script');
else fail('fetch-kenney-tileset.mjs missing');
if (existsSync(join(root, 'CREDITS.md'))) ok('CREDITS.md');
else fail('CREDITS.md missing');

const optionsScene = read('src/scenes/OptionsScene.ts');
if (optionsScene.includes('Master Vol') && optionsScene.includes('audio.master')) ok('Options master volume');
else fail('OptionsScene missing master volume');

const tilesProc = read('src/utils/sprites/tiles.ts');
if (tilesProc.includes('OUTDOOR_PROC_TILE_COUNT') && tilesProc.includes('drawGrassPathAutotile')) {
  ok('Procedural outdoor autotile frames');
} else fail('tiles.ts missing procedural autotile bake');

const mapRenderer = existsSync(join(root, 'src/scenes/overworld/MapRenderer.ts'))
  ? read('src/scenes/overworld/MapRenderer.ts') : '';
if (mapRenderer.includes('applyMapAutotiles')) ok('MapRenderer procedural autotile pass');
else fail('MapRenderer missing applyMapAutotiles');

const musicTs = read('src/utils/music.ts');
if (musicTs.includes('bgm_') && musicTs.includes('bindMusicScene')) ok('Phaser BGM loop player');
else fail('music.ts missing BGM loop support');

const critterdex = read('src/scenes/CritterdexScene.ts');
if (critterdex.includes('learnScroll')) ok('Critterdex learnset scroll');
else fail('CritterdexScene missing learnset scroll');

const encounters = read('src/data/encounters.ts');
if (encounters.includes('resolveEncounterTable') && encounters.includes('forest_night')) {
  ok('Day/night encounter table variants');
} else fail('encounters.ts missing night tables');
if (encounters.includes('fishing_catch') && encounters.includes('secret_grove')) {
  ok('Minigame + secret grove encounter tables');
} else fail('encounters.ts missing fishing_catch or secret_grove');

if (existsSync(join(root, 'src/systems/walkPath.ts'))) ok('Walk path BFS module');
else fail('src/systems/walkPath.ts missing');
if (existsSync(join(root, 'src/ui/minigameShell.ts'))) ok('Minigame UI shell');
else fail('src/ui/minigameShell.ts missing');
if (existsSync(join(root, 'src/scenes/FishingScene.ts'))) ok('FishingScene');
else fail('FishingScene.ts missing');
if (read('src/data/items.ts').includes('old_rod') && read('src/data/items.ts').includes('contest_ribbon')) {
  ok('Minigame items (old_rod, contest_ribbon)');
} else fail('items.ts missing minigame items');

if (existsSync(join(root, 'src/ui/mapBanner.ts'))) ok('Map banner + toast UI');
else fail('mapBanner.ts missing');

const victory = read('src/scenes/VictoryScene.ts');
if (victory.includes("'Victory'") && (victory.includes('champion') || victory.includes('league_ready'))) {
  ok('VictoryScene endgame credits');
} else fail('VictoryScene incomplete');

if (battleScene.includes("'Victory'") && battleScene.includes('rival3')) ok('Battle triggers Victory after rival3');
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
if (dialogBox.includes('pinContainerChildren')) ok('DialogBox uses pinContainerChildren');
else fail('DialogBox should use pinContainerChildren only');
if (dialogBox.includes('speakerText')) ok('DialogBox speaker label');
else fail('DialogBox missing speaker label');

if (existsSync(join(root, 'src/ui/sceneBackdrops.ts'))) {
  const backdrops = read('src/ui/sceneBackdrops.ts');
  if (backdrops.includes('buildLabInterior') && backdrops.includes('buildMenuPanel')) ok('sceneBackdrops.ts');
  else fail('sceneBackdrops.ts incomplete');
} else fail('src/ui/sceneBackdrops.ts missing');

if (existsSync(join(root, 'e2e/lab-intro.spec.ts'))) ok('E2E lab intro spec');
else fail('e2e/lab-intro.spec.ts missing');
if (existsSync(join(root, 'e2e/movement.spec.ts'))) ok('E2E movement spec');
else fail('e2e/movement.spec.ts missing');
if (existsSync(join(root, 'e2e/minigames.spec.ts'))) ok('E2E minigames spec');
else fail('e2e/minigames.spec.ts missing');

if (!battleScene.includes('setupInput')) ok('BattleScene no duplicate setupInput');
else fail('BattleScene still calls setupInput()');

if (boot.includes('preloadAssetMeta') && boot.includes('isPlaceholderAssets')) ok('BootScene placeholder-aware preload');
else fail('BootScene missing placeholder preload split');

if (read('index.html').includes('load-error')) ok('index.html load-error fallback');
else fail('index.html missing load-error UI');

if (read('src/main.ts').includes('__cq')) ok('Test bridge __cq in main.ts');
else fail('main.ts missing __cq test bridge');

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
