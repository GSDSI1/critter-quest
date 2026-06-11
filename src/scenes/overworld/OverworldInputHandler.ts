import Phaser from 'phaser';
import { Input } from '../../systems/input';
import { GameState } from '../../systems/stats';
import { canAlwaysRun } from '../../systems/options';
import { resolveOverworldPointer } from '../../ui/overworldPointer';
import { markTouchPreferred, shouldShowOverworldTouchPad } from '../../ui/touchMenuNav';
import { focusGameCanvas } from '../../utils/focusCanvas';
import type { DialogBox } from '../../ui/DialogBox';
import type { ControlsPanel } from '../../ui/ControlsPanel';
import type { OverworldHUD } from '../../ui/HUD';
import type { OverworldTouchPad } from '../../ui/touchButtons';
import type { WalkController } from './WalkController';
import type { NpcManager } from './NpcManager';

export interface OverworldInputContext {
  scene: Phaser.Scene;
  dialog: DialogBox;
  controlsPanel: ControlsPanel;
  hud: OverworldHUD;
  walk: WalkController;
  npcManager: NpcManager;
  touchPad?: OverworldTouchPad;
  isMoving: () => boolean;
  isInputLocked: () => boolean;
  getMoveDuration: () => number;
  setMoveDuration: (ms: number) => void;
  onPlayerMove: (dx: number, dy: number) => boolean;
  isIntroActive: () => boolean;
  skipIntro: () => void;
  syncTouchPad: () => void;
  updateInputHint: () => void;
  showPadToast: (msg: string) => void;
  isPaused: () => boolean;
}

export class OverworldInputHandler {
  private pointerHold: 'move' | 'walk' | null = null;
  private pointerHoldDir = { dx: 0, dy: 0 };
  private pointerStepCooldown = 0;
  private boundScene?: Phaser.Scene;
  private onPointerDown?: (pointer: Phaser.Input.Pointer) => void;
  private onPointerUp?: () => void;
  private onPointerMove?: (pointer: Phaser.Input.Pointer) => void;
  private ctx?: OverworldInputContext;

  unbind(scene: Phaser.Scene): void {
    if (this.boundScene !== scene) return;
    if (this.onPointerDown) scene.input.off('pointerdown', this.onPointerDown);
    if (this.onPointerUp) scene.input.off('pointerup', this.onPointerUp);
    if (this.onPointerMove) scene.input.off('pointermove', this.onPointerMove);
    this.pointerHold = null;
    this.pointerStepCooldown = 0;
    this.onPointerDown = undefined;
    this.onPointerUp = undefined;
    this.onPointerMove = undefined;
    this.boundScene = undefined;
    this.ctx = undefined;
  }

