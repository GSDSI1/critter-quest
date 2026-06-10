import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { pinContainerChildren } from './screenUi';
import { createTouchButton } from './touchButtons';
import { Sfx } from '../utils/audio';

const BOX_X = 16;
const BOX_Y = GAME_HEIGHT - 112;
const BOX_W = GAME_WIDTH - 32;
const BOX_H = 96;
const AUTO_ADVANCE_MS = 12_000;

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private speakerText: Phaser.GameObjects.Text;
  private textObj: Phaser.GameObjects.Text;
  private nextBtn: ReturnType<typeof createTouchButton>;
  private lines: string[] = [];
  private lineIndex = 0;
  private onComplete?: () => void;
  private visible = false;
  private ignoreInputUntil = 0;
  private autoTimer?: Phaser.Time.TimerEvent;

  private onKeyAdvance = () => {
    if (this.visible && Date.now() >= this.ignoreInputUntil) this.advance();
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const bg = scene.textures.exists('dialog_frame')
      ? scene.add.image(BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2, 'dialog_frame').setOrigin(0.5)
      : scene.add.graphics();
    if (!(bg instanceof Phaser.GameObjects.Image)) {
      const g = bg as Phaser.GameObjects.Graphics;
      g.fillStyle(COLORS.panel, 0.97);
      g.fillRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, 10);
      g.lineStyle(3, COLORS.panelBorder, 1);
      g.strokeRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, 10);
    }

    this.speakerText = scene.add.text(BOX_X + 16, BOX_Y + 8, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#f5c542',
    });

    this.textObj = scene.add.text(BOX_X + 16, BOX_Y + 26, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#f0f0f0',
      wordWrap: { width: BOX_W - 140 },
      lineSpacing: 4,
    });

    this.container = scene.add.container(0, 0, [bg, this.speakerText, this.textObj]);
    this.container.setDepth(1000).setVisible(false);
    pinContainerChildren(this.container, 1000);

    this.nextBtn = createTouchButton(
      scene,
      BOX_X + BOX_W - 58,
      BOX_Y + BOX_H / 2,
      'Next ▶',
      () => this.advance(),
      { width: 96, height: 34, depth: 1001, fontSize: '12px' },
    );
    this.nextBtn.setVisible(false);

    scene.input.keyboard?.on('keydown-Z', this.onKeyAdvance);
    scene.input.keyboard?.on('keydown-ENTER', this.onKeyAdvance);
    scene.input.keyboard?.on('keydown-SPACE', this.onKeyAdvance);

    scene.events.once('shutdown', () => {
      this.clearAutoTimer();
      scene.input.keyboard?.off('keydown-Z', this.onKeyAdvance);
      scene.input.keyboard?.off('keydown-ENTER', this.onKeyAdvance);
      scene.input.keyboard?.off('keydown-SPACE', this.onKeyAdvance);
      this.nextBtn.destroy();
    });
  }

  show(lines: string | string[], onComplete?: () => void, speaker?: string): void {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.lineIndex = 0;
    this.onComplete = onComplete;
    this.visible = true;
    this.ignoreInputUntil = Date.now() + 150;
    this.container.setVisible(true);
    this.nextBtn.setVisible(true);
    this.speakerText.setText(speaker ?? '');
    this.speakerText.setVisible(!!speaker);
    this.renderLine();
    this.resetAutoTimer();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
    this.nextBtn.setVisible(false);
    this.onComplete = undefined;
    this.clearAutoTimer();
  }

  isShowing(): boolean {
    return this.visible;
  }

  advance(): void {
    if (!this.visible || Date.now() < this.ignoreInputUntil) return;
    Sfx.menuConfirm();
    if (this.lineIndex < this.lines.length - 1) {
      this.lineIndex++;
      this.renderLine();
      this.ignoreInputUntil = Date.now() + 80;
      this.resetAutoTimer();
    } else {
      const done = this.onComplete;
      this.hide();
      done?.();
    }
  }

  private renderLine(): void {
    this.textObj.setText(this.lines[this.lineIndex] ?? '');
    const yOffset = this.speakerText.visible ? 26 : 14;
    this.textObj.setY(BOX_Y + yOffset);
  }

  private resetAutoTimer(): void {
    this.clearAutoTimer();
    this.autoTimer = this.scene.time.delayedCall(AUTO_ADVANCE_MS, () => {
      if (this.visible) this.advance();
    });
  }

  private clearAutoTimer(): void {
    if (this.autoTimer) {
      this.autoTimer.remove(false);
      this.autoTimer = undefined;
    }
  }
}
