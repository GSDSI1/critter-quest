import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import {
  getTile, isWalkable, isEncounterTile, isWarpTile,
  type MapNpc, type GameMap,
} from '../../data/maps';
import { pickWildFromTable, resolveEncounterTable } from '../../data/encounters';
import { featuredSpeciesOfDay, shinyOddsFor } from '../../systems/dailyFeature';
import {
  GameState, firstAlive, createCritter, registerSeen, registerMapVisit,
  type CritterInstance,
} from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { DialogBox } from '../../ui/DialogBox';
import { playerTextureKey } from '../../utils/sprites';
import { Sfx } from '../../utils/audio';
import { registerHealVisit } from '../../systems/healTravel';
import { wipeRestartScene } from '../../ui/transitions';
import { warpGateAllowed } from '../../systems/warpGates';
import { showWarpBlocked } from './WarpBlockDialog';
import type { NpcManagerCallbacks } from './NpcManager';

export interface PlayerMovementDeps {
  scene: Phaser.Scene;
  getMap: () => GameMap;
  dialog: DialogBox;
  callbacks: NpcManagerCallbacks;
  interactNpc: (npc: MapNpc) => void;
  launchWildBattle: (party: CritterInstance[]) => void;
}

/** Player spawn, tile-by-tile movement, walk FX, warps, and wild encounters. */
export class PlayerMovement {
  constructor(private deps: PlayerMovementDeps) {}

  spawnPlayer(): { player: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse } {
    const { scene } = this.deps;
    const shadow = scene.add.ellipse(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2 + 6,
      10, 4, 0x000000, 0.25,
    ).setDepth(9);
    const player = scene.add.sprite(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2,
      playerTextureKey(scene, GameState.player.characterId, GameState.player.facing, 0),
    ).setDepth(10);
    return { player, shadow };
  }

  tryMove(dx: number, dy: number): boolean {
    const { scene, callbacks, dialog } = this.deps;
    const map = this.deps.getMap();
    const player = callbacks.getPlayer();
    const playerShadow = callbacks.getPlayerShadow();
    const moveDuration = callbacks.getMoveDuration();

    const facing = dx === -1 ? 'left' : dx === 1 ? 'right' : dy === -1 ? 'up' : 'down';
    GameState.player.facing = facing;
    const nx = GameState.player.x + dx;
    const ny = GameState.player.y + dy;
    const tile = getTile(map, nx, ny);

    if (!isWalkable(tile)) {
      player.setTexture(playerTextureKey(scene, GameState.player.characterId, facing, 0));
      return false;
    }

    const npc = map.npcs.find(n => n.x === nx && n.y === ny);
    if (npc) {
      player.setTexture(playerTextureKey(scene, GameState.player.characterId, facing, 0));
      this.deps.interactNpc(npc);
      return false;
    }

    callbacks.setMoving(true);
    let frame = 0;
    const walkAnim = scene.time.addEvent({
      delay: moveDuration / 2, repeat: 3,
      callback: () => { frame = 1 - frame; player.setTexture(playerTextureKey(scene, GameState.player.characterId, facing, frame)); },
    });

    scene.tweens.add({
      targets: player,
      x: nx * TILE_SIZE + TILE_SIZE / 2,
      y: ny * TILE_SIZE + TILE_SIZE / 2,
      duration: moveDuration,
      onUpdate: () => {
        playerShadow.x = player.x;
        playerShadow.y = player.y + 6;
      },
      onComplete: () => {
        walkAnim.destroy();
        player.setTexture(playerTextureKey(scene, GameState.player.characterId, facing, 0));
        playerShadow.x = player.x;
        playerShadow.y = player.y + 6;
        GameState.player.x = nx;
        GameState.player.y = ny;
        callbacks.setMoving(false);

        const landedTile = getTile(map, nx, ny);
        if (landedTile === 2) {
          Sfx.footstepGrass();
          this.spawnWalkFx(player.x, player.y, 0x4ade80, true);
        } else if (landedTile === 0 || landedTile === 1) {
          Sfx.footstepPath();
          if (landedTile === 1) this.spawnWalkFx(player.x, player.y, 0xc4a574);
        }

        const warp = isWarpTile(map, nx, ny);
        if (warp) {
          if (!warpGateAllowed(warp, GameState.player.badges, GameState.player.storyFlags)) {
            showWarpBlocked({
              dialog,
              getPlayer: () => callbacks.getPlayer(),
              getPlayerShadow: () => callbacks.getPlayerShadow(),
              setInputLocked: (locked) => callbacks.setInputLocked(locked),
            }, warp, dx, dy);
            return;
          }
          this.changeMap(warp.toMap, warp.toX, warp.toY);
          return;
        }

        if (isEncounterTile(tile) && Math.random() < map.encounterRate) {
          this.startWildBattle();
        }
      },
    });
    return true;
  }

  private spawnWalkFx(x: number, y: number, color: number, tallGrass = false): void {
    const { scene } = this.deps;
    const count = tallGrass ? 5 : 4;
    const baseSize = tallGrass ? 4 : 3;
    for (let i = 0; i < count; i++) {
      const p = scene.add.graphics().setDepth(11);
      p.fillStyle(color, tallGrass ? 0.55 : 0.45);
      const ox = (i - count / 2) * 3 + (Math.random() * 2 - 1);
      p.fillCircle(ox, 4, baseSize - (i % 2));
      p.setPosition(x + ox, y);
      scene.time.delayedCall(i * 40, () => {
        scene.tweens.add({
          targets: p,
          alpha: 0,
          y: y - (tallGrass ? 10 : 7) - i,
          duration: tallGrass ? 320 : 280,
          onComplete: () => p.destroy(),
        });
      });
    }
  }

  changeMap(mapId: string, x: number, y: number): void {
    const { scene } = this.deps;
    if (mapId === 'heal_center') registerHealVisit(this.deps.getMap().id);
    registerMapVisit(GameState.player.visitedMaps, this.deps.getMap().id);
    GameState.player.mapId = mapId;
    GameState.player.x = x;
    GameState.player.y = y;
    registerMapVisit(GameState.player.visitedMaps, mapId);
    trySave(scene);
    wipeRestartScene(scene, { fromBattle: false });
  }

  startWildBattle(): void {
    const { dialog, callbacks } = this.deps;
    if (!firstAlive(GameState.player.party)) {
      dialog.show('All your critters fainted! Visit the Healing Center.', () => {
        callbacks.setInputLocked(false);
      });
      return;
    }

    const map = this.deps.getMap();
    const baseTable = map.encounterTable ?? map.id;
    const tableId = resolveEncounterTable(baseTable, GameState.player.playTime);
    const { def, level, heldItem } = pickWildFromTable(tableId, undefined, featuredSpeciesOfDay());
    registerSeen(GameState.player.dexSeen, def.id);
    const wild = createCritter(def.id, level, undefined, { shinyChance: shinyOddsFor(def.id) });
    if (heldItem) wild.heldItem = heldItem;
    this.deps.launchWildBattle([wild]);
  }
}
