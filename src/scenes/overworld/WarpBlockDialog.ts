import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import type { GameMap } from '../../data/maps';
import { GameState } from '../../systems/stats';
import { DialogBox } from '../../ui/DialogBox';

type WarpTile = GameMap['warps'][number];

export interface WarpBlockContext {
  dialog: DialogBox;
  getPlayer: () => Phaser.GameObjects.Sprite;
  getPlayerShadow: () => Phaser.GameObjects.Ellipse;
  setInputLocked: (locked: boolean) => void;
}

function bouncePlayer(ctx: WarpBlockContext, dx: number, dy: number): void {
  const player = ctx.getPlayer();
  const shadow = ctx.getPlayerShadow();
  if (dy < 0) GameState.player.y++;
  else if (dy > 0) GameState.player.y--;
  else if (dx < 0) GameState.player.x++;
  else GameState.player.x++;
  player.x = GameState.player.x * TILE_SIZE + TILE_SIZE / 2;
  player.y = GameState.player.y * TILE_SIZE + TILE_SIZE / 2;
  shadow.x = player.x;
  shadow.y = player.y + 6;
}

export function showWarpBlocked(ctx: WarpBlockContext, warp: WarpTile, dx: number, dy: number): void {
  ctx.setInputLocked(true);
  const done = () => {
    bouncePlayer(ctx, dx, dy);
    ctx.setInputLocked(false);
  };

  if (warp.requiresAllBadges?.length) {
    ctx.dialog.show([
      'The path is hidden behind ancient trees.',
      'Earn Verdant and Ember badges — or become Champion.',
    ], done);
    return;
  }
  if (warp.requiresFlag) {
    ctx.dialog.show(['The path is sealed.', 'Only the regional Champion may enter.'], done);
    return;
  }
  const badgeNames: Record<string, string> = {
    verdant: 'Verdant', ember: 'Ember', frost: 'Frost', psyche: 'Psyche',
  };
  const badgeName = badgeNames[warp.requiresBadge ?? ''] ?? warp.requiresBadge;
  ctx.dialog.show(`The path is blocked. Earn the ${badgeName} Badge first!`, done);
}
