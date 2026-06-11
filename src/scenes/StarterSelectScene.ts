import { FONT } from '../ui/theme';
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
import { starterBaseStats } from '../ui/statDisplay';

const ORB_TYPES = ['flame', 'tide', 'leaf'] as const;

const PANEL_W = 400;
const PANEL_H = 248;
const PANEL_X = (GAME_WIDTH - PANEL_W) / 2;
const PANEL_Y = 52;
const PANEL_CX = GAME_WIDTH / 2;

const LAYOUT = {
  panel: { x: PANEL_X, y: PANEL_Y, w: PANEL_W, h: PANEL_H },
  nameY: PANEL_Y + 22,
  typeY: PANEL_Y + 44,
  spriteY: PANEL_Y + 108,
  statsY: PANEL_Y + 168,
  descY: PANEL_Y + 214,
  orbY: PANEL_Y + PANEL_H + 20,
  orbX: [PANEL_CX - 80, PANEL_CX, PANEL_CX + 80] as const,
  pillY: 44,
  btnY: PANEL_Y + PANEL_H + 88,
  trainerX: PANEL_X + PANEL_W - 52,
  trainerY: PANEL_Y + 36,
} as const;

const STAT_COL_X = [-108, -36, 36, 108] as const;
const STAT_COL_LABELS = ['HP', 'ATK', 'DEF', 'SPD'] as const;

export class StarterSelectScene extends Phaser.Scene {
  private selected = 0;
  private orbs: Phaser.GameObjects.Container[] = [];
  private typePills: Phaser.GameObjects.Container[] = [];
  private introSprites: Phaser.GameObjects.Image[] = [];
  private statContainer!: Phaser.GameObjects.Container;
  private statValues: Phaser.GameObjects.Text[] = [];
  private detailTypePill!: Phaser.GameObjects.Container;
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

    this.add.image(PANEL_CX, 240, 'starter_lab_bg').setDepth(-5);

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
      .setScale(2.2).setVisible(false).setDepth(5);
    this.tweens.add({
      targets: this.creaturePreview,
      y: LAYOUT.spriteY - 4,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.nameText = this.add.text(PANEL_CX, LAYOUT.nameY, 'Choose your partner!', {
      fontFamily: FONT, fontSize: '18px', color: '#f5c542', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    this.detailTypePill = createTypePill(this, PANEL_CX, LAYOUT.typeY, 'Flame', TYPE_COLORS.flame, false)
      .setDepth(6).setVisible(false);

    this.statContainer = this.add.container(PANEL_CX, LAYOUT.statsY).setDepth(6).setVisible(false);
    this.statContainer.add(this.add.text(0, -14, 'Base stats', {
      fontFamily: FONT, fontSize: '8px', color: '#6b7a8a',
    }).setOrigin(0.5));
    STAT_COL_X.forEach((x, i) => {
      this.statContainer.add(this.add.text(x, 0, STAT_COL_LABELS[i], {
        fontFamily: FONT, fontSize: '8px', color: '#8899aa',
      }).setOrigin(0.5));
      const val = this.add.text(x, 12, '—', {
        fontFamily: FONT, fontSize: '11px', color: '#e2e8f0',
      }).setOrigin(0.5);
      this.statValues.push(val);
      this.statContainer.add(val);
    });

    this.descText = this.add.text(PANEL_CX, LAYOUT.descY, 'Listen to Prof. Elmwood, then pick an orb.', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
      wordWrap: { width: PANEL_W - 48 }, align: 'center',
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
      this, PANEL_CX - 118, LAYOUT.btnY, '◀ Prev', () => this.cycle(-1), { width: 90, depth: 50 },
    );
    this.chooseBtn = createTouchButton(
      this, PANEL_CX, LAYOUT.btnY, 'Choose!', () => this.confirm(), { width: 110, depth: 50 },
    );
    this.nextBtn = createTouchButton(
      this, PANEL_CX + 118, LAYOUT.btnY, 'Next ▶', () => this.cycle(1), { width: 90, depth: 50 },
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
    const type = def.types[0] as ElementType;
    const typeColor = TYPE_COLORS[type];
    const base = starterBaseStats(id);

    this.nameText.setText(def.name);
    this.statContainer.setVisible(true);
    const vals = [base.hp, base.atk, base.def, base.spd];
    this.statValues.forEach((t, i) => t.setText(String(vals[i])));
    this.descText.setText(def.description);

    this.detailTypePill.setVisible(true);
    this.detailTypePill.destroy();
    this.detailTypePill = createTypePill(
      this, PANEL_CX, LAYOUT.typeY, TYPE_NAMES[type], typeColor, false,
    ).setDepth(6);

    applyCreatureTexture(this.creaturePreview, this, id);
    this.creaturePreview.setVisible(true);

    this.previewGlow.clear();
    this.previewGlow.fillStyle(typeColor, 0.12);
    this.previewGlow.fillCircle(PANEL_CX, LAYOUT.spriteY, 46);
    this.previewGlow.lineStyle(2, typeColor, 0.4);
    this.previewGlow.strokeCircle(PANEL_CX, LAYOUT.spriteY, 46);

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
  g.fillRoundedRect(-44, -18, 88, 52, 8);
  g.lineStyle(2, COLORS.gold, 0.85);
  g.strokeRoundedRect(-44, -18, 88, 52, 8);
  const name = scene.add.text(0, -8, GameState.player.name, {
    fontFamily: FONT, fontSize: '9px', color: '#f5c542',
  }).setOrigin(0.5);
  const spr = scene.add.sprite(0, 12, playerTextureKey(GameState.player.characterId, 'down', 0))
    .setScale(1.75);
  c.add([g, name, spr]);
  return c;
}
