import Phaser from 'phaser';
import { FONT } from '../ui/theme';
import { Input } from '../systems/input';
import { GameState, firstAlive } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { Sfx } from '../utils/audio';
import { buildMinigameShell, playDayIndex } from '../ui/minigameShell';
import { addItem } from '../data/items';
import { getCreature } from '../data/creatures';
import { DialogBox } from '../ui/DialogBox';
import { GAME_WIDTH } from '../data/types';
import { createTouchButton, type TouchButton } from '../ui/touchButtons';

const ROUNDS = [
  { name: 'Novice Pat', types: ['leaf'], score: 120 },
  { name: 'Ace Dana', types: ['tide', 'leaf'], score: 165 },
  { name: 'Pro Vera', types: ['flame', 'volt'], score: 210 },
];

function contestScore(speciesId: string, themeTypes: string[]): number {
  const def = getCreature(speciesId);
  const b = def.baseStats;
  let s = b.hp + b.atk + b.def + b.spe;
  if (def.types.some(t => themeTypes.includes(t))) s += 40;
  return s;
}

export class CritterContestScene extends Phaser.Scene {
  private round = 0;
  private pickIndex = 0;
  private phase: 'pick' | 'result' | 'done' = 'pick';
  private shell!: ReturnType<typeof buildMinigameShell>;
  private dialog!: DialogBox;
  private pickLabels: Phaser.GameObjects.Text[] = [];
  private enterBtn?: TouchButton;

  constructor() {
    super('CritterContest');
  }

  create(): void {
    Input.bind(this);
    this.round = 0;
    this.pickIndex = 0;
    this.phase = 'pick';
    this.dialog = new DialogBox(this);

    const day = playDayIndex(GameState.player.playTime);
    if (GameState.player.lastContestDay === day) {
      this.dialog.show(['You already entered today\'s contest!', 'Come back tomorrow.'], () => this.leave());
      return;
    }

    this.shell = buildMinigameShell(this, {
      title: 'Critter Contest',
      subtitle: 'Pick your best partner each round!',
      onExit: () => this.leave(),
    });
    this.renderPick();
  }

  private renderPick(): void {
    this.pickLabels.forEach(t => t.destroy());
    this.pickLabels = [];
    this.enterBtn?.destroy();
    this.enterBtn = undefined;
    const r = ROUNDS[this.round];
    this.shell.setScore(`Round ${this.round + 1}/3 vs ${r.name}`);
    this.shell.setTimer(`Theme: ${r.types.join('/')}`);

    GameState.player.party.forEach((c, i) => {
      const def = getCreature(c.speciesId);
      const y = 130 + i * 36;
      const t = this.add.text(GAME_WIDTH / 2, y, `${def.name} Lv.${c.level}  (${contestScore(c.speciesId, r.types)})`, {
        fontFamily: FONT, fontSize: '12px',
        color: i === this.pickIndex ? '#f5c542' : '#c0c0c0',
      }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.pickIndex = i; this.renderPick(); });
      this.pickLabels.push(t);
    });

    this.enterBtn = createTouchButton(this, GAME_WIDTH / 2, 320, 'Enter!', () => this.submitRound(), { width: 110, depth: 15 });
  }

  private submitRound(): void {
    const r = ROUNDS[this.round];
    const c = GameState.player.party[this.pickIndex];
    if (!c) return;
    const yours = contestScore(c.speciesId, r.types);
    const win = yours >= r.score + Math.floor(Math.random() * 20);
    Sfx.menuConfirm();
    if (win) {
      this.round++;
      if (this.round >= 3) {
        this.winContest();
        return;
      }
      this.renderPick();
    } else {
      this.dialog.show([`${r.name} wins this round!`, 'Contest over — try again tomorrow.'], () => {
        GameState.player.lastContestDay = playDayIndex(GameState.player.playTime);
        trySave(this);
        this.leave();
      });
    }
  }

  /** DEV test bridge — award contest win without playing rounds. */
  devWin(): void {
    this.winContest();
  }

  private winContest(): void {
    GameState.player.storyFlags.contest_winner = true;
    GameState.player.lastContestDay = playDayIndex(GameState.player.playTime);
    GameState.player.money += 500;
    addItem(GameState.player.items, 'contest_ribbon', 1);
    trySave(this);
    this.dialog.show([
      'You won the Critter Contest!',
      'Prize: $500 and a Contest Ribbon!',
    ], () => this.leave());
  }

  update(): void {
    Input.update();
    if (this.dialog.isShowing()) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.dialog.advance();
      return;
    }
    if (Input.justPressed('up')) { this.pickIndex = Math.max(0, this.pickIndex - 1); this.renderPick(); }
    if (Input.justPressed('down')) { this.pickIndex = Math.min(GameState.player.party.length - 1, this.pickIndex + 1); this.renderPick(); }
    if (Input.justPressed('confirm')) this.submitRound();
    if (Input.justPressed('cancel')) this.leave();
  }

  private leave(): void {
    this.scene.stop();
    this.scene.resume('Overworld');
  }
}
