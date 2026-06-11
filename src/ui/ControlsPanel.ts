import { FONT } from './theme';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { createScreenBackdrop, pinContainerChildren } from './screenUi';

const PAGES = [
  {
    title: 'Overworld Controls',
    lines: [
      'Move:     Arrow keys / WASD / D-pad / Left stick',
      'Interact: Z / Enter / A button',
      'Run:      Shift / L1  (after beating Kai)',
      'Party:    X / Y button',
      'Menu:     P / Start button',
    ],
  },
  {
    title: 'Battle Controls',
    lines: [
      'Navigate menus:  Arrow keys / D-pad',
      'Confirm:         Z / Enter / A',
      'Back:            ESC / B',
      'Fight · Bag · Switch · Run from the battle menu.',
    ],
  },
];

export class ControlsPanel {
  private backdrop: Phaser.GameObjects.Rectangle;
  private container: Phaser.GameObjects.Container;
  private page = 0;
  private titleText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private pageHint: Phaser.GameObjects.Text;
  private visible = false;
  private onComplete?: () => void;
  private ignoreInputUntil = 0;

  private onPointerDown = () => {
    if (this.visible && Date.now() >= this.ignoreInputUntil) this.advance();
  };

  constructor(scene: Phaser.Scene) {
    this.backdrop = createScreenBackdrop(scene, 0.55, 1999);
    this.backdrop.setVisible(false);

    this.container = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.container.setDepth(2000).setVisible(false);
    pinContainerChildren(this.container, 2000);

    const panel = scene.add.image(0, 0, 'controls_panel').setOrigin(0.5);
    this.titleText = scene.add.text(0, -120, '', {
      fontFamily: FONT, fontSize: '18px', color: '#f5c542',
    }).setOrigin(0.5);
    this.bodyText = scene.add.text(-240, -80, '', {
      fontFamily: FONT, fontSize: '12px', color: '#c0c0c0',
      lineSpacing: 10,
    });
    this.pageHint = scene.add.text(0, 120, '', {
      fontFamily: FONT, fontSize: '11px', color: '#667788',
    }).setOrigin(0.5);

    this.container.add([panel, this.titleText, this.bodyText, this.pageHint]);

    scene.input.on('pointerdown', this.onPointerDown);

    scene.events.once('shutdown', () => {
      scene.input.off('pointerdown', this.onPointerDown);
    });
  }

  show(onComplete?: () => void): void {
    this.onComplete = onComplete;
    this.page = 0;
    this.visible = true;
    this.ignoreInputUntil = Date.now() + 150;
    this.backdrop.setVisible(true);
    this.container.setVisible(true);
    this.renderPage();
  }

  isShowing(): boolean {
    return this.visible;
  }

  advance(): void {
    if (!this.visible || Date.now() < this.ignoreInputUntil) return;
    if (this.page < PAGES.length - 1) {
      this.page++;
      this.ignoreInputUntil = Date.now() + 80;
      this.renderPage();
    } else {
      this.finish();
    }
  }

  skip(): void {
    if (!this.visible) return;
    this.finish();
  }

  hide(): void {
    this.visible = false;
    this.backdrop.setVisible(false);
    this.container.setVisible(false);
    this.onComplete = undefined;
  }

  private finish(): void {
    const cb = this.onComplete;
    this.hide();
    cb?.();
  }

  private renderPage(): void {
    const p = PAGES[this.page];
    this.titleText.setText(p.title);
    this.bodyText.setText(p.lines.join('\n'));
    this.pageHint.setText(
      this.page < PAGES.length - 1
        ? 'A / Z — Next page   (← → to flip)   B / ESC — Skip'
        : 'A / Z — Start adventure!   B / ESC — Skip',
    );
  }

  prevPage(): void {
    if (this.page > 0) { this.page--; this.renderPage(); }
  }

  nextPage(): void {
    if (this.page < PAGES.length - 1) { this.page++; this.renderPage(); }
  }
}

export { PAGES };
