import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { pinToScreen } from './screenUi';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private textObj: Phaser.GameObjects.Text;
  private lines: string[] = [];
  private lineIndex = 0;
  private onComplete?: () => void;
  private visible = false;
  private arrow: Phaser.GameObjects.Text;
  private ignoreInputUntil = 0;

  private onPointerDown = () => {
    if (this.visible && Date.now() >= this.ignoreInputUntil) this.advance();
  };

  private onKeyAdvance = () => {
    if (this.visible && Date.now() >= this.ignoreInputUntil) this.advance();
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const bg = scene.add.graphics();
    bg.fillStyle(COLORS.panel, 0.97);
    bg.fillRoundedRect(0, 0, GAME_WIDTH - 32, 96, 10);
    bg.lineStyle(3, COLORS.panelBorder, 1);
    bg.strokeRoundedRect(0, 0, GAME_WIDTH - 32, 96, 10);

    this.textObj = scene.add.text(16, 14, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#f0f0f0',
      wordWrap: { width: GAME_WIDTH - 64 },
      lineSpacing: 6,
    });

    this.arrow = scene.add.text(GAME_WIDTH - 56, 68, '▼', {
      fontSize: '12px',
      color: '#e94560',
    }).setVisible(false);

    this.container = scene.add.container(16, GAME_HEIGHT - 112, [bg, this.textObj, this.arrow]);
    this.container.setDepth(1000).setVisible(false);
    pinToScreen(this.container, 1000);
    pinToScreen(bg);
    pinToScreen(this.textObj);
    pinToScreen(this.arrow);

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.keyboard?.on('keydown-Z', this.onKeyAdvance);
    scene.input.keyboard?.on('keydown-ENTER', this.onKeyAdvance);
    scene.input.keyboard?.on('keydown-SPACE', this.onKeyAdvance);

    scene.events.once('shutdown', () => {
      scene.input.off('pointerdown', this.onPointerDown);
      scene.input.keyboard?.off('keydown-Z', this.onKeyAdvance);
      scene.input.keyboard?.off('keydown-ENTER', this.onKeyAdvance);
      scene.input.keyboard?.off('keydown-SPACE', this.onKeyAdvance);
    });
  }

  show(lines: string | string[], onComplete?: () => void): void {
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.lineIndex = 0;
    this.onComplete = onComplete;
    this.visible = true;
    this.ignoreInputUntil = Date.now() + 150;
    this.container.setVisible(true);
    this.renderLine();
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
    this.onComplete = undefined;
  }

  isShowing(): boolean {
    return this.visible;
  }

  private renderLine(): void {
    this.textObj.setText(this.lines[this.lineIndex] ?? '');
    this.arrow.setVisible(this.lineIndex < this.lines.length - 1);
  }

  advance(): void {
    if (!this.visible || Date.now() < this.ignoreInputUntil) return;
    if (this.lineIndex < this.lines.length - 1) {
      this.lineIndex++;
      this.renderLine();
      this.ignoreInputUntil = Date.now() + 80;
    } else {
      this.hide();
      this.onComplete?.();
    }
  }
}
