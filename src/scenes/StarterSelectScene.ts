import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, TYPE_NAMES, TYPE_COLORS, type ElementType } from '../data/types';
import { STARTERS, getCreature } from '../data/creatures';
import { GameState, createCritter, registerSeen, registerCaught } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { addCreatureImage, applyCreatureTexture } from '../utils/assetLoader';
import { fadeToScene, fadeInOnStart } from '../ui/transitions';
import { playerTextureKey } from '../utils/sprites';
import { buildMenuPanel } from '../ui/sceneBackdrops';
import { createTouchButton, createTypePill } from '../ui/touchButtons';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { DialogBox } from '../ui/DialogBox';
import { addItem } from '../data/items';

const ORB_TYPES = ['flame', 'tide', 'leaf'] as const;

const LAYOUT = {
  panel: { x: 100, y: 48, w: 440, h: 228 },
  nameY: 62,
  spriteY: 130,
  statsY: 188,
  descY: 206,
  orbY: 296,
  orbX: [200, 320, 440] as const,
  pillY: 44,
  btnY: 400,
  trainerX: 520,
  trainerY: 52,
} as const;

const PANEL_CX = LAYOUT.panel.x + LAYOUT.panel.w / 2;

export class StarterSelectScene extends Phaser.Scene {
  private selected = 0;
  private orbs: Phaser.GameObjects.Container[] = [];
  private typePills: Phaser.GameObjects.Container[] = [];
  private introSprites: Phaser.GameObjects.Image[] = [];
  private statText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private creaturePreview!: Phaser.GameObjects.Image;
  private previewGlow!: Phaser.GameObjects.Graphics;
  private trainerChip!: Phaser.GameObjects.Container;
  private dialog!: DialogBox;
  private picking = false;
  private introShown = false;
  private prevBtn!: ReturnType<typeof createTouchButton>;
  private nextBtn!: ReturnType<typeof createTouchButton>;
  private chooseBtn!: ReturnType<typeof createTouchButton>;

  constructor() {
    super('StarterSelect');
  }