  bind(ctx: OverworldInputContext): void {
    this.unbind(ctx.scene);
    this.ctx = ctx;
    this.boundScene = ctx.scene;
    Input.bind(ctx.scene);

    const { scene } = ctx;
    this.onPointerDown = (pointer: Phaser.Input.Pointer) => {
      markTouchPreferred();
      focusGameCanvas();
      if (ctx.dialog.isShowing()) {
        ctx.dialog.advance();
        return;
      }
      if (ctx.controlsPanel.isShowing()) {
        ctx.controlsPanel.advance();
        return;
      }
      this.handlePointerDown(ctx, pointer);
    };
    this.onPointerUp = () => {
      this.pointerHold = null;
      this.pointerStepCooldown = 0;
    };
    this.onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (this.pointerHold !== 'walk' || !pointer.isDown) return;
      if (ctx.dialog.isShowing() || ctx.isInputLocked() || ctx.isPaused()) return;
      const action = resolveOverworldPointer(ctx.scene, pointer);
      if (action?.type === 'walk') ctx.walk.setDestination(action.tx, action.ty);
    };

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointerup', this.onPointerUp);
    scene.input.on('pointermove', this.onPointerMove);
    scene.events.on('wake', () => focusGameCanvas());
    scene.time.delayedCall(100, () => focusGameCanvas());
  }

  handlePointerDown(ctx: OverworldInputContext, pointer: Phaser.Input.Pointer): void {
    if (ctx.dialog.isShowing() || ctx.controlsPanel.isShowing()) return;
    if (ctx.isInputLocked() || ctx.isPaused()) return;

    const action = resolveOverworldPointer(ctx.scene, pointer);
    if (!action) return;

    if (action.type === 'talk') {
      ctx.walk.clear();
      ctx.npcManager.tryInteract();
      return;
    }
    if (action.type === 'menu') {
      ctx.walk.clear();
      ctx.scene.scene.launch('PauseMenu');
      ctx.scene.scene.pause();
      return;
    }
    if (action.type === 'move') {
      ctx.walk.clear();
      this.pointerHold = 'move';
      this.pointerHoldDir = { dx: action.dx, dy: action.dy };
      this.pointerStepCooldown = 0;
      ctx.onPlayerMove(action.dx, action.dy);
      return;
    }
    this.pointerHold = 'walk';
    ctx.walk.setDestination(action.tx, action.ty);
  }

  /** Returns true when movement/keyboard input should be skipped this frame. */
  update(ctx: OverworldInputContext, delta: number): boolean {
    Input.update();

    if (Input.gamepadJustConnected()) {
      ctx.showPadToast('Controller connected');
    }

    if (ctx.controlsPanel.isShowing()) {
      ctx.syncTouchPad();
      if (Input.justPressed('left')) ctx.controlsPanel.prevPage();
      if (Input.justPressed('right')) ctx.controlsPanel.nextPage();
      if (Input.justPressed('confirm')) ctx.controlsPanel.advance();
      if (Input.justPressed('cancel')) ctx.controlsPanel.skip();
      ctx.updateInputHint();
      return true;
    }

    if (ctx.walk.bypassLock && ctx.walk.hasQueue && !ctx.isMoving() && !ctx.isPaused()) {
      ctx.walk.processQueue();
    }

    if (ctx.dialog.isShowing()) {
      ctx.syncTouchPad();
      if (ctx.isIntroActive() && Input.justPressed('cancel')) {
        ctx.skipIntro();
      } else if (Input.justPressed('confirm') || Input.justPressed('cancel')) {
        ctx.walk.clear();
        ctx.dialog.advance();
      }
      ctx.updateInputHint();
      return true;
    }

    ctx.updateInputHint();
    ctx.syncTouchPad();

    const blocked = (ctx.isInputLocked() && !ctx.walk.bypassLock) || ctx.isMoving() || ctx.isPaused();
    ctx.touchPad?.setEnabled(!blocked);

    if (!blocked && this.pointerHold === 'move' && ctx.scene.input.activePointer.isDown) {
      this.pointerStepCooldown -= delta;
      if (this.pointerStepCooldown <= 0) {
        ctx.onPlayerMove(this.pointerHoldDir.dx, this.pointerHoldDir.dy);
        this.pointerStepCooldown = ctx.getMoveDuration();
      }
    }

    if (!blocked && ctx.walk.hasQueue && !ctx.isMoving()) {
      ctx.walk.processQueue();
    }

    if (!blocked && this.pointerHold === 'walk' && ctx.scene.input.activePointer.isDown) {
      this.pointerStepCooldown -= delta;
      if (this.pointerStepCooldown <= 0) {
        this.pointerStepCooldown = ctx.getMoveDuration();
        if (!ctx.walk.hasQueue) {
          const action = resolveOverworldPointer(ctx.scene, ctx.scene.input.activePointer);
          if (action?.type === 'walk') ctx.walk.setDestination(action.tx, action.ty);
        }
      }
    }

    if (blocked) return true;

    GameState.player.playTime += delta / 1000;

    if (Input.justPressed('party')) {
      ctx.walk.clear();
      ctx.scene.scene.launch('Party');
      ctx.scene.scene.pause();
      return true;
    }
    if (Input.justPressed('pause')) {
      ctx.walk.clear();
      ctx.scene.scene.launch('PauseMenu');
      ctx.scene.scene.pause();
      return true;
    }
    if (Input.justPressed('confirm')) {
      ctx.npcManager.tryInteract();
      return true;
    }

    const canRun = GameState.player.storyFlags.running || canAlwaysRun();
    const running = canRun && Input.isHeld('run');
    ctx.setMoveDuration(running ? 100 : 200);

    const { dx, dy } = Input.getMovement();
    if (dx !== 0 || dy !== 0) ctx.onPlayerMove(dx, dy);
    return false;
  }

  static syncTouchPadVisible(touchPad: OverworldTouchPad | undefined, controlsShowing: boolean): void {
    touchPad?.setVisible(!controlsShowing && shouldShowOverworldTouchPad());
  }
}
