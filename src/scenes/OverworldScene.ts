import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import {
  getMap, isWalkable, isEncounterTile, isWarpTile, getTile,
  resolveTrainerParty, type MapNpc, type GameMap,
} from '../data/maps';
import { pickWildFromTable } from '../data/encounters';
import { hasBadge } from '../data/badges';
import {
  GameState, healParty, firstAlive, createCritter, registerSeen,
} from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { DialogBox } from '../ui/DialogBox';
import { ControlsPanel } from '../ui/ControlsPanel';
import { OverworldHUD } from '../ui/HUD';
import { showMapBannerForCurrentMap, showToast } from '../ui/mapBanner';
import { OverworldTouchPad } from '../ui/touchButtons';
import { pinToScreen } from '../ui/screenUi';
import { npcTextureKey, isExternalTilesetAvailable, type NpcRole } from '../utils/assetLoader';
import { applyOverworldCamera, isSmallInterior } from '../utils/camera';
import { tileTextureKey, playerTextureKey } from '../utils/sprites';
import { showExclamationBubble } from './TrainerIntroScene';
import { Sfx, resumeAudio } from '../utils/audio';
import { Input } from '../systems/input';

export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private map!: GameMap;
  private tileLayer!: Phaser.GameObjects.Container;
  private decorLayer!: Phaser.GameObjects.Container;
  private dialog!: DialogBox;
  private controlsPanel!: ControlsPanel;
  private hud!: OverworldHUD;
  private inputHint!: Phaser.GameObjects.Text;
  private moving = false;
  private inputLocked = false;
  private moveDuration = 200;
  private padToast?: Phaser.GameObjects.Text;
  private touchPad?: OverworldTouchPad;
  private animTiles: { img: Phaser.GameObjects.Image; tile: number }[] = [];
  private animFrame = 0;
  private animTimer = 0;

  constructor() {
    super('Overworld');
  }

  create(data: { showIntro?: boolean; fromBattle?: boolean; blackout?: boolean }): void {
    resumeAudio();
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

    this.touchPad = new OverworldTouchPad(
      this,
      (dx, dy) => this.tryMove(dx, dy),
      () => this.tryInteract(),
      () => { this.scene.launch('PauseMenu'); this.scene.pause(); },
    );

    this.renderMap();
    this.spawnPlayer();
    this.spawnNpcs();
    this.spawnSigns();

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

    this.animTimer += delta;
    if (this.animTimer >= 500) {
      this.animTimer = 0;
      this.animFrame = 1 - this.animFrame;
      const theme = this.map.mapTheme;
      for (const { img, tile } of this.animTiles) {
        img.setTexture(tileTextureKey(tile, theme, this.animFrame));
      }
    }

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
      this.tryInteract();
      return;
    }

    const canRun = GameState.player.storyFlags.running;
    const running = canRun && Input.isHeld('run');
    this.moveDuration = running ? 100 : 200;

    const { dx, dy } = Input.getMovement();
    if (dx !== 0 || dy !== 0) this.tryMove(dx, dy);
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

  private renderMap(): void {
    if (this.tileLayer) this.tileLayer.destroy();
    if (this.decorLayer) this.decorLayer.destroy();
    this.animTiles = [];
    this.tileLayer = this.add.container(0, 0);
    this.decorLayer = this.add.container(0, 0).setDepth(6);

    if (isExternalTilesetAvailable(this)) {
      const data: number[][] = [];
      for (let y = 0; y < this.map.height; y++) {
        data[y] = [];
        for (let x = 0; x < this.map.width; x++) {
          data[y][x] = getTile(this.map, x, y);
        }
      }
      const tm = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
      const tileset = tm.addTilesetImage('tileset', 'ext_tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0);
      if (tileset) {
        tm.createLayer(0, tileset, 0, 0)?.setDepth(0);
        this.renderDecorations();
        return;
      }
    }

    const theme = this.map.mapTheme;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = getTile(this.map, x, y);
        const key = tileTextureKey(tile, theme, 0);
        const img = this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, key);
        this.tileLayer.add(img);
        if (tile === 2 || tile === 3) this.animTiles.push({ img, tile });
      }
    }
    this.renderEdgeOverlays();
    this.renderDecorations();
  }

  private renderEdgeOverlays(): void {
    const edgeGfx = this.add.graphics().setDepth(1);
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = getTile(this.map, x, y);
        if (tile !== 0 && tile !== 1) continue;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const n = [
          getTile(this.map, x, y - 1),
          getTile(this.map, x + 1, y),
          getTile(this.map, x, y + 1),
          getTile(this.map, x - 1, y),
        ];
        if (tile === 0) {
          edgeGfx.fillStyle(0x2d6b27, 0.35);
          if (n[0] === 1) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 1) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 1) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 1) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
        } else {
          edgeGfx.fillStyle(0x3d8b37, 0.25);
          if (n[0] === 0) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 0) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 0) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 0) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
        }
      }
    }
    this.tileLayer.add(edgeGfx);
  }

  private renderDecorations(): void {
    if (!isSmallInterior(this.map)) return;
    for (let x = 1; x < this.map.width - 1; x++) {
      if (getTile(this.map, x, 1) === 6) {
        this.decorLayer.add(
          this.add.image(x * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE + 2, 'decor_light'),
        );
      }
    }
    const corners = [
      { x: 1, y: 5 },
      { x: this.map.width - 2, y: 5 },
    ];
    for (const c of corners) {
      if (getTile(this.map, c.x, c.y) === 6) {
        this.decorLayer.add(
          this.add.image(c.x * TILE_SIZE + TILE_SIZE / 2, c.y * TILE_SIZE + TILE_SIZE / 2, 'decor_plant'),
        );
      }
    }
    if (this.map.mapTheme === 'lab' && this.map.width > 7) {
      this.decorLayer.add(
        this.add.image(7 * TILE_SIZE + TILE_SIZE / 2, 5 * TILE_SIZE + TILE_SIZE / 2, 'decor_poster'),
      );
    }
  }

  private spawnPlayer(): void {
    this.playerShadow = this.add.ellipse(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2 + 6,
      10, 4, 0x000000, 0.25,
    ).setDepth(9);
    this.player = this.add.sprite(
      GameState.player.x * TILE_SIZE + TILE_SIZE / 2,
      GameState.player.y * TILE_SIZE + TILE_SIZE / 2,
      playerTextureKey(GameState.player.characterId, GameState.player.facing, 0),
    ).setDepth(10);
  }

  private spawnNpcs(): void {
    for (const npc of this.map.npcs) {
      if (npc.role === 'sign' || npc.id.startsWith('sign')) continue;
      const role = (npc.role ?? 'generic') as NpcRole;
      this.add.sprite(
        npc.x * TILE_SIZE + TILE_SIZE / 2,
        npc.y * TILE_SIZE + TILE_SIZE / 2,
        npcTextureKey(this, role),
      ).setDepth(9).setScale(0.5);
    }
  }

  private spawnSigns(): void {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (getTile(this.map, x, y) === 10) {
          this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 'sign_post').setDepth(8);
        }
      }
    }
  }

  private tryMove(dx: number, dy: number): void {
    const facing = dx === -1 ? 'left' : dx === 1 ? 'right' : dy === -1 ? 'up' : 'down';
    GameState.player.facing = facing;
    const nx = GameState.player.x + dx;
    const ny = GameState.player.y + dy;
    const tile = getTile(this.map, nx, ny);

    if (!isWalkable(tile)) {
      this.player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
      return;
    }

    const npc = this.map.npcs.find(n => n.x === nx && n.y === ny);
    if (npc) {
      this.player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
      this.interactNpc(npc);
      return;
    }

    this.moving = true;
    let frame = 0;
    const walkAnim = this.time.addEvent({
      delay: this.moveDuration / 2, repeat: 3,
      callback: () => { frame = 1 - frame; this.player.setTexture(playerTextureKey(GameState.player.characterId, facing, frame)); },
    });

    this.tweens.add({
      targets: this.player,
      x: nx * TILE_SIZE + TILE_SIZE / 2,
      y: ny * TILE_SIZE + TILE_SIZE / 2,
      duration: this.moveDuration,
      onUpdate: () => {
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.player.y + 6;
      },
      onComplete: () => {
        walkAnim.destroy();
        this.player.setTexture(playerTextureKey(GameState.player.characterId, facing, 0));
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.player.y + 6;
        GameState.player.x = nx;
        GameState.player.y = ny;
        this.moving = false;

        const landedTile = getTile(this.map, nx, ny);
        if (landedTile === 2) Sfx.footstepGrass();
        else if (landedTile === 0 || landedTile === 1) Sfx.footstepPath();

        const warp = isWarpTile(this.map, nx, ny);
        if (warp) {
          if (warp.requiresBadge && !hasBadge(GameState.player.badges, warp.requiresBadge)) {
            this.inputLocked = true;
            const msg = warp.requiresBadge === 'verdant'
              ? 'The path is blocked. Earn the Verdant Badge first!'
              : 'The path is blocked. Earn the Ember Badge first!';
            this.dialog.show(msg, () => {
              if (dy < 0) GameState.player.y++;
              else GameState.player.y--;
              this.player.y = GameState.player.y * TILE_SIZE + TILE_SIZE / 2;
              this.inputLocked = false;
            });
            return;
          }
          this.changeMap(warp.toMap, warp.toX, warp.toY);
          return;
        }

        if (isEncounterTile(tile) && Math.random() < this.map.encounterRate) {
          this.startWildBattle();
        }
      },
    });
  }

  private changeMap(mapId: string, x: number, y: number): void {
    GameState.player.mapId = mapId;
    GameState.player.x = x;
    GameState.player.y = y;
    trySave(this);
    this.scene.restart({ fromBattle: false });
  }

  private tryInteract(): void {
    const f = GameState.player.facing;
    const dx = f === 'left' ? -1 : f === 'right' ? 1 : 0;
    const dy = f === 'up' ? -1 : f === 'down' ? 1 : 0;
    const tx = GameState.player.x + dx;
    const ty = GameState.player.y + dy;

    const npc = this.map.npcs.find(n => n.x === tx && n.y === ty);
    if (npc) {
      this.interactNpc(npc);
      return;
    }

    if (getTile(this.map, tx, ty) === 10) {
      const sign = this.map.npcs.find(n => n.x === tx && n.y === ty && (n.role === 'sign' || n.id.startsWith('sign')));
      if (sign) {
        this.interactNpc(sign);
      } else {
        this.inputLocked = true;
        this.dialog.show('...', () => { this.inputLocked = false; });
      }
    }
  }

  private interactNpc(npc: MapNpc): void {
    this.inputLocked = true;

    if (npc.gate && !this.gateOpen(npc)) {
      this.dialog.show(npc.gate!.blockLines, () => { this.inputLocked = false; });
      return;
    }

    const defeated = GameState.player.defeatedTrainers.includes(npc.id);
    const rematched = GameState.player.defeatedRematch.includes(npc.id);

    if (npc.rematch && defeated && !rematched) {
      this.dialog.show(['Want a rematch? I\'ve gotten stronger!'], () => {
        this.startTrainerBattle(npc, true);
      });
      return;
    }

    if (npc.trainer && !defeated) {
      this.dialog.show(npc.lines, () => {
        if (npc.trainer) {
          showExclamationBubble(this, npc.x * TILE_SIZE + 8, npc.y * TILE_SIZE, () => {
            this.startTrainerBattle(npc, false);
          });
        } else {
          this.inputLocked = false;
        }
      });
      return;
    }

    if (defeated && npc.trainer) {
      this.dialog.show(['You already defeated me!', 'Keep training!'], () => { this.inputLocked = false; });
      return;
    }

    if (npc.lines.includes('HEAL')) {
      const welcome = npc.lines.filter(l => l !== 'HEAL');
      this.dialog.show(welcome, () => {
        healParty(GameState.player.party);
        Sfx.heal();
        trySave(this);
        showToast(this, 'Critters restored to full health!');
        this.dialog.show('We hope to see you again!', () => { this.inputLocked = false; });
      });
      return;
    }

    if (npc.lines.includes('SHOP')) {
      this.scene.launch('Shop', { returnMap: this.map.id });
      this.scene.pause();
      this.inputLocked = false;
      return;
    }

    if (npc.lines.includes('PC')) {
      this.scene.launch('PC');
      this.scene.pause();
      this.inputLocked = false;
      return;
    }

    if (npc.id === 'mom') {
      this.dialog.show(this.getMomLines(), () => { this.inputLocked = false; });
      return;
    }

    if (npc.id === 'prof' && GameState.player.storyFlags.champion) {
      this.dialog.show([
        `${GameState.player.name}! The whole region is talking about you!`,
        'Champion of Verdant — you make me proud.',
        'Keep training. Who knows what adventures await?',
      ], () => { this.inputLocked = false; });
      return;
    }

    this.dialog.show(npc.lines, () => { this.inputLocked = false; });
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

  private startWildBattle(): void {
    if (!firstAlive(GameState.player.party)) {
      this.dialog.show('All your critters fainted! Visit the Healing Center.', () => {
        this.inputLocked = false;
      });
      return;
    }

    const tableId = this.map.encounterTable ?? this.map.id;
    const { def, level } = pickWildFromTable(tableId);
    registerSeen(GameState.player.dexSeen, def.id);
    const wild = createCritter(def.id, level);
    this.launchBattle([wild], false, '', '', 0, '');
  }

  private startTrainerBattle(npc: MapNpc, isRematch: boolean): void {
    if (!npc.trainer) { this.inputLocked = false; return; }
    const partySpec = isRematch && npc.rematch ? npc.rematch.party : npc.trainer.party;
    const reward = isRematch && npc.rematch ? npc.rematch.reward : npc.trainer.reward;
    const resolved = resolveTrainerParty(partySpec, GameState.player.starterId);
    const party = resolved.map(m => {
      registerSeen(GameState.player.dexSeen, m.creatureId);
      return createCritter(m.creatureId, m.level);
    });
    this.launchBattle(party, true, npc.id, npc.name, reward, npc.trainer.badge ?? '', isRematch);
  }

  private launchBattle(
    enemyParty: ReturnType<typeof createCritter>[],
    isTrainer: boolean,
    trainerId: string,
    trainerName: string,
    reward: number,
    badge: string,
    isRematch = false,
  ): void {
    this.inputLocked = true;
    this.cameras.main.flash(200, 255, 255, 255);

    const battleData = {
      enemyParty,
      isTrainer,
      trainerId,
      trainerName,
      reward,
      badge,
      isRematch,
      mapId: this.map.id,
    };

    this.time.delayedCall(300, () => {
      this.scene.start('TrainerIntro', {
        trainerName: isTrainer ? trainerName : 'Wild',
        isTrainer,
        battleData,
      });
    });
  }
}