  create(): void {
    Input.bind(this);
    fadeInOnStart(this, this.scene.settings.data as { _fadeIn?: boolean });
    this.picking = false;
    this.introShown = false;
    this.selected = 0;

    this.add.image(GAME_WIDTH / 2, 240, 'starter_lab_bg').setDepth(-5);

    buildMenuPanel(this, LAYOUT.panel.x, LAYOUT.panel.y, LAYOUT.panel.w, LAYOUT.panel.h, 2);
    const inner = this.add.graphics().setDepth(2);
    inner.fillStyle(COLORS.panel, 0.92);
    inner.fillRoundedRect(
      LAYOUT.panel.x + 8,
      LAYOUT.panel.y + 8,
      LAYOUT.panel.w - 16,
      LAYOUT.panel.h - 16,
      10,
    );

    this.previewGlow = this.add.graphics().setDepth(3);
    this.creaturePreview = addCreatureImage(this, PANEL_CX, LAYOUT.spriteY, STARTERS[0])
      .setScale(2).setVisible(false).setDepth(5);
    this.tweens.add({
      targets: this.creaturePreview,
      y: LAYOUT.spriteY - 4,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.nameText = this.add.text(PANEL_CX, LAYOUT.nameY, 'Choose your partner!', {
      fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f5c542', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    this.statText = this.add.text(PANEL_CX, LAYOUT.statsY, '', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#c0c0c0',
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this.descText = this.add.text(PANEL_CX, LAYOUT.descY, 'Listen to Prof. Elmwood, then pick an orb.', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
      wordWrap: { width: 280 }, align: 'center',
    }).setOrigin(0.5).setDepth(6);

    STARTERS.forEach((id, i) => {
      const spr = addCreatureImage(this, LAYOUT.orbX[i], LAYOUT.spriteY, id)
        .setScale(1.5).setDepth(5);
      this.introSprites.push(spr);
      this.tweens.add({
        targets: spr,
        y: LAYOUT.spriteY - 4,
        duration: 900 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });

    this.trainerChip = buildTrainerChip(this);
    this.trainerChip.setVisible(false);

    STARTERS.forEach((id, i) => {
      const x = LAYOUT.orbX[i];
      const container = this.add.container(x, LAYOUT.orbY).setDepth(7);

      const glow = this.add.graphics();
      glow.fillStyle([0xff6b35, 0x3b82f6, 0x22c55e][i], 0.15);
      glow.fillCircle(0, -4, 40);

      const orb = this.add.image(0, -8, `starter_orb_${ORB_TYPES[i]}`).setScale(1);
      const ring = this.add.graphics();

      const def = getCreature(id);
      const pill = createTypePill(
        this, 0, LAYOUT.pillY, TYPE_NAMES[def.types[0]], TYPE_COLORS[def.types[0] as ElementType], false,
      );
      this.typePills.push(pill);

      container.add([glow, orb, ring, pill]);
      container.setSize(80, 88);
      container.setInteractive(new Phaser.Geom.Circle(0, -4, 38), Phaser.Geom.Circle.Contains);
      container.on('pointerdown', () => {
        if (!this.picking) return;
        this.selected = i;
        Sfx.menuSelect();
        this.refresh();
        this.confirm();
      });
      this.orbs.push(container);

      this.tweens.add({
        targets: glow, alpha: 0.05, duration: 900 + i * 200, yoyo: true, repeat: -1,
      });
    });

    this.dialog = new DialogBox(this);

    this.prevBtn = createTouchButton(
      this, PANEL_CX - 130, LAYOUT.btnY, '◀ Prev', () => this.cycle(-1), { width: 90, depth: 50 },
    );
    this.chooseBtn = createTouchButton(
      this, PANEL_CX, LAYOUT.btnY, 'Choose!', () => this.confirm(), { width: 110, depth: 50 },
    );
    this.nextBtn = createTouchButton(
      this, PANEL_CX + 130, LAYOUT.btnY, 'Next ▶', () => this.cycle(1), { width: 90, depth: 50 },
    );
    this.setPickerButtons(false);

    this.dialog.show([
      'These three critters are ready for new trainers.',
      `${GameState.player.name}, step up to the table!`,
      'Tap an orb or use the buttons below to choose your partner!',
    ], () => {
      this.picking = true;
      this.introShown = true;
      this.introSprites.forEach(s => s.setVisible(false));
      this.trainerChip.setVisible(true);
      this.setPickerButtons(true);
      this.refresh();
    }, 'Prof. Elmwood');
  }

  update(): void {
    Input.update();
    if (this.dialog.isShowing()) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
      return;
    }
    if (!this.picking || !this.introShown) return;

    if (Input.justPressed('left')) this.cycle(-1);
    if (Input.justPressed('right')) this.cycle(1);
    if (Input.justPressed('confirm')) this.confirm();
  }

  private cycle(dir: number): void {
    this.selected = (this.selected + dir + 3) % 3;
    Sfx.menuSelect();
    this.refresh();
  }

  private setPickerButtons(on: boolean): void {
    this.prevBtn.setVisible(on);
    this.nextBtn.setVisible(on);
    this.chooseBtn.setVisible(on);
    this.prevBtn.setEnabled(on);
    this.nextBtn.setEnabled(on);
    this.chooseBtn.setEnabled(on);
  }

  private refresh(): void {
    if (!this.introShown) return;
    const id = STARTERS[this.selected];
    const def = getCreature(id);
    const b = def.baseStats;
    const typeColor = TYPE_COLORS[def.types[0] as ElementType];

    this.nameText.setText(def.name);
    this.statText.setText(`HP ${b.hp}   ATK ${b.atk}   DEF ${b.def}   SPE ${b.spe}`).setVisible(true);
    this.descText.setText(def.description);
    applyCreatureTexture(this.creaturePreview, this, id);
    this.creaturePreview.setVisible(true);

    this.previewGlow.clear();
    this.previewGlow.fillStyle(typeColor, 0.12);
    this.previewGlow.fillCircle(PANEL_CX, LAYOUT.spriteY, 50);
    this.previewGlow.lineStyle(2, typeColor, 0.4);
    this.previewGlow.strokeCircle(PANEL_CX, LAYOUT.spriteY, 50);

    this.orbs.forEach((orb, i) => {
      const sel = i === this.selected;
      const ring = orb.list[2] as Phaser.GameObjects.Graphics;
      ring.clear();
      if (sel) {
        ring.lineStyle(4, COLORS.gold, 1);
        ring.strokeCircle(0, -4, 36);
        ring.fillStyle(COLORS.gold, 0.15);
        ring.fillCircle(0, -4, 36);
      }
    });

    this.typePills.forEach((_, i) => {
      const orb = this.orbs[i];
      const oldPill = orb.list[3] as Phaser.GameObjects.Container;
      orb.remove(oldPill);
      oldPill.destroy();

      const def2 = getCreature(STARTERS[i]);
      const t = def2.types[0] as ElementType;
      const newPill = createTypePill(
        this, 0, LAYOUT.pillY, TYPE_NAMES[t], TYPE_COLORS[t], i === this.selected,
      );
      orb.add(newPill);
      this.typePills[i] = newPill;
    });
  }

  private confirm(): void {
    if (!this.picking) return;
    Sfx.menuConfirm();
    this.picking = false;
    this.setPickerButtons(false);
    this.trainerChip.setVisible(false);

    const orb = this.orbs[this.selected];
    this.tweens.add({
      targets: orb, angle: -12, duration: 70, yoyo: true, repeat: 4,
      onComplete: () => this.finishPick(),
    });
  }

  private finishPick(): void {
    const id = STARTERS[this.selected];
    const def = getCreature(id);

    this.dialog.show([
      `You chose ${def.name}!`,
      `"Take good care of ${def.name}!" — Prof. Elmwood`,
      `${GameState.player.name}, your Critter Quest begins now!`,
    ], () => {
      const starter = createCritter(id, 7);
      GameState.player.starterId = id;
      GameState.player.party = [starter];
      GameState.player.money = Math.max(GameState.player.money, 1500);
      addItem(GameState.player.items, 'potion', 5);
      addItem(GameState.player.items, 'capture_orb', 10);
      registerSeen(GameState.player.dexSeen, id);
      registerCaught(GameState.player.dexCaught, id, GameState.player.dexSeen);
      GameState.player.started = true;
      GameState.player.mapId = 'town';
      GameState.player.x = 10;
      GameState.player.y = 13;
      trySave(this);
      fadeToScene(this, 'Overworld', { showIntro: true }, 400);
    }, 'Prof. Elmwood');
  }
}

function buildTrainerChip(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const c = scene.add.container(LAYOUT.trainerX, LAYOUT.trainerY).setDepth(8);
  const g = scene.add.graphics();
  g.fillStyle(COLORS.panel, 0.94);
  g.fillRoundedRect(-48, -20, 96, 56, 8);
  g.lineStyle(2, COLORS.gold, 0.85);
  g.strokeRoundedRect(-48, -20, 96, 56, 8);
  const name = scene.add.text(0, -10, GameState.player.name, {
    fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#f5c542',
  }).setOrigin(0.5);
  const spr = scene.add.sprite(0, 14, playerTextureKey(GameState.player.characterId, 'down', 0))
    .setScale(2);
  c.add([g, name, spr]);
  return c;
}
