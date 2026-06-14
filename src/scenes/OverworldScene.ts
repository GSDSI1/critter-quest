import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getMap, type GameMap } from '../data/maps';
import { GameState, registerMapVisit } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { DialogBox } from '../ui/DialogBox';
import { ControlsPanel } from '../ui/ControlsPanel';
import { OverworldHUD } from '../ui/HUD';
import { showMapBannerForCurrentMap } from '../ui/mapBanner';
import { OverworldTouchPad } from '../ui/touchButtons';
import { pinToScreen } from '../ui/screenUi';
import { applyOverworldCamera, clampOverworldCamera, isSmallInterior } from '../utils/camera';
import { resumeAudio } from '../utils/audio';
import { setMusicThemeForMap } from '../utils/music';
import { isOutdoorMap, nightTintAlpha, tileNightTint } from '../systems/dayNight';
import { MapRenderer } from './overworld/MapRenderer';
import { NpcManager } from './overworld/NpcManager';
import { buildSkyLayer } from './overworld/SkyLayer';
import { buildCityAtmosphere, buildPierSeagulls } from './overworld/CityAtmosphere';
import { buildCaveSparkles } from './overworld/CaveSparkles';
import { buildForestFireflies } from './overworld/ForestFireflies';
import { buildWeatherLayer, type WeatherLayerHandle } from './overworld/WeatherLayer';
import { buildInteriorForMap } from '../ui/sceneBackdrops';
import { fadeInOnStart, wipeInOnStart } from '../ui/transitions';
import { shouldShowOverworldTouchPad } from '../ui/touchMenuNav';
import { WalkController } from './overworld/WalkController';
import { OverworldInputHandler, type OverworldInputContext } from './overworld/OverworldInputHandler';

