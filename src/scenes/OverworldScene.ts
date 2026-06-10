import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getMap, type GameMap } from '../data/maps';
import { GameState } from '../systems/stats';
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
import { isOutdoorMap, nightTintAlpha } from '../systems/dayNight';
import { MapRenderer } from './overworld/MapRenderer';
import { NpcManager } from './overworld/NpcManager';

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

  constructor() {
    super('Overworld');
  }

  create(data: { showIntro?: boolean; fromBattle?: boolean; blackout?: boolean }): void {
    resumeAudio();
    setMusicThemeForMap(GameState.player.mapId);
    Input.bind(this);
    this.map = getMap(GameState.player.mapId);
    this.dialog = new DialogBox(this);
    this.controlsPanel = new ControlsPanel(this);
    this.hud = new OverworldHUD(this);
    this.hud.refresh(this.map.name);
    this.inputHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 28, '', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5).setDepth(1100).setVisible(false);
    pinToScreen(this.inputHint, 1100);
    this.addVignette();
    this.nightOverlay = this.add.graphics().setDepth(840).setScrollFactor(0);
    pinToScreen(this.nightOverlay, 840);

    this.mapRenderer = new MapRenderer(this);
    this.npcManager = new NpcManager(this, () => this.map, this.dialog, {
      setInputLocked: (locked) => { this.inputLocked = locked; },
      setMoving: (moving) => { this.moving = moving; },
      getMoveDuration: () => this.moveDuration,
      getPlayer: () => this.player,
      getPlayerShadow: () => this.playerShadow,
    });

    this.touchPad = new OverworldTouchPad(
      this,
      (dx, dy) => this.npcManager.tryMove(dx, dy),
      () => this.npcManager.tryInteract(),
      () => { this.scene.launch('PauseMenu'); this.scene.pause(); },
    );

    this.mapRenderer.render(this.map);
    ({ player: this.player, shadow: this.playerShadow } = this.npcManager.spawnPlayer());
    this.npcManager.spawnNpcs(this.map);
    this.npcManager.spawnSigns(this.map);

    if (data.showIntro && !GameState.player.storyFlags.saw_controls) {
      this.inputLocked = true;
      this.controlsPanel.show(() => {
        GameState.player.storyFlags.saw_controls = true;
        trySave(this);
        this.dialog.show([
          'Welcome to Verdant Town!',
          'Walk into tall grass to find wild critters.',
          'Good luck on your Critter Quest!',
        ], () => { this.inputLocked = false; });
      });
    } else if (data.showIntro) {
      this.inputLocked = true;
      this.dialog.show([
        'Welcome to Verdant Town!',
        'Walk into tall grass to find wild critters.',
        'Hold Shift or L1 to run (after beating Kai).',
      ], () => { this.inputLocked = false; });
    }

    if (data.blackout) {
      this.inputLocked = true;
      this.dialog.show(['You whited out!', 'Scurried back to the Healing Center...'], () => {
        this.inputLocked = false;
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

  private updateInputHint(): void {
    const show = this.inputLocked || this.dialog.isShowing() || this.controlsPanel.isShowing();
    if (show) {
      this.inputHint.setText(
        this.controlsPanel.isShowing()
          ? 'Press A / Z — continue   B / ESC — skip'
          : 'Press A / Z to continue',
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
      this.touchPad?.setEnabled(false);
      if (Input.justPressed('left')) this.controlsPanel.prevPage();
      if (Input.justPressed('right')) this.controlsPanel.nextPage();
      if (Input.justPressed('confirm')) this.controlsPanel.advance();
      if (Input.justPressed('cancel')) this.controlsPanel.skip();
      this.updateInputHint();
      return;
    }

    if (this.dialog.isShowing()) {
      this.touchPad?.setEnabled(false);
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
      this.updateInputHint();
      return;
    }

    this.updateInputHint();

    const blocked = this.inputLocked || this.moving || this.scene.isPaused();
    this.touchPad?.setEnabled(!blocked);

    this.mapRenderer.update(delta);
    this.updateDayNightTint();

    if (blocked) return;
    GameState.player.playTime += delta / 1000;

    if (Input.justPressed('party')) {
      this.scene.launch('Party');
      this.scene.pause();
      return;
    }
    if (Input.justPressed('pause')) {
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
    if (dx !== 0 || dy !== 0) this.npcManager.tryMove(dx, dy);
  }

  private updateDayNightTint(): void {
    if (!this.nightOverlay) return;
    const alpha = isOutdoorMap(this.map.id) ? nightTintAlpha(GameState.player.playTime) : 0;
    this.nightOverlay.clear();
    if (alpha > 0.01) {
      this.nightOverlay.fillStyle(0x1e1b4b, alpha);
      this.nightOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  private showPadToast(msg: string): void {
    this.padToast?.destroy();
    this.padToast = this.add.text(GAME_WIDTH / 2, 40, msg, {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#f5c542',
      backgroundColor: '#16213e', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(100);
    pinToScreen(this.padToast, 100);
    this.time.delayedCall(2000, () => { this.padToast?.destroy(); this.padToast = undefined; });
  }
}
