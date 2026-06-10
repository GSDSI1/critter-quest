import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES, TYPE_COLORS, type ElementType } from '../data/types';
import { STARTERS, getCreature } from '../data/creatures';
import { GameState, createCritter, registerSeen, registerCaught } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { creatureTextureKey, npcTextureKey } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import { buildLabInterior, buildMenuPanel } from '../ui/sceneBackdrops';
import { createTouchButton, createTypePill } from '../ui/touchButtons';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { DialogBox } from '../ui/DialogBox';
import { addItem } from '../data/items';

const ORB_TYPES = ['flame', 'tide', 'leaf'] as const;

export class StarterSelectScene extends Phaser.Scene {
  private selected = 0;
  private orbs: Phaser.GameObjects.Container[] = [];
  private typePills: Phaser.GameObjects.Container[] = [];
  private statText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private creaturePreview!: Phaser.GameObjects.Image;
  private previewGlow!: Phaser.GameObjects.Graphics;
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
    this.picking = false;
    this.introShown = false;
    this.selected = 0;

    buildLabInterior(this);

    // Showcase panel
    buildMenuPanel(this, 120, 72, 400, 200, 2);
    this.previewGlow = this.add.graphics().setDepth(3);
    this.creaturePreview = this.add.image(GAME_WIDTH / 2, 155, creatureTextureKey(this, STARTERS[0]))
      .setScale(2.8).setVisible(false).setDepth(4);
    this.tweens.add({
      targets: this.creaturePreview, y: 150, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.nameText = this.add.text(GAME_WIDTH / 2, 88, '', {
      fontFamily: '"Courier New", monospace', fontSize: '20px', color: '#f5c542', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    this.statText = this.add.text(GAME_WIDTH / 2, 210, '', {
      fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#c0c0c0',
    }).setOrigin(0.5).setDepth(5);

    this.descText = this.add.text(GAME_WIDTH / 2, 232, '', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5).setDepth(5);

    buildProfCorner(this);
    buildTrainerCorner(this);

    // Orb pedestals on bench
    const bench = this.add.graphics().setDepth(1);
    bench.fillStyle(0x4338ca, 0.9);
    bench.fillRoundedRect(60, 318, GAME_WIDTH - 120, 20, 6);
    bench.fillStyle(0x312e81, 1);
    bench.fillRect(60, 338, GAME_WIDTH - 120, 8);

    STARTERS.forEach((id, i) => {
      const x = 160 + i * 160;
      const container = this.add.container(x, 300).setDepth(6);

      const glow = this.add.graphics();
      glow.fillStyle([0xff6b35, 0x3b82f6, 0x22c55e][i], 0.15);
      glow.fillCircle(0, -4, 40);

      const orb = this.add.image(0, -8, `starter_orb_${ORB_TYPES[i]}`).setScale(1);
      const ring = this.add.graphics();

      const def = getCreature(id);
      const pill = createTypePill(this, 0, 36, TYPE_NAMES[def.types[0]], TYPE_COLORS[def.types[0] as ElementType], false);
      this.typePills.push(pill);

      container.add([glow, orb, ring, pill]);
      container.setSize(80, 80);
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

    this.prevBtn = createTouchButton(this, GAME_WIDTH / 2 - 130, 430, '◀ Prev', () => this.cycle(-1), { width: 90, depth: 50 });
    this.chooseBtn = createTouchButton(this, GAME_WIDTH / 2, 430, 'Choose!', () => this.confirm(), { width: 110, depth: 50 });
    this.nextBtn = createTouchButton(this, GAME_WIDTH / 2 + 130, 430, 'Next ▶', () => this.cycle(1), { width: 90, depth: 50 });
    this.setPickerButtons(false);

    this.dialog.show([
      'These three critters are ready for new trainers.',
      `${GameState.player.name}, step up to the table!`,
      'Tap an orb or use the buttons below to choose your partner!',
    ], () => {
      this.picking = true;
      this.introShown = true;
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
    this.statText.setText(`HP ${b.hp}   ATK ${b.atk}   DEF ${b.def}   SPE ${b.spe}`);
    this.descText.setText(def.description);
    this.creaturePreview.setTexture(creatureTextureKey(this, id)).setVisible(true);

    this.previewGlow.clear();
    this.previewGlow.fillStyle(typeColor, 0.12);
    this.previewGlow.fillCircle(GAME_WIDTH / 2, 155, 70);
    this.previewGlow.lineStyle(2, typeColor, 0.4);
    this.previewGlow.strokeCircle(GAME_WIDTH / 2, 155, 70);

    this.orbs.forEach((orb, i) => {
      const sel = i === this.selected;
      orb.setScale(sel ? 1.12 : 1);
      const ring = orb.list[2] as Phaser.GameObjects.Graphics;
      ring.clear();
      if (sel) {
        ring.lineStyle(4, COLORS.gold, 1);
        ring.strokeCircle(0, -4, 36);
        ring.fillStyle(COLORS.gold, 0.15);
        ring.fillCircle(0, -4, 36);
      }
    });

    this.typePills.forEach((pill, i) => {
      pill.destroy();
      const def2 = getCreature(STARTERS[i]);
      const t = def2.types[0] as ElementType;
      const newPill = createTypePill(this, 0, 36, TYPE_NAMES[t], TYPE_COLORS[t], i === this.selected);
      const orb = this.orbs[i];
      const oldPill = orb.list[3];
      orb.remove(oldPill);
      oldPill.destroy();
      orb.add(newPill);
      this.typePills[i] = newPill;
    });
  }

  private confirm(): void {
    if (!this.picking) return;
    Sfx.menuConfirm();
    this.picking = false;
    this.setPickerButtons(false);

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
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('Overworld', { showIntro: true });
      });
    }, 'Prof. Elmwood');
  }
}

function buildProfCorner(scene: Phaser.Scene): void {
  buildMenuPanel(scene, 20, 20, 210, 130, 4);
  scene.add.image(56, 88, npcTextureKey(scene, 'prof')).setScale(1.6).setDepth(5);
  scene.add.text(130, 38, 'Prof. Elmwood', {
    fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#f5c542',
  }).setDepth(5);
  scene.add.text(130, 56, 'Choose your partner!', {
    fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#c0c0c0',
  }).setDepth(5);
}

function buildTrainerCorner(scene: Phaser.Scene): void {
  buildMenuPanel(scene, GAME_WIDTH - 118, GAME_HEIGHT - 108, 98, 88, 4);
  scene.add.text(GAME_WIDTH - 69, GAME_HEIGHT - 98, GameState.player.name, {
    fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#f5c542',
  }).setOrigin(0.5).setDepth(5);
  scene.add.sprite(GAME_WIDTH - 69, GAME_HEIGHT - 62, playerTextureKey(GameState.player.characterId, 'down', 0))
    .setScale(2.8).setDepth(5);
}
