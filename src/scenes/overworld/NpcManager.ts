import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import {
  getTile, isWalkable, isEncounterTile, isWarpTile,
  type MapNpc, type GameMap,
} from '../../data/maps';
import { pickWildFromTable, resolveEncounterTable } from '../../data/encounters';
import { hasBadge } from '../../data/badges';
import {
  GameState, healParty, firstAlive, createCritter, registerSeen, registerMapVisit,
} from '../../systems/stats';
import { trySave } from '../../utils/saveFeedback';
import { DialogBox } from '../../ui/DialogBox';
import { showToast } from '../../ui/mapBanner';
import { npcTextureKey, type NpcRole } from '../../utils/assetLoader';
import { playerTextureKey } from '../../utils/sprites';
import { showExclamationBubble } from '../TrainerIntroScene';
import { Sfx } from '../../utils/audio';
import { resolveRematch } from '../../data/rematches';
import {
  startEliteGauntlet, findGauntletNpc,
} from '../../systems/eliteGauntlet';
import { registerHealVisit } from '../../systems/healTravel';
import { wipeRestartScene } from '../../ui/transitions';
import { addItem } from '../../data/items';
import { playDayIndex } from '../../ui/minigameShell';
import { pendingDexMilestone, claimDexMilestone } from '../../systems/dexMilestones';
import { warpGateAllowed } from '../../systems/warpGates';
import { tryHandleMinigameNpc } from './MinigameNpcHandlers';
import { momDiscoverabilityLine, profDiscoverabilityLine } from '../../systems/regionDiscovery';
import { TrainerBattleHandler } from './TrainerBattleHandler';
import { showWarpBlocked } from './WarpBlockDialog';

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
  }

  spawnPlayer(): { player: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse } {
    const shadow = this.scene.add.ellipse(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2 + 6,
      10, 4, 0x000000, 0.25,
    ).setDepth(9);
    const player = this.scene.add.sprite(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2,
      playerTextureKey(this.scene, GameState.player.characterId, GameState.player.facing, 0),
    ).setDepth(10);
    return { player, shadow };
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

  tryMove(dx: number, dy: number): boolean {
    const map = this.getMap();
    const player = this.callbacks.getPlayer();
    const playerShadow = this.callbacks.getPlayerShadow();
    const moveDuration = this.callbacks.getMoveDuration();

    const facing = dx === -1 ? 'left' : dx === 1 ? 'right' : dy === -1 ? 'up' : 'down';
    GameState.player.facing = facing;
    const nx = GameState.player.x + dx;
    const ny = GameState.player.y + dy;
    const tile = getTile(map, nx, ny);

    if (!isWalkable(tile)) {
      player.setTexture(playerTextureKey(this.scene, GameState.player.characterId, facing, 0));
      return false;
    }

    const npc = map.npcs.find(n => n.x === nx && n.y === ny);
    if (npc) {
      player.setTexture(playerTextureKey(this.scene, GameState.player.characterId, facing, 0));
      this.interactNpc(npc);
      return false;
    }

    this.callbacks.setMoving(true);
    let frame = 0;
    const walkAnim = this.scene.time.addEvent({
      delay: moveDuration / 2, repeat: 3,
      callback: () => { frame = 1 - frame; player.setTexture(playerTextureKey(this.scene, GameState.player.characterId, facing, frame)); },
    });

    this.scene.tweens.add({
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
        player.setTexture(playerTextureKey(this.scene, GameState.player.characterId, facing, 0));
        playerShadow.x = player.x;
        playerShadow.y = player.y + 6;
        GameState.player.x = nx;
        GameState.player.y = ny;
        this.callbacks.setMoving(false);

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
              dialog: this.dialog,
              getPlayer: () => this.callbacks.getPlayer(),
              getPlayerShadow: () => this.callbacks.getPlayerShadow(),
              setInputLocked: (locked) => this.callbacks.setInputLocked(locked),
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
    const count = tallGrass ? 5 : 4;
    const baseSize = tallGrass ? 4 : 3;
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.graphics().setDepth(11);
      p.fillStyle(color, tallGrass ? 0.55 : 0.45);
      const ox = (i - count / 2) * 3 + (Math.random() * 2 - 1);
      p.fillCircle(ox, 4, baseSize - (i % 2));
      p.setPosition(x + ox, y);
      this.scene.time.delayedCall(i * 40, () => {
        this.scene.tweens.add({
          targets: p,
          alpha: 0,
          y: y - (tallGrass ? 10 : 7) - i,
          duration: tallGrass ? 320 : 280,
          onComplete: () => p.destroy(),
        });
      });
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
      if (sign) {
        this.interactNpc(sign);
      } else {
        this.callbacks.setInputLocked(true);
        this.dialog.show('...', () => { this.callbacks.setInputLocked(false); });
      }
    }
  }

  interactNpc(npc: MapNpc): void {
    this.callbacks.setInputLocked(true);

    if (npc.gate && !this.gateOpen(npc)) {
      this.dialog.show(npc.gate!.blockLines, () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (npc.id === 'elite_registrar') {
      if (GameState.player.storyFlags.champion) {
        this.dialog.show(['You are the regional Champion!', 'Congratulations again!'], () => {
          this.callbacks.setInputLocked(false);
        });
        return;
      }
      if (!GameState.player.badges.includes('psyche')) {
        this.dialog.show(['Earn the Psyche Badge before challenging the Elite Four.'], () => {
          this.callbacks.setInputLocked(false);
        });
        return;
      }
      this.dialog.show(npc.lines, () => {
        startEliteGauntlet();
        const first = findGauntletNpc('elite_trainer1');
        if (first) {
          showExclamationBubble(this.scene, first.x * TILE_SIZE + 8, first.y * TILE_SIZE, () => {
            this.trainerBattles.launchGauntletBattle(first);
          });
        } else {
          this.callbacks.setInputLocked(false);
        }
      });
      return;
    }

    const defeated = GameState.player.defeatedTrainers.includes(npc.id);
    const rematched = GameState.player.defeatedRematch.includes(npc.id);
    const rematchDef = resolveRematch(npc.id, npc.rematch);
    const champion = GameState.player.storyFlags.champion;

    if (champion && rematchDef && defeated && !rematched && npc.trainer) {
      this.dialog.show(['Want a rematch? I\'ve gotten stronger!'], () => {
        this.trainerBattles.startTrainerBattle(npc, true);
      });
      return;
    }

    if (npc.trainer && !defeated) {
      this.dialog.show(npc.lines, () => {
        if (npc.trainer) {
          this.trainerBattles.promptTrainerBattle(npc);
        } else {
          this.callbacks.setInputLocked(false);
        }
      });
      return;
    }

    if (defeated && npc.trainer) {
      const lines = rematched
        ? ['You beat me again!', 'I\'ll keep training for next time.']
        : ['You already defeated me!', 'Keep training!'];
      this.dialog.show(lines, () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (tryHandleMinigameNpc(npc, {
      scene: this.scene,
      dialog: this.dialog,
      getMap: () => this.getMap(),
      unlockInput: () => { this.callbacks.setInputLocked(false); },
    })) return;

    if (npc.lines.includes('HEAL')) {
      const welcome = npc.lines.filter(l => l !== 'HEAL');
      this.dialog.show(welcome, () => {
        healParty(GameState.player.party);
        Sfx.heal();
        trySave(this.scene);
        showToast(this.scene, 'Critters restored to full health!');
        this.dialog.show('We hope to see you again!', () => { this.callbacks.setInputLocked(false); });
      });
      return;
    }

    if (npc.lines.includes('SHOP')) {
      this.scene.scene.launch('Shop', { returnMap: this.getMap().id });
      this.scene.scene.pause();
      this.callbacks.setInputLocked(false);
      return;
    }

    if (npc.lines.includes('PC')) {
      this.scene.scene.launch('PC');
      this.scene.scene.pause();
      this.callbacks.setInputLocked(false);
      return;
    }

    if (npc.id === 'mom') {
      const day = playDayIndex(GameState.player.playTime);
      const lines = [...this.getMomLines()];
      const hint = momDiscoverabilityLine(GameState.player);
      if (hint) lines.push(hint);
      if (GameState.player.lastMomGiftDay !== day) {
        GameState.player.lastMomGiftDay = day;
        const gift = Math.random() < 0.5 ? 'potion' : 'oran_berry';
        addItem(GameState.player.items, gift, 1);
        lines.unshift(gift === 'potion'
          ? 'I packed a fresh Potion for you today!'
          : 'I picked an Oran Berry from the garden for you!');
        trySave(this.scene);
      }
      this.dialog.show(lines, () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (npc.id === 'prof') {
      const milestone = pendingDexMilestone(GameState.player);
      if (milestone) {
        claimDexMilestone(GameState.player, milestone);
        trySave(this.scene);
        this.dialog.show(milestone.lines, () => { this.callbacks.setInputLocked(false); });
        return;
      }
      const hint = profDiscoverabilityLine(GameState.player);
      if (hint) {
        this.dialog.show([hint, 'Keep exploring — the region has secrets!'], () => {
          this.callbacks.setInputLocked(false);
        });
        return;
      }
    }

    if (npc.id === 'prof' && GameState.player.storyFlags.contest_winner) {
      this.dialog.show([
        `${GameState.player.name}! I heard you won the Critter Contest!`,
        'The whole region is proud of you.',
      ], () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (npc.id === 'prof' && GameState.player.storyFlags.champion) {
      const signs = GameState.player.signsRead;
      const extra = signs >= 20
        ? 'You\'ve read every sign in the region — impressive!'
        : signs >= 10
          ? `${signs} signs read — you really explore!`
          : '';
      this.dialog.show([
        `${GameState.player.name}! The whole region is talking about you!`,
        'Champion of Verdant — you make me proud.',
        extra || 'Trainers across the region want rematches now.',
      ], () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (npc.role === 'sign' || npc.id.startsWith('sign')) {
      GameState.player.signsRead++;
      trySave(this.scene);
    }

    this.dialog.show(npc.lines, () => { this.callbacks.setInputLocked(false); });
  }

  private changeMap(mapId: string, x: number, y: number): void {
    if (mapId === 'heal_center') registerHealVisit(this.getMap().id);
    registerMapVisit(GameState.player.visitedMaps, this.getMap().id);
    GameState.player.mapId = mapId;
    GameState.player.x = x;
    GameState.player.y = y;
    registerMapVisit(GameState.player.visitedMaps, mapId);
    trySave(this.scene);
    wipeRestartScene(this.scene, { fromBattle: false });
  }

  private startWildBattle(): void {
    if (!firstAlive(GameState.player.party)) {
      this.dialog.show('All your critters fainted! Visit the Healing Center.', () => {
        this.callbacks.setInputLocked(false);
      });
      return;
    }

    const map = this.getMap();
    const baseTable = map.encounterTable ?? map.id;
    const tableId = resolveEncounterTable(baseTable, GameState.player.playTime);
    const { def, level, heldItem } = pickWildFromTable(tableId);
    registerSeen(GameState.player.dexSeen, def.id);
    const wild = createCritter(def.id, level);
    if (heldItem) wild.heldItem = heldItem;
    this.trainerBattles.launchBattle([wild], false, '', '', 0, '');
  }

  private getMomLines(): string[] {
    const p = GameState.player;
    if (p.storyFlags.champion) {
      return ['My champion!', 'I always knew you could do it!', 'Come home anytime for a rest.'];
    }
    if (p.badges.length >= 2) {
      return ['Both badges!', 'Kai keeps asking about you.', 'Be careful on Volcanic Path!'];
    }
    if (p.badges.length >= 1) {
      return ['You earned a badge!', 'Ember City is to the east.', 'I believe in you!'];
    }
    if (p.defeatedTrainers.includes('rival')) {
      return ['You beat Kai!', 'Explore Route 1 and the forest.', 'Visit the Mart for supplies!'];
    }
    return ['Be careful out there!', 'Visit the Mart for supplies, and the Healing Center to rest.'];
  }

  private gateOpen(npc: MapNpc): boolean {
    const g = npc.gate!;
    if (g.requiresBadge && !hasBadge(GameState.player.badges, g.requiresBadge)) return false;
    if (g.requiresFlag && !GameState.player.storyFlags[g.requiresFlag]) return false;
    return true;
  }
}
