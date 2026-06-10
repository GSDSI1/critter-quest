import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { STARTERS, getCreature } from '../data/creatures';
import { GameState, createCritter, registerSeen, registerCaught } from '../systems/stats';
import { saveGame } from '../systems/save';
import { creatureTextureKey, npcTextureKey } from '../utils/assetLoader';
import { playerTextureKey } from '../utils/sprites';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { DialogBox } from '../ui/DialogBox';

const ORB_TYPES = ['flame', 'tide', 'leaf'] as const;

export class StarterSelectScene extends Phaser.Scene {
  private selected = 0;
  private orbs: Phaser.GameObjects.Container[] = [];
  private statText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private creaturePreview!: Phaser.GameObjects.Image;
  private dialog!: DialogBox;
  private picking = false;
  private introShown = false;
  private typeIcons: Phaser.GameObjects.Image[] = [];

  constructor() {
    super('StarterSelect');
  }

  create(): void {
    Input.bind(this);
    this.picking = false;
    this.introShown = false;
    this.selected = 0;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f3460, 0x16213e, 0x1a2e1a, 0x0f0f1a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.image(GAME_WIDTH / 2, 320, 'lab_bench').setAlpha(0.85);

    const profPanel = this.add.graphics();
    profPanel.fillStyle(COLORS.panel, 0.9);
    profPanel.fillRoundedRect(24, 24, 200, 140, 8);
    profPanel.lineStyle(2, COLORS.gold, 0.8);
    profPanel.strokeRoundedRect(24, 24, 200, 140, 8);

    this.add.image(72, 95, npcTextureKey(this, 'prof')).setScale(3);
    this.add.text(130, 40, 'Prof. Elmwood', {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f5c542',
    });
    this.add.text(130, 58, 'Choose your partner!', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
    });

    const trainerPanel = this.add.graphics();
    trainerPanel.fillStyle(COLORS.panel, 0.85);
    trainerPanel.fillRoundedRect(GAME_WIDTH - 124, GAME_HEIGHT - 100, 100, 76, 8);
    this.add.text(GAME_WIDTH - 74, GAME_HEIGHT - 92, GameState.player.name, {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#f5c542',
    }).setOrigin(0.5);
    this.add.sprite(GAME_WIDTH - 74, GAME_HEIGHT - 58, playerTextureKey(GameState.player.characterId, 'down', 0)).setScale(2.5);

    this.dialog = new DialogBox(this);

    STARTERS.forEach((id, i) => {
      const x = 160 + i * 160;
      const container = this.add.container(x, 300);

      const pedestal = this.add.graphics();
      pedestal.fillStyle(0x57534e, 1);
      pedestal.fillRect(-20, 24, 40, 14);
      pedestal.fillStyle(0x44403c, 1);
      pedestal.fillRect(-14, 18, 28, 8);

      const orb = this.add.image(0, 0, `starter_orb_${ORB_TYPES[i]}`).setScale(1.15);
      const ring = this.add.graphics();
      ring.lineStyle(3, COLORS.gold, 0);
      ring.strokeCircle(0, 0, 32);

      const label = this.add.text(0, 48, TYPE_NAMES[getCreature(id).types[0]], {
        fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#8899aa',
      }).setOrigin(0.5);

      container.add([pedestal, orb, ring, label]);
      container.setSize(64, 64);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 34), Phaser.Geom.Circle.Contains);
      container.on('pointerover', () => { if (this.picking) { this.selected = i; this.refresh(); } });
      container.on('pointerdown', () => { if (this.picking) { this.selected = i; this.confirm(); } });
      this.orbs.push(container);
    });

    this.creaturePreview = this.add.image(GAME_WIDTH / 2, 175, creatureTextureKey(this, STARTERS[0])).setScale(2).setVisible(false);
    this.tweens.add({
      targets: this.creaturePreview, y: 170, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.statText = this.add.text(GAME_WIDTH / 2, 230, '', {
      fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#f5c542',
    }).setOrigin(0.5);

    this.descText = this.add.text(GAME_WIDTH / 2, 252, '', {
      fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#8899aa',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5);

    STARTERS.forEach((id, i) => {
      const def = getCreature(id);
      const icon = this.add.image(GAME_WIDTH / 2 - 60 + i * 60, 130, `type_${def.types[0]}`).setScale(0.9).setVisible(false);
      this.typeIcons.push(icon);
    });

    this.add.text(GAME_WIDTH / 2, 450, '← → choose orb  ·  A / Z confirm', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#667788',
    }).setOrigin(0.5);

    this.dialog.show([
      'These three critters are ready for new trainers.',
      `${GameState.player.name}, step up to the table!`,
      'Choose wisely — Kai picks the type that beats yours!',
    ], () => {
      this.picking = true;
      this.introShown = true;
      this.refresh();
    });
  }

  update(): void {
    Input.update();
    if (this.dialog.isShowing() && Input.justPressed('confirm')) {
      this.dialog.advance();
      return;
    }
    if (!this.picking || !this.introShown) return;

    if (Input.justPressed('left')) {
      this.selected = (this.selected - 1 + 3) % 3;
      Sfx.menuSelect();
      this.refresh();
    }
    if (Input.justPressed('right')) {
      this.selected = (this.selected + 1) % 3;
      Sfx.menuSelect();
      this.refresh();
    }
    if (Input.justPressed('confirm')) this.confirm();
  }

  private refresh(): void {
    if (!this.introShown) return;
    const id = STARTERS[this.selected];
    const def = getCreature(id);
    const b = def.baseStats;
    this.statText.setText(`${def.name}  ·  HP ${b.hp}  ATK ${b.atk}  DEF ${b.def}  SPE ${b.spe}`);
    this.descText.setText(def.description);
    this.creaturePreview.setTexture(creatureTextureKey(this, id)).setVisible(true);
    this.typeIcons.forEach((icon, i) => icon.setVisible(i === this.selected));

    this.orbs.forEach((orb, i) => {
      const sel = i === this.selected;
      orb.setScale(sel ? 1.1 : 1);
      const ring = orb.list[2] as Phaser.GameObjects.Graphics;
      ring.clear();
      ring.lineStyle(3, COLORS.gold, sel ? 1 : 0);
      ring.strokeCircle(0, 0, 32);
    });
  }

  private confirm(): void {
    if (!this.picking) return;
    Sfx.menuConfirm();
    this.picking = false;

    const orb = this.orbs[this.selected];
    this.tweens.add({
      targets: orb, angle: -10, duration: 70, yoyo: true, repeat: 4,
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
      const starter = createCritter(id, 5);
      GameState.player.starterId = id;
      GameState.player.party = [starter];
      registerSeen(GameState.player.dexSeen, id);
      registerCaught(GameState.player.dexCaught, id, GameState.player.dexSeen);
      GameState.player.started = true;
      GameState.player.mapId = 'town';
      GameState.player.x = 10;
      GameState.player.y = 13;
      saveGame();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('Overworld', { showIntro: true });
      });
    });
  }
}
