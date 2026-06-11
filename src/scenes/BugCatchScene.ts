import Phaser from 'phaser';
import { Input } from '../systems/input';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { Sfx } from '../utils/audio';
import { buildMinigameShell } from '../ui/minigameShell';
import { addItem } from '../data/items';
import { createCritter, registerSeen, registerCaught } from '../systems/stats';
import { DialogBox } from '../ui/DialogBox';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';

interface Firefly {
  obj: Phaser.GameObjects.Arc;
  vx: number;
  vy: number;
}

export class BugCatchScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 30;
  private active = false;
  private fireflies: Firefly[] = [];
  private shell!: ReturnType<typeof buildMinigameShell>;
  private dialog!: DialogBox;

  constructor() {
    super('BugCatch');
  }

  create(): void {
    Input.bind(this);
    this.score = 0;
    this.timeLeft = 30;
    this.active = true;
    this.dialog = new DialogBox(this);

    this.shell = buildMinigameShell(this, {
      title: 'Bug Catch',
      subtitle: 'Tap the fireflies! 30 seconds',
      onExit: () => this.finish(true),
    });
    this.shell.setScore('Score: 0');
    this.shell.setTimer('30s');

    for (let i = 0; i < 8; i++) this.spawnFirefly();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.active || this.dialog.isShowing()) return;
      this.tryTap(p.x, p.y);
    });
  }

  private spawnFirefly(): void {
    const x = 60 + Math.random() * (GAME_WIDTH - 120);
    const y = 100 + Math.random() * (GAME_HEIGHT - 200);
    const obj = this.add.circle(x, y, 8, 0xa3e635, 0.85).setDepth(6).setInteractive();
    obj.on('pointerdown', () => this.catchFly(obj));
    this.fireflies.push({
      obj,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 60,
    });
  }

  private tryTap(px: number, py: number): void {
    for (const f of this.fireflies) {
      if (!f.obj.active) continue;
      if (Phaser.Math.Distance.Between(px, py, f.obj.x, f.obj.y) < 20) {
        this.catchFly(f.obj);
        return;
      }
    }
  }

  private catchFly(obj: Phaser.GameObjects.Arc): void {
    if (!this.active || !obj.active) return;
    this.score++;
    Sfx.menuSelect();
    obj.destroy();
    this.shell.setScore(`Score: ${this.score}`);
    this.spawnFirefly();
  }

  update(_t: number, delta: number): void {
    Input.update();
    if (this.dialog.isShowing()) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
      return;
    }
    if (!this.active) return;
    if (Input.justPressed('cancel')) { this.finish(true); return; }

    this.timeLeft -= delta / 1000;
    this.shell.setTimer(`${Math.ceil(Math.max(0, this.timeLeft))}s`);
    if (this.timeLeft <= 0) { this.finish(false); return; }

    for (const f of this.fireflies) {
      if (!f.obj.active) continue;
      f.obj.x += f.vx * delta / 1000;
      f.obj.y += f.vy * delta / 1000;
      if (f.obj.x < 40 || f.obj.x > GAME_WIDTH - 40) f.vx *= -1;
      if (f.obj.y < 90 || f.obj.y > GAME_HEIGHT - 80) f.vy *= -1;
    }
  }

  private finish(early: boolean): void {
    if (!this.active) return;
    this.active = false;
    const lines: string[] = [`You caught ${this.score} fireflies!`];
    if (this.score >= 30) {
      addItem(GameState.player.items, 'great_orb', 1);
      const c = createCritter('nightmoth', 12);
      if (GameState.player.party.length < 6) GameState.player.party.push(c);
      else GameState.player.storage.push(c);
      registerSeen(GameState.player.dexSeen, 'nightmoth');
      registerCaught(GameState.player.dexCaught, 'nightmoth', GameState.player.dexSeen);
      lines.push('Amazing! Great Orb + Nightmoth!');
    } else if (this.score >= 20) {
      addItem(GameState.player.items, 'oran_berry', 3);
      lines.push('Nice! Earned 3 Oran Berries.');
    } else if (this.score >= 10) {
      addItem(GameState.player.items, 'potion', 2);
      lines.push('Good effort — 2 Potions!');
    } else if (!early) {
      lines.push('Keep practicing at night!');
    }
    trySave(this);
    this.dialog.show(lines, () => {
      this.scene.stop();
      this.scene.resume('Overworld');
    });
  }
}
