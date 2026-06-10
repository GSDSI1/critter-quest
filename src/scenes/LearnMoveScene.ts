import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getMove } from '../data/moves';
import { tryLearnMove } from '../data/learnsets';
import type { CritterInstance } from '../systems/stats';
import { displayName } from '../systems/stats';
import { Sfx } from '../utils/audio';
import { Input } from '../systems/input';

export type LearnMoveCallback = (result: { learned: boolean; moves: string[]; replaced?: string }) => void;

export class LearnMoveScene extends Phaser.Scene {
  private critter!: CritterInstance;
  private moveId!: string;
  private phase: 'confirm' | 'forget' = 'confirm';
  private selected = 0;
  private onDone!: LearnMoveCallback;

  constructor() {
    super('LearnMove');
  }

  create(data: {
    critter: CritterInstance;
    moveId: string;
    onDone: LearnMoveCallback;
  }): void {
    Input.bind(this);
    this.critter = data.critter;
    this.moveId = data.moveId;
    this.onDone = data.onDone;

    this.add.graphics().fillStyle(0x000000, 0.75).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const move = getMove(this.moveId);
    this.add.text(GAME_WIDTH / 2, 40, `${displayName(this.critter)} wants to learn ${move.name}!`, {
      fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f5c542', align: 'center',
      wordWrap: { width: GAME_WIDTH - 40 },
    }).setOrigin(0.5);

    this.render();
  }

  update(): void {
    Input.update();
    if (this.phase === 'confirm') {
      if (Input.justPressed('left')) { this.selected = 0; this.render(); }
      if (Input.justPressed('right')) { this.selected = 1; this.render(); }
    } else if (this.phase === 'forget') {
      if (Input.justPressed('up')) { this.selected = Math.max(0, this.selected - 1); this.render(); }
      if (Input.justPressed('down')) { this.selected = Math.min(3, this.selected + 1); this.render(); }
      if (Input.justPressed('confirm')) this.forgetMove();
    }
    if (Input.justPressed('confirm') && this.phase === 'confirm') this.confirm();
    if (Input.justPressed('cancel')) {
      this.finish({ learned: false, moves: this.critter.moves.map(m => m.id) });
    }
  }

  private container!: Phaser.GameObjects.Container;

  private render(): void {
    if (this.container) this.container.destroy();
    this.container = this.add.container(0, 0);

    if (this.phase === 'confirm') {
      ['Yes', 'No'].forEach((label, i) => {
        const t = this.add.text(GAME_WIDTH / 2 - 60 + i * 120, 120, (i === this.selected ? '▶ ' : '') + label, {
          fontFamily: '"Courier New", monospace', fontSize: '16px',
          color: i === this.selected ? '#f5c542' : '#8899aa',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        t.on('pointerdown', () => { this.selected = i; this.confirm(); });
        this.container.add(t);
      });
    } else {
      this.container.add(this.add.text(GAME_WIDTH / 2, 90, 'Forget a move to make room:', {
        fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#8899aa',
      }).setOrigin(0.5));

      this.critter.moves.forEach((m, i) => {
        const move = getMove(m.id);
        const t = this.add.text(GAME_WIDTH / 2, 120 + i * 28, (i === this.selected ? '▶ ' : '') + move.name, {
          fontFamily: '"Courier New", monospace', fontSize: '14px',
          color: i === this.selected ? '#f5c542' : '#c0c0c0',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        t.on('pointerdown', () => { this.selected = i; this.forgetMove(); });
        this.container.add(t);
      });
    }
  }

  private confirm(): void {
    if (this.phase === 'confirm') {
      if (this.selected === 1) {
        this.finish({ learned: false, moves: this.critter.moves.map(m => m.id) });
        return;
      }
      Sfx.menuConfirm();
      const currentIds = this.critter.moves.map(m => m.id);
      if (currentIds.length < 4 && !currentIds.includes(this.moveId)) {
        const result = tryLearnMove(currentIds, this.moveId);
        this.applyMoves(result.moves);
        this.finish({ learned: true, moves: result.moves });
        return;
      }
      if (currentIds.includes(this.moveId)) {
        this.finish({ learned: false, moves: currentIds });
        return;
      }
      this.phase = 'forget';
      this.selected = 0;
      this.render();
    }
  }

  private forgetMove(): void {
    const currentIds = this.critter.moves.map(m => m.id);
    const newMoves = [...currentIds];
    newMoves[this.selected] = this.moveId;
    this.applyMoves(newMoves);
    this.finish({ learned: true, moves: newMoves, replaced: currentIds[this.selected] });
  }

  private applyMoves(ids: string[]): void {
    this.critter.moves = ids.map(id => {
      const existing = this.critter.moves.find(m => m.id === id);
      const def = getMove(id);
      return { id, pp: existing?.pp ?? def.pp, maxPp: def.pp };
    });
  }

  private finish(result: { learned: boolean; moves: string[]; replaced?: string }): void {
    this.scene.stop();
    this.onDone(result);
  }
}

export class NicknameScene extends Phaser.Scene {
  private inputText = '';
  private onDone!: (nickname: string | undefined) => void;
  private display!: Phaser.GameObjects.Text;

  constructor() {
    super('Nickname');
  }

  create(data: { speciesName: string; onDone: (nickname: string | undefined) => void }): void {
    Input.bind(this);
    this.onDone = data.onDone;
    this.inputText = '';
    this.add.graphics().fillStyle(0x000000, 0.8).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.add.text(GAME_WIDTH / 2, 80, `Give a nickname to ${data.speciesName}?`, {
      fontFamily: '"Courier New", monospace', fontSize: '16px', color: '#f5c542',
    }).setOrigin(0.5);

    this.display = this.add.text(GAME_WIDTH / 2, 140, '_', {
      fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 200, 'A / Enter: skip or confirm  ·  Keyboard to type', {
      fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#667788',
    }).setOrigin(0.5);

    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        this.submit();
        return;
      }
      if (ev.key === 'Backspace') {
        this.inputText = this.inputText.slice(0, -1);
      } else if (ev.key.length === 1 && this.inputText.length < 12) {
        this.inputText += ev.key;
      }
      this.display.setText(this.inputText + '_');
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('confirm')) this.submit();
    if (Input.justPressed('cancel')) this.submit();
  }

  private submit(): void {
    const nick = this.inputText.trim() || undefined;
    this.scene.stop();
    this.onDone(nick);
  }
}
