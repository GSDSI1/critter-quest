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
import { applyOverworldCamera } from '../utils/camera';
import { resumeAudio } from '../utils/audio';
import { setMusicThemeForMap, startMusic, stopMusic } from '../utils/music';
import { Input } from '../systems/input';
import { canAlwaysRun } from '../systems/options';
import { isOutdoorMap, nightTintAlpha, tileNightTint } from '../systems/dayNight';
import { MapRenderer } from './overworld/MapRenderer';
import { NpcManager } from './overworld/NpcManager';
import { buildSkyLayer } from './overworld/SkyLayer';
import { buildCityAtmosphere, buildPierSeagulls } from './overworld/CityAtmosphere';
import { buildCaveSparkles } from './overworld/CaveSparkles';
import { buildForestFireflies } from './overworld/ForestFireflies';
import { buildHealInterior } from '../ui/sceneBackdrops';
import { fadeInOnStart, wipeInOnStart } from '../ui/transitions';
import { markTouchPreferred, shouldShowOverworldTouchPad } from '../ui/touchMenuNav';
import { focusGameCanvas } from '../utils/focusCanvas';
import { resolveOverworldPointer } from '../ui/overworldPointer';
import { findPath, npcBlockedTiles, type TileCoord } from '../systems/walkPath';

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
  private hasMoved = false;
  private pointerStepCooldown = 0;
  private pointerHold: 'move' | 'walk' | null = null;
  private pointerHoldDir = { dx: 0, dy: 0 };
  private walkBypassLock = false;
  private walkQueue: TileCoord[] = [];
  private walkTarget: TileCoord | null = null;
  private introActive = false;
  private walkMarker?: Phaser.GameObjects.Graphics;

  constructor() {
    super('Overworld');
  }

  create(data: { showIntro?: boolean; fromBattle?: boolean; blackout?: boolean; _fadeIn?: boolean; _wipeIn?: boolean }): void {
    fadeInOnStart(this, data, 400);
    wipeInOnStart(this, data, 300);
    resumeAudio();
    setMusicThemeForMap(GameState.player.mapId);
    Input.bind(this);
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
    if (this.map.id === 'forest') {
      this.forestFireflies = buildForestFireflies(this);
    }
    if (this.map.id === 'secret_grove') {
      this.forestFireflies = buildForestFireflies(this);
    }
    if (this.map.id === 'route3' || this.map.id === 'fishing_pier') {
      buildPierSeagulls(this);
    }
    if (this.map.id === 'heal_center') buildHealInterior(this);

    this.mapRenderer = new MapRenderer(this);
    this.npcManager = new NpcManager(this, () => this.map, this.dialog, {
      setInputLocked: (locked) => { this.inputLocked = locked; },
      setMoving: (moving) => { this.moving = moving; },
      getMoveDuration: () => this.moveDuration,
      getPlayer: () => this.player,
      getPlayerShadow: () => this.playerShadow,
    });

    this.touchPad = new OverworldTouchPad(this);
    this.touchPad.setVisible(shouldShowOverworldTouchPad());
    this.hud.setTouchHints(true);
    this.hud.showMoveHint(true);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      markTouchPreferred();
      focusGameCanvas();
      if (this.dialog.isShowing()) {
        this.dialog.advance();
        return;
      }
      if (this.controlsPanel.isShowing()) {
        this.controlsPanel.advance();
        return;
      }
      this.handlePointerDown(pointer);
    });
    this.input.on('pointerup', () => {
      this.pointerHold = null;
      this.pointerStepCooldown = 0;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.pointerHold !== 'walk' || !pointer.isDown) return;
      if (this.dialog.isShowing() || this.inputLocked || this.scene.isPaused()) return;
      const action = resolveOverworldPointer(this, pointer);
      if (action?.type === 'walk') this.setWalkDestination(action.tx, action.ty);
    });
    this.events.on('wake', () => focusGameCanvas());
    this.time.delayedCall(100, () => focusGameCanvas());

    this.mapRenderer.render(this.map);
    ({ player: this.player, shadow: this.playerShadow } = this.npcManager.spawnPlayer());
    this.npcManager.spawnNpcs(this.map);
    this.npcManager.spawnSigns(this.map);

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

    this.cameras.main.setBounds(0, 0, this.map.width * TILE_SIZE, this.map.height * TILE_SIZE);
    applyOverworldCamera(this.cameras.main, this.map, this.player);

    if (!data.showIntro && !data.blackout) {
      this.time.delayedCall(400, () => showMapBannerForCurrentMap(this));
    }

    if (data.fromBattle) trySave(this);
    registerMapVisit(GameState.player.visitedMaps, this.map.id);
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

  private onPlayerMove(dx: number, dy: number): boolean {
    const moved = this.npcManager.tryMove(dx, dy);
    if (moved && !this.hasMoved) {
      this.hasMoved = true;
      this.hud.clearMoveHint();
    }
    if (!moved) this.clearWalkPath();
    return moved;
  }

  /** Dev/test bridge: queue auto-walk to a map tile (same path as map tap). */
  requestWalkTo(tx: number, ty: number, opts?: { force?: boolean }): void {
    if (opts?.force) this.walkBypassLock = true;
    else if (this.inputLocked || this.dialog.isShowing()) return;
    this.setWalkDestination(tx, ty);
  }

  private clearWalkPath(): void {
    this.walkQueue = [];
    this.walkTarget = null;
    this.walkBypassLock = false;
    this.walkMarker?.destroy();
    this.walkMarker = undefined;
  }

  private showWalkMarker(tx: number, ty: number): void {
    this.walkMarker?.destroy();
    const g = this.add.graphics().setDepth(12);
    const cx = tx * TILE_SIZE + TILE_SIZE / 2;
    const cy = ty * TILE_SIZE + TILE_SIZE / 2;
    g.lineStyle(2, 0xf5c542, 0.9);
    g.strokeCircle(cx, cy, 6);
    g.fillStyle(0xf5c542, 0.25);
    g.fillCircle(cx, cy, 4);
    this.walkMarker = g;
    this.tweens.add({
      targets: g,
      alpha: 0.35,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private setWalkDestination(tx: number, ty: number): void {
    const px = GameState.player.x;
    const py = GameState.player.y;
    if (tx === px && ty === py) {
      this.clearWalkPath();
      return;
    }
    const path = findPath(this.map, px, py, tx, ty, npcBlockedTiles(this.map));
    if (!path || path.length === 0) return;
    this.walkQueue = path;
    this.walkTarget = { x: tx, y: ty };
    this.showWalkMarker(tx, ty);
    this.processWalkQueue();
  }

  private processWalkQueue(): void {
    if (this.moving || this.walkQueue.length === 0) return;
    if (!this.walkBypassLock && (this.inputLocked || this.dialog.isShowing() || this.scene.isPaused())) return;
    const next = this.walkQueue[0];
    const px = GameState.player.x;
    const py = GameState.player.y;
    const dx = next.x - px;
    const dy = next.y - py;
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      this.clearWalkPath();
      return;
    }
    if (this.onPlayerMove(dx, dy)) {
      this.walkQueue.shift();
      if (this.walkQueue.length === 0) this.clearWalkPath();
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.dialog.isShowing() || this.controlsPanel.isShowing()) return;
    if (this.inputLocked || this.scene.isPaused()) return;

    const action = resolveOverworldPointer(this, pointer);
    if (!action) return;

    if (action.type === 'talk') {
      this.clearWalkPath();
      this.npcManager.tryInteract();
      return;
    }
    if (action.type === 'menu') {
      this.clearWalkPath();
      this.scene.launch('PauseMenu');
      this.scene.pause();
      return;
    }
    if (action.type === 'move') {
      this.clearWalkPath();
      this.pointerHold = 'move';
      this.pointerHoldDir = { dx: action.dx, dy: action.dy };
      this.pointerStepCooldown = 0;
      this.onPlayerMove(action.dx, action.dy);
      return;
    }
    this.pointerHold = 'walk';
    this.setWalkDestination(action.tx, action.ty);
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
    this.dialog.skip();
  }

  private syncTouchPadModal(): void {
    const hidePad = this.controlsPanel.isShowing();
    this.touchPad?.setVisible(!hidePad && shouldShowOverworldTouchPad());
  }

  private updateInputHint(): void {
    const show = this.inputLocked || this.dialog.isShowing() || this.controlsPanel.isShowing();
    if (show) {
      const skip = this.introActive ? ' · B/X skip' : '';
      this.inputHint.setText(
        this.controlsPanel.isShowing()
          ? `Tap Next or press Z to continue${skip}`
          : `Tap Next or press Z to continue${skip}`,
      );
      this.inputHint.setVisible(true);
    } else {
      this.inputHint.setVisible(false);
    }
  }

  update(_time: number, delta: number): void {
    Input.update();

    if (Input.gamepadJustConnected()) {
      this.showPadToast('Controller connected');
    }

    if (this.controlsPanel.isShowing()) {
      this.syncTouchPadModal();
      if (Input.justPressed('left')) this.controlsPanel.prevPage();
      if (Input.justPressed('right')) this.controlsPanel.nextPage();
      if (Input.justPressed('confirm')) this.controlsPanel.advance();
      if (Input.justPressed('cancel')) this.controlsPanel.skip();
      this.updateInputHint();
      return;
    }

    if (this.walkBypassLock && this.walkQueue.length > 0 && !this.moving && !this.scene.isPaused()) {
      this.processWalkQueue();
    }

    if (this.dialog.isShowing()) {
      this.syncTouchPadModal();
      if (this.introActive && Input.justPressed('cancel')) {
        this.skipIntro();
      } else if (Input.justPressed('confirm') || Input.justPressed('cancel')) {
        this.clearWalkPath();
        this.dialog.advance();
      }
      this.updateInputHint();
      return;
    }

    this.updateInputHint();

    this.syncTouchPadModal();
    const blocked = (this.inputLocked && !this.walkBypassLock) || this.moving || this.scene.isPaused();
    this.touchPad?.setEnabled(!blocked);

    this.mapRenderer.update(delta);
    this.updateDayNightTint();

    if (!blocked && this.pointerHold === 'move' && this.input.activePointer.isDown) {
      this.pointerStepCooldown -= delta;
      if (this.pointerStepCooldown <= 0) {
        this.onPlayerMove(this.pointerHoldDir.dx, this.pointerHoldDir.dy);
        this.pointerStepCooldown = this.moveDuration;
      }
    }

    if (!blocked && this.walkQueue.length > 0 && !this.moving) {
      this.processWalkQueue();
    }

    if (!blocked && this.pointerHold === 'walk' && this.input.activePointer.isDown) {
      this.pointerStepCooldown -= delta;
      if (this.pointerStepCooldown <= 0) {
        this.pointerStepCooldown = this.moveDuration;
        if (this.walkQueue.length === 0) {
          const action = resolveOverworldPointer(this, this.input.activePointer);
          if (action?.type === 'walk') this.setWalkDestination(action.tx, action.ty);
        }
      }
    }

    if (blocked) return;
    GameState.player.playTime += delta / 1000;

    if (Input.justPressed('party')) {
      this.clearWalkPath();
      this.scene.launch('Party');
      this.scene.pause();
      return;
    }
    if (Input.justPressed('pause')) {
      this.clearWalkPath();
      this.scene.launch('PauseMenu');
      this.scene.pause();
      return;
    }
    if (Input.justPressed('confirm')) {
      this.npcManager.tryInteract();
      return;
    }

    const canRun = GameState.player.storyFlags.running || canAlwaysRun();
    const running = canRun && Input.isHeld('run');
    this.moveDuration = running ? 100 : 200;

    const { dx, dy } = Input.getMovement();
    if (dx !== 0 || dy !== 0) this.onPlayerMove(dx, dy);
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