export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private map!: GameMap;
  private mapRenderer!: MapRenderer;
  private npcManager!: NpcManager;
  private dialog!: DialogBox;
  private controlsPanel!: ControlsPanel;
  private hud!: OverworldHUD;
  private inputHint!: Phaser.GameObjects.Text;
  private moving = false;
  private inputLocked = false;
  private moveDuration = 200;
  private padToast?: Phaser.GameObjects.Text;
  private touchPad?: OverworldTouchPad;
  private nightOverlay?: Phaser.GameObjects.Graphics;
  private forestFireflies?: { update: (playTime: number) => void };
  private weatherLayer?: WeatherLayerHandle | null;
  private hasMoved = false;
  private introActive = false;
  private walk!: WalkController;
  private inputHandler = new OverworldInputHandler();

  constructor() {
    super('Overworld');
  }

  create(data: { showIntro?: boolean; fromBattle?: boolean; blackout?: boolean; _fadeIn?: boolean; _wipeIn?: boolean; walkTarget?: { x: number; y: number } }): void {
    fadeInOnStart(this, data, 400);
    wipeInOnStart(this, data, 300);
    resumeAudio();
    setMusicThemeForMap(GameState.player.mapId);
    this.map = getMap(GameState.player.mapId);
    this.dialog = new DialogBox(this);
    this.controlsPanel = new ControlsPanel(this);
    this.hud = new OverworldHUD(this);
    this.hud.refresh(this.map.name);
    this.inputHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 42, '', {
      fontFamily: FONT, fontSize: '11px', color: '#f5c542',
    }).setOrigin(0.5).setDepth(1100).setVisible(false);
    pinToScreen(this.inputHint, 1100);
    this.addVignette();
    this.nightOverlay = this.add.graphics().setDepth(840).setScrollFactor(0);
    pinToScreen(this.nightOverlay, 840);

    if (isOutdoorMap(this.map.id)) buildSkyLayer(this, this.map.id);
    buildCityAtmosphere(this, this.map.id);
    if (this.map.id === 'crystal_cave') buildCaveSparkles(this);
    if (this.map.id === 'forest' || this.map.id === 'secret_grove') {
      this.forestFireflies = buildForestFireflies(this);
    }
    if (this.map.id === 'route3' || this.map.id === 'fishing_pier') {
      buildPierSeagulls(this);
    }
    if (!isOutdoorMap(this.map.id)) buildInteriorForMap(this, this.map.id, this.map.mapTheme);
    if (this.map.weather) {
      this.weatherLayer = buildWeatherLayer(this, this.map.weather, 845, 0);
    }
    this.events.once('shutdown', () => this.weatherLayer?.destroy());

    this.mapRenderer = new MapRenderer(this);
    this.npcManager = new NpcManager(this, () => this.map, this.dialog, {
      setInputLocked: (locked) => { this.inputLocked = locked; },
      setMoving: (moving) => { this.moving = moving; },
      getMoveDuration: () => this.moveDuration,
      getPlayer: () => this.player,
      getPlayerShadow: () => this.playerShadow,
    });

    this.walk = new WalkController({
      scene: this,
      getMap: () => this.map,
      step: (dx, dy) => this.onPlayerMove(dx, dy),
      isMoving: () => this.moving,
      isInputLocked: () => this.inputLocked,
      isDialogShowing: () => this.dialog.isShowing(),
      isPaused: () => this.scene.isPaused(),
    });

    this.touchPad = new OverworldTouchPad(this);
    this.touchPad.setVisible(shouldShowOverworldTouchPad());
    this.hud.setTouchHints(true);
    this.hud.showMoveHint(true);
    this.events.once('shutdown', () => {
      this.inputHandler.unbind(this);
      this.touchPad?.destroy();
      this.walk?.clear();
    });
    this.inputHandler.bind(this.inputCtx());

    if (data.showIntro && !GameState.player.storyFlags.saw_controls) {
      this.startIntro([
        'Welcome to Verdant Town!',
        'Tap the map or D-pad to walk. Tall grass has wild critters.',
        'Press B / X to skip tips.',
      ], () => {
        GameState.player.storyFlags.saw_controls = true;
        trySave(this);
      });
    } else if (data.showIntro) {
      this.startIntro([
        'Welcome back to Verdant Town!',
        'Tap the map or D-pad to move. Hold Shift or L1 to run after beating Kai.',
        'Press B / X to skip.',
      ]);
    }

    if (data.blackout) {
      this.inputLocked = true;
      this.syncTouchPadModal();
      this.dialog.show(['You whited out!', 'Scurried back to the Healing Center...'], () => {
        this.inputLocked = false;
        this.syncTouchPadModal();
      });
    }

    if (GameState.player.defeatedTrainers.includes('rival')) {
      GameState.player.storyFlags.running = true;
    }

    this.mapRenderer.render(this.map);
    ({ player: this.player, shadow: this.playerShadow } = this.npcManager.spawnPlayer());
    this.npcManager.spawnNpcs(this.map);
    this.npcManager.spawnSigns(this.map);

    this.cameras.main.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    applyOverworldCamera(this.cameras.main, this.map, this.player);
    this.cameras.main.on('followupdate', () => {
      if (!isSmallInterior(this.map)) clampOverworldCamera(this.cameras.main, this.map);
    });

    if (!data.showIntro && !data.blackout) {
      this.time.delayedCall(400, () => showMapBannerForCurrentMap(this));
    }

    if (data.fromBattle) trySave(this);
    registerMapVisit(GameState.player.visitedMaps, this.map.id);

    if (data.walkTarget) {
      this.time.delayedCall(400, () => {
        this.requestWalkTo(data.walkTarget!.x, data.walkTarget!.y, { force: true });
      });
    }
  }

  private inputCtx(): OverworldInputContext {
    return {
      scene: this,
      dialog: this.dialog,
      controlsPanel: this.controlsPanel,
      hud: this.hud,
      walk: this.walk,
      npcManager: this.npcManager,
      touchPad: this.touchPad,
      isMoving: () => this.moving,
      isInputLocked: () => this.inputLocked,
      getMoveDuration: () => this.moveDuration,
      setMoveDuration: (ms) => { this.moveDuration = ms; },
      onPlayerMove: (dx, dy) => this.onPlayerMove(dx, dy),
      isIntroActive: () => this.introActive,
      skipIntro: () => this.skipIntro(),
      syncTouchPad: () => this.syncTouchPadModal(),
      updateInputHint: () => this.updateInputHint(),
      showPadToast: (msg) => this.showPadToast(msg),
      isPaused: () => this.scene.isPaused(),
    };
  }

  private addVignette(): void {
    const g = this.add.graphics().setDepth(850);
    g.fillStyle(0x000000, 0.18);
    g.fillRect(0, 0, GAME_WIDTH, 28);
    g.fillRect(0, GAME_HEIGHT - 28, GAME_WIDTH, 28);
    g.fillRect(0, 0, 28, GAME_HEIGHT);
    g.fillRect(GAME_WIDTH - 28, 0, 28, GAME_HEIGHT);
    pinToScreen(g, 850);
  }

  /** Dev/test bridge: force one tile step (same as keyboard, bypasses input lock). */
  forceStep(dx: number, dy: number): boolean {
    return this.onPlayerMove(dx, dy);
  }

  private onPlayerMove(dx: number, dy: number): boolean {
    const moved = this.npcManager.tryMove(dx, dy);
    if (moved && !this.hasMoved) {
      this.hasMoved = true;
      this.hud.clearMoveHint();
    }
    if (!moved) this.walk.clear();
    return moved;
  }

  /** Dev/test bridge: queue auto-walk to a map tile (same path as map tap). */
  requestWalkTo(tx: number, ty: number, opts?: { force?: boolean }): void {
    this.walk.requestTo(tx, ty, opts);
  }

  private startIntro(lines: string[], onFirstComplete?: () => void): void {
    this.inputLocked = true;
    this.introActive = true;
    this.syncTouchPadModal();
    this.dialog.show(lines, () => {
      this.introActive = false;
      this.inputLocked = false;
      onFirstComplete?.();
      this.syncTouchPadModal();
    });
  }

  private skipIntro(): void {
    this.introActive = false;
    this.inputLocked = false;
    this.dialog.skip();
    this.syncTouchPadModal();
  }

  private syncTouchPadModal(): void {
    OverworldInputHandler.syncTouchPadVisible(this.touchPad, this.controlsPanel.isShowing());
  }

  private updateInputHint(): void {
    const show = this.inputLocked || this.dialog.isShowing() || this.controlsPanel.isShowing();
    if (show) {
      const skip = this.introActive ? ' · B/X skip' : '';
      this.inputHint.setText(`Tap Next or press Z to continue${skip}`);
      this.inputHint.setVisible(true);
    } else {
      this.inputHint.setVisible(false);
    }
  }

  update(_time: number, delta: number): void {
    const skipMovement = this.inputHandler.update(this.inputCtx(), delta);
    this.mapRenderer.update(delta);
    this.updateDayNightTint();
    if (!isSmallInterior(this.map)) clampOverworldCamera(this.cameras.main, this.map);
    if (skipMovement) return;
  }

  private updateDayNightTint(): void {
    if (!this.nightOverlay) return;
    const outdoor = isOutdoorMap(this.map.id);
    const alpha = outdoor ? nightTintAlpha(GameState.player.playTime) : 0;
    this.nightOverlay.clear();
    if (alpha > 0.01) {
      this.nightOverlay.fillStyle(0x1e1b4b, alpha);
      this.nightOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    if (outdoor) {
      this.mapRenderer.setDayNightTint(tileNightTint(GameState.player.playTime));
    }
    this.hud.updateTimeOfDay(GameState.player.playTime, outdoor);
    this.forestFireflies?.update(GameState.player.playTime);
  }

  private showPadToast(msg: string): void {
    this.padToast?.destroy();
    this.padToast = this.add.text(GAME_WIDTH / 2, 40, msg, {
      fontFamily: FONT, fontSize: '12px', color: '#f5c542',
      backgroundColor: '#16213e', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(100);
    pinToScreen(this.padToast, 100);
    this.time.delayedCall(2000, () => { this.padToast?.destroy(); this.padToast = undefined; });
  }
}
