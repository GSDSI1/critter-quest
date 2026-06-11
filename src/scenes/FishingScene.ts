import Phaser from 'phaser';
import { FONT } from '../ui/theme';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { Input } from '../systems/input';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { Sfx } from '../utils/audio';
import { buildMinigameShell } from '../ui/minigameShell';
import { pickWildFromTable } from '../data/encounters';
import { createCritter, registerSeen } from '../systems/stats';
import { registerCaughtWithMilestone } from '../systems/dexNotify';
import { addItem } from '../data/items';
import { DialogBox } from '../ui/DialogBox';
import { tryMinigameBest } from '../systems/minigameScores';

export class FishingScene extends Phaser.Scene {
  private round = 0;
  private hits = 0;
  private barPos = 0;
  private barDir = 1;
  private greenStart = 0.38;
  private greenEnd = 0.58;
  private barGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics;
  private active = false;
  private returnMap = 'route3';
  private dialog!: DialogBox;
  private shell!: ReturnType<typeof buildMinigameShell>;

  constructor() {
    super('Fishing');
  }

  create(data: { returnMap?: string }): void {
    Input.bind(this);
    this.returnMap = data.returnMap ?? GameState.player.mapId;
    this.round = 0;
    this.hits = 0;
    this.dialog = new DialogBox(this);

    if (!GameState.player.storyFlags.fishing_unlocked) {
      GameState.player.storyFlags.fishing_unlocked = true;
      addItem(GameState.player.items, 'old_rod', 1);
    }

    this.shell = buildMinigameShell(this, {
      title: 'Fishing',
      subtitle: 'Tap when the bobber is in the green zone! (3 casts)',
      onExit: () => this.leave(),
    });

    this.barGfx = this.add.graphics().setDepth(8);
    this.zoneGfx = this.add.graphics().setDepth(7);
    this.add.text(GAME_WIDTH / 2, 120, '~', {
      fontFamily: FONT, fontSize: '48px', color: '#3b82f6',
    }).setOrigin(0.5);

    this.drawBar();
    this.active = true;
    this.shell.setScore('Cast: 1/3');
  }

  update(_t: number, delta: number): void {
    Input.update();
    if (!this.active || this.dialog.isShowing()) {
      if (this.dialog.isShowing() && (Input.justPressed('confirm') || Input.justPressed('cancel'))) {
        this.dialog.advance();
      }
      return;
    }
    if (Input.justPressed('cancel')) { this.leave(); return; }
    if (Input.justPressed('confirm')) this.tryCatch();

    this.barPos += this.barDir * delta * 0.0012;
    if (this.barPos >= 1) { this.barPos = 1; this.barDir = -1; }
    if (this.barPos <= 0) { this.barPos = 0; this.barDir = 1; }
    this.drawBar();
  }

  private drawBar(): void {
    const x = 80;
    const y = 200;
    const w = GAME_WIDTH - 160;
    const h = 24;
    this.zoneGfx.clear();
    this.zoneGfx.fillStyle(0x22c55e, 0.35);
    this.zoneGfx.fillRect(x + w * this.greenStart, y, w * (this.greenEnd - this.greenStart), h);
    this.barGfx.clear();
    this.barGfx.fillStyle(0x333333, 1);
    this.barGfx.fillRoundedRect(x, y, w, h, 4);
    this.barGfx.fillStyle(0xf5c542, 1);
    this.barGfx.fillCircle(x + w * this.barPos, y + h / 2, 10);
  }

  private tryCatch(): void {
    const inZone = this.barPos >= this.greenStart && this.barPos <= this.greenEnd;
    if (inZone) {
      this.hits++;
      Sfx.menuConfirm();
    } else {
      Sfx.menuSelect();
    }
    this.round++;
    if (this.round >= 3) {
      this.finish();
      return;
    }
    this.shell.setScore(`Cast: ${this.round + 1}/3  Hits: ${this.hits}`);
    this.barPos = Math.random();
    this.barDir = Math.random() > 0.5 ? 1 : -1;
  }

  /** DEV test bridge — skip timing and finish with N green-zone hits (0–3). */
  devFinish(hits: number): void {
    this.hits = Math.max(0, Math.min(3, hits));
    this.round = 3;
    this.finish();
  }

  private finish(): void {
    this.active = false;
    const improved = tryMinigameBest('fishingBest', this.hits);
    const lines: string[] = [];
    if (improved && this.hits > 0) lines.push(`New fishing best: ${this.hits}/3!`);
    if (this.hits >= 2) {
      const { def, level } = pickWildFromTable('fishing_catch');
      const c = createCritter(def.id, level);
      if (GameState.player.party.length < 6) GameState.player.party.push(c);
      else GameState.player.storage.push(c);
      registerSeen(GameState.player.dexSeen, def.id);
      registerCaughtWithMilestone(GameState.player, def.id, this);
      lines.push(`Great catch! You reeled in ${def.name} (Lv.${level})!`);
    } else if (this.hits === 1) {
      addItem(GameState.player.items, 'potion', 1);
      GameState.player.money += 50;
      lines.push('Not bad — found a Potion and $50!');
    } else {
      lines.push('Nothing bit today. Try again!');
    }
    trySave(this);
    this.dialog.show(lines, () => this.leave());
  }

  private leave(): void {
    this.scene.stop();
    this.scene.resume('Overworld');
  }
}
