import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import {
  getTile, isWalkable, isEncounterTile, isWarpTile,
  resolveTrainerParty, type MapNpc, type GameMap,
} from '../../data/maps';
import { pickWildFromTable, resolveEncounterTable } from '../../data/encounters';
import { hasBadge } from '../../data/badges';
import {
  GameState, healParty, firstAlive, createCritter, registerSeen,
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
  startEliteGauntlet, findGauntletNpc, buildTrainerBattleData, rematchLevelBonus,
} from '../../systems/eliteGauntlet';
import { registerHealVisit } from '../../systems/healTravel';

type Critter = ReturnType<typeof createCritter>;

export interface NpcManagerCallbacks {
  setInputLocked: (locked: boolean) => void;
  setMoving: (moving: boolean) => void;
  getMoveDuration: () => number;
  getPlayer: () => Phaser.GameObjects.Sprite;
  getPlayerShadow: () => Phaser.GameObjects.Ellipse;
}

export class NpcManager {
  private npcSprites: Phaser.GameObjects.Sprite[] = [];

  constructor(
    private scene: Phaser.Scene,
    private getMap: () => GameMap,
    private dialog: DialogBox,
    private callbacks: NpcManagerCallbacks,
  ) {}

  spawnPlayer(): { player: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Ellipse } {
    const shadow = this.scene.add.ellipse(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2 + 6,
      10, 4, 0x000000, 0.25,
    ).setDepth(9);
    const player = this.scene.add.sprite(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2,
      playerTextureKey(GameState.player.characterId, GameState.player.facing, 0),
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

  tryMove(dx: number, dy: number): void {
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
      player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
      return;
    }

    const npc = map.npcs.find(n => n.x === nx && n.y === ny);
    if (npc) {
      player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
      this.interactNpc(npc);
      return;
    }

    this.callbacks.setMoving(true);
    let frame = 0;
    const walkAnim = this.scene.time.addEvent({
      delay: moveDuration / 2, repeat: 3,
      callback: () => { frame = 1 - frame; player.setTexture(playerTextureKey(GameState.player.characterId, facing, frame)); },
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
        player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
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
          if (warp.requiresBadge && !hasBadge(GameState.player.badges, warp.requiresBadge)) {
            this.callbacks.setInputLocked(true);
            const msg = warp.requiresBadge === 'verdant'
              ? 'The path is blocked. Earn the Verdant Badge first!'
              : 'The path is blocked. Earn the Ember Badge first!';
            this.dialog.show(msg, () => {
              if (dy < 0) GameState.player.y++;
              else GameState.player.y--;
              player.y = GameState.player.y * TILE_SIZE + TILE_SIZE / 2;
              this.callbacks.setInputLocked(false);
            });
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
            this.launchGauntletBattle(first);
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
        this.startTrainerBattle(npc, true);
      });
      return;
    }

    if (npc.trainer && !defeated) {
      this.dialog.show(npc.lines, () => {
        if (npc.trainer) {
          showExclamationBubble(this.scene, npc.x * TILE_SIZE + 8, npc.y * TILE_SIZE, () => {
            this.startTrainerBattle(npc, false);
          });
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
      this.dialog.show(this.getMomLines(), () => { this.callbacks.setInputLocked(false); });
      return;
    }

    if (npc.id === 'prof' && GameState.player.storyFlags.champion) {
      this.dialog.show([
        `${GameState.player.name}! The whole region is talking about you!`,
        'Champion of Verdant — you make me proud.',
        'Trainers across the region want rematches now. Visit anyone you\'ve beaten!',
      ], () => { this.callbacks.setInputLocked(false); });
      return;
    }

    this.dialog.show(npc.lines, () => { this.callbacks.setInputLocked(false); });
  }

  private changeMap(mapId: string, x: number, y: number): void {
    if (mapId === 'heal_center') registerHealVisit(this.getMap().id);
    GameState.player.mapId = mapId;
    GameState.player.x = x;
    GameState.player.y = y;
    trySave(this.scene);
    this.scene.scene.restart({ fromBattle: false });
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
    const { def, level } = pickWildFromTable(tableId);
    registerSeen(GameState.player.dexSeen, def.id);
    const wild = createCritter(def.id, level);
    this.launchBattle([wild], false, '', '', 0, '');
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

  private startTrainerBattle(npc: MapNpc, isRematch: boolean): void {
    if (!npc.trainer) { this.callbacks.setInputLocked(false); return; }
    const rematchDef = isRematch ? resolveRematch(npc.id, npc.rematch) : undefined;
    const partySpec = rematchDef?.party ?? npc.trainer.party;
    const reward = rematchDef?.reward ?? npc.trainer.reward;
    const resolved = resolveTrainerParty(partySpec, GameState.player.starterId);
    const bonus = isRematch ? rematchLevelBonus() : 0;
    const party = resolved.map(m => {
      registerSeen(GameState.player.dexSeen, m.creatureId);
      return createCritter(m.creatureId, m.level + bonus);
    });
    this.launchBattle(party, true, npc.id, npc.name, reward, npc.trainer.badge ?? '', isRematch);
  }

  private launchGauntletBattle(npc: MapNpc): void {
    const battleData = buildTrainerBattleData(npc);
    if (!battleData) { this.callbacks.setInputLocked(false); return; }
    this.callbacks.setInputLocked(true);
    this.scene.cameras.main.flash(200, 255, 255, 255);
    this.scene.time.delayedCall(300, () => {
      this.scene.scene.start('TrainerIntro', {
        trainerName: npc.name,
        isTrainer: true,
        battleData,
      });
    });
  }

  private launchBattle(
    enemyParty: Critter[],
    isTrainer: boolean,
    trainerId: string,
    trainerName: string,
    reward: number,
    badge: string,
    isRematch = false,
  ): void {
    this.callbacks.setInputLocked(true);
    this.scene.cameras.main.flash(200, 255, 255, 255);

    const battleData = {
      enemyParty,
      isTrainer,
      trainerId,
      trainerName,
      reward,
      badge,
      isRematch,
      mapId: this.getMap().id,
    };

    this.scene.time.delayedCall(300, () => {
      this.scene.scene.start('TrainerIntro', {
        trainerName: isTrainer ? trainerName : 'Wild',
        isTrainer,
        battleData,
      });
    });
  }
}
