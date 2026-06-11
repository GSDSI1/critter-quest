import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import type { GameMap } from '../../data/maps';
import { GameState } from '../../systems/stats';
import { findPath, npcBlockedTiles, type TileCoord } from '../../systems/walkPath';

export interface WalkControllerDeps {
  scene: Phaser.Scene;
  getMap: () => GameMap;
  step: (dx: number, dy: number) => boolean;
  isMoving: () => boolean;
  isInputLocked: () => boolean;
  isDialogShowing: () => boolean;
  isPaused: () => boolean;
}

export class WalkController {
  bypassLock = false;
  private queue: TileCoord[] = [];
  private marker?: Phaser.GameObjects.Graphics;

  constructor(private deps: WalkControllerDeps) {}

  get hasQueue(): boolean {
    return this.queue.length > 0;
  }

  clear(): void {
    this.queue = [];
    this.bypassLock = false;
    this.marker?.destroy();
    this.marker = undefined;
  }

  requestTo(tx: number, ty: number, opts?: { force?: boolean }): void {
    if (opts?.force) this.bypassLock = true;
    else if (this.deps.isInputLocked() || this.deps.isDialogShowing()) return;
    this.setDestination(tx, ty);
  }

  setDestination(tx: number, ty: number): void {
    const map = this.deps.getMap();
    const px = GameState.player.x;
    const py = GameState.player.y;
    if (tx === px && ty === py) {
      this.clear();
      return;
    }
    const path = findPath(map, px, py, tx, ty, npcBlockedTiles(map));
    if (!path || path.length === 0) return;
    this.queue = path;
    this.showMarker(tx, ty);
    this.processQueue();
  }

  processQueue(): void {
    if (this.deps.isMoving() || this.queue.length === 0) return;
    if (!this.bypassLock && (this.deps.isInputLocked() || this.deps.isDialogShowing() || this.deps.isPaused())) {
      return;
    }
    const next = this.queue[0];
    const px = GameState.player.x;
    const py = GameState.player.y;
    const dx = next.x - px;
    const dy = next.y - py;
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
      this.clear();
      return;
    }
    if (this.deps.step(dx, dy)) {
      this.queue.shift();
      if (this.queue.length === 0) this.clear();
    }
  }

  private showMarker(tx: number, ty: number): void {
    const { scene } = this.deps;
    this.marker?.destroy();
    const g = scene.add.graphics().setDepth(12);
    const cx = tx * TILE_SIZE + TILE_SIZE / 2;
    const cy = ty * TILE_SIZE + TILE_SIZE / 2;
    g.lineStyle(2, 0xf5c542, 0.9);
    g.strokeCircle(cx, cy, 6);
    g.fillStyle(0xf5c542, 0.25);
    g.fillCircle(cx, cy, 4);
    this.marker = g;
    scene.tweens.add({
      targets: g,
      alpha: 0.35,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }
}
