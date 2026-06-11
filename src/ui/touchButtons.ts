import { FONT } from './theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { pinContainerChildren } from './screenUi';
import { Sfx } from '../utils/audio';

export interface TouchButton {
  container: Phaser.GameObjects.Container;
  setVisible(visible: boolean): void;
  setEnabled(enabled: boolean): void;
  destroy(): void;
}

function lighten(c: number, amt: number): number {
  const r = Math.min(255, ((c >> 16) & 0xff) + amt);
  const g = Math.min(255, ((c >> 8) & 0xff) + amt);
  const b = Math.min(255, (c & 0xff) + amt);
  return (r << 16) | (g << 8) | b;
}

function drawButtonBg(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  hover: boolean,
): void {
  g.clear();
  const fill = hover ? lighten(COLORS.panel, 12) : COLORS.panel;
  const border = hover ? COLORS.gold : COLORS.panelBorder;
  g.fillStyle(fill, 0.95);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
  g.lineStyle(2, border, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
  if (hover) {
    g.fillStyle(COLORS.gold, 0.15);
    g.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, 4);
  }
}

export function createTouchButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts?: { width?: number; height?: number; depth?: number; fontSize?: string },
): TouchButton {
  const w = opts?.width ?? 110;
  const h = opts?.height ?? 38;
  const depth = opts?.depth ?? 1200;

  const container = scene.add.container(x, y).setDepth(depth);
  const bg = scene.add.graphics();
  drawButtonBg(bg, w, h, false);
  const text = scene.add.text(0, 0, label, {
    fontFamily: FONT,
    fontSize: opts?.fontSize ?? '13px',
    color: '#f0f0f0',
  }).setOrigin(0.5);

  container.add([bg, text]);
  container.setSize(w, h);
  pinContainerChildren(container, depth);

  let enabled = true;
  let repeatTimer: Phaser.Time.TimerEvent | undefined;

  const stopRepeat = () => {
    if (repeatTimer) {
      repeatTimer.remove(false);
      repeatTimer = undefined;
    }
  };

  const fire = () => {
    if (!enabled || !container.visible) return;
    Sfx.menuSelect();
    onClick();
  };

  const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
  const enableHit = () => {
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
  };
  enableHit();
  container.on('pointerdown', () => {
    fire();
    stopRepeat();
    repeatTimer = scene.time.addEvent({ delay: 160, loop: true, callback: fire });
  });
  container.on('pointerup', stopRepeat);
  container.on('pointerout', () => {
    stopRepeat();
    drawButtonBg(bg, w, h, false);
  });
  container.on('pointerover', () => {
    if (enabled) drawButtonBg(bg, w, h, true);
  });

  return {
    container,
    setVisible(visible: boolean) {
      container.setVisible(visible);
      if (!visible) stopRepeat();
    },
    setEnabled(value: boolean) {
      enabled = value;
      container.setAlpha(value ? 1 : 0.45);
      if (value) enableHit();
      else {
        container.disableInteractive();
        stopRepeat();
      }
    },
    destroy() {
      stopRepeat();
      container.destroy();
    },
  };
}

/** On-screen D-pad + action buttons for overworld. */
export class OverworldTouchPad {
  private buttons: TouchButton[] = [];
  private visible = true;

  constructor(
    private scene: Phaser.Scene,
    private onMove: (dx: number, dy: number) => void,
    private onAction: () => void,
    private onMenu: () => void,
  ) {
    const padX = GAME_WIDTH - 72;
    const padY = GAME_HEIGHT - 88;
    const gap = 46;

    this.buttons.push(
      createTouchButton(scene, padX, padY - gap, '▲', () => this.onMove(0, -1), { width: 52, height: 44, depth: 1150 }),
      createTouchButton(scene, padX - gap, padY, '◀', () => this.onMove(-1, 0), { width: 52, height: 44, depth: 1150 }),
      createTouchButton(scene, padX + gap, padY, '▶', () => this.onMove(1, 0), { width: 52, height: 44, depth: 1150 }),
      createTouchButton(scene, padX, padY + gap, '▼', () => this.onMove(0, 1), { width: 52, height: 44, depth: 1150 }),
      createTouchButton(scene, 72, GAME_HEIGHT - 52, 'Talk', () => this.onAction(), { width: 72, height: 40, depth: 1150 }),
      createTouchButton(scene, 152, GAME_HEIGHT - 52, 'Menu', () => this.onMenu(), { width: 72, height: 40, depth: 1150 }),
    );
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.buttons.forEach(b => b.setVisible(visible));
  }

  setEnabled(enabled: boolean): void {
    this.buttons.forEach(b => b.setEnabled(enabled));
  }

  destroy(): void {
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
  }
}

/** Type-colored pill label for starter orbs etc. */
export function createTypePill(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: number,
  selected = false,
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const w = Math.max(56, text.length * 8 + 16);
  const g = scene.add.graphics();
  g.fillStyle(color, selected ? 1 : 0.75);
  g.fillRoundedRect(-w / 2, -10, w, 20, 6);
  if (selected) {
    g.lineStyle(2, COLORS.gold, 1);
    g.strokeRoundedRect(-w / 2, -10, w, 20, 6);
  }
  const t = scene.add.text(0, 0, text, {
    fontFamily: FONT,
    fontSize: '11px',
    color: '#ffffff',
    fontStyle: selected ? 'bold' : 'normal',
  }).setOrigin(0.5);
  c.add([g, t]);
  return c;
}
