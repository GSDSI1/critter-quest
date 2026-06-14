import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import { getTile, type MapNpc, type GameMap } from '../../data/maps';
import { GameState } from '../../systems/stats';
import { DialogBox } from '../../ui/DialogBox';
import { npcTextureKey, type NpcRole } from '../../utils/assetLoader';
import { NPC_SPRITE_TINTS } from '../../data/npcDialogs';
import { TrainerBattleHandler } from './TrainerBattleHandler';
import { PlayerMovement } from './PlayerMovement';
import { handleNpcInteraction, showGenericSign } from './npcInteractRouter';

export interface NpcManagerCallbacks {
  setInputLocked: (locked: boolean) => void;
  setMoving: (moving: boolean) => void;
  getMoveDuration: () => number;
  getPlayer: () => Phaser.GameObjects.Sprite;
  getPlayerShadow: () => Phaser.GameObjects.Ellipse;
}

export class NpcManager {
  private npcSprites: Phaser.GameObjects.Sprite[] = [];
  private trainerBattles: TrainerBattleHandler;
  private movement: PlayerMovement;

  constructor(
    private scene: Phaser.Scene,
    private getMap: () => GameMap,
    private dialog: DialogBox,
    private callbacks: NpcManagerCallbacks,
  ) {
    this.trainerBattles = new TrainerBattleHandler(
      scene,
      () => this.getMap(),
      (locked) => this.callbacks.setInputLocked(locked),
    );
    this.movement = new PlayerMovement({
      scene,
      getMap: () => this.getMap(),
      dialog,
      callbacks,
      interactNpc: (npc) => this.interactNpc(npc),
      launchWildBattle: (party) => this.trainerBattles.launchWildBattle(party),
    });
  }

  spawnPlayer(): { player: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse } {
    return this.movement.spawnPlayer();
  }

  tryMove(dx: number, dy: number): boolean {
    return this.movement.tryMove(dx, dy);
  }

  spawnNpcs(map: GameMap): void {
    this.npcSprites = [];
    for (const npc of map.npcs) {
      if (npc.role === 'sign' || npc.id.startsWith('sign')) continue;
      const role = (npc.role ?? 'generic') as NpcRole;
      const spr = this.scene.add.sprite(
        npc.x * TILE_SIZE + TILE_SIZE / 2,
        npc.y * TILE_SIZE + TILE_SIZE / 2,
        npcTextureKey(this.scene, role),
      ).setDepth(9).setScale(1);
      const tint = NPC_SPRITE_TINTS[npc.id];
      if (tint != null) spr.setTint(tint);
      this.npcSprites.push(spr);
      if (!npc.trainer && role !== 'rival' && role !== 'leader') {
        this.scene.time.addEvent({
          delay: 2500 + Math.random() * 3500,
          loop: true,
          callback: () => { if (spr.active) spr.setFlipX(Math.random() > 0.5); },
        });
        this.scene.tweens.add({
          targets: spr, y: spr.y - 1, duration: 900 + Math.random() * 400,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      }
    }
  }

  spawnSigns(map: GameMap): void {
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (getTile(map, x, y) === 10) {
          this.scene.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'sign_post').setDepth(8);
        }
      }
    }
  }

  tryInteract(): void {
    const map = this.getMap();
    const f = GameState.player.facing;
    const dx = f === 'left' ? -1 : f === 'right' ? 1 : 0;
    const dy = f === 'up' ? -1 : f === 'down' ? 1 : 0;
    const tx = GameState.player.x + dx;
    const ty = GameState.player.y + dy;

    const npc = map.npcs.find(n => n.x === tx && n.y === ty);
    if (npc) {
      this.interactNpc(npc);
      return;
    }

    if (getTile(map, tx, ty) === 3 && (map.id === 'route3' || map.id === 'fishing_pier')) {
      if ((GameState.player.items.old_rod ?? 0) > 0 || GameState.player.storyFlags.fishing_unlocked) {
        this.callbacks.setInputLocked(true);
        this.scene.scene.launch('Fishing', { returnMap: map.id });
        this.scene.scene.pause();
        this.callbacks.setInputLocked(false);
        return;
      }
    }

    if (getTile(map, tx, ty) === 10) {
      const sign = map.npcs.find(n => n.x === tx && n.y === ty && (n.role === 'sign' || n.id.startsWith('sign')));
      if (sign) this.interactNpc(sign);
      else {
        this.callbacks.setInputLocked(true);
        showGenericSign(this.dialog, () => this.callbacks.setInputLocked(false));
      }
    }
  }

  interactNpc(npc: MapNpc): void {
    this.callbacks.setInputLocked(true);
    handleNpcInteraction(npc, {
      scene: this.scene,
      dialog: this.dialog,
      getMap: () => this.getMap(),
      unlockInput: () => this.callbacks.setInputLocked(false),
      trainerBattles: this.trainerBattles,
    });
  }
}
