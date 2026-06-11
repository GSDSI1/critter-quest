import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { createTouchButton, type TouchButton } from './touchButtons';
import { pinContainerChildren } from './screenUi';

let touchPreferred = false;

/** True on coarse pointer devices or after first touch. */
export function wantsTouchNav(): boolean {
  if (touchPreferred) return true;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function markTouchPreferred(): void {
  touchPreferred = true;
}

/** Overworld D-pad is always shown for playability (mouse + touch). */
export function shouldShowOverworldTouchPad(): boolean {
  return true;
}

export interface TouchMenuNavCallbacks {
  onUp: () => void;
  onDown: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Vertical menu navigation strip for touch devices. */
export class TouchMenuNav {
  private buttons: TouchButton[] = [];
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: TouchMenuNavCallbacks) {
    this.container = scene.add.container(GAME_WIDTH - 56, GAME_HEIGHT / 2 - 80).setDepth(1200);
    const specs: [string, () => void][] = [
      ['▲', callbacks.onUp],
      ['OK', callbacks.onConfirm],
      ['▼', callbacks.onDown],
      ['✕', callbacks.onCancel],
    ];
    specs.forEach(([label, fn], i) => {
      const btn = createTouchButton(scene, 0, i * 48, label, fn, { width: 48, height: 40, depth: 1200, fontSize: '11px' });
      this.buttons.push(btn);
      this.container.add(btn.container);
    });
    pinContainerChildren(this.container, 1200);
    this.setVisible(wantsTouchNav());
    scene.input.on('pointerdown', markTouchPreferred);
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible && wantsTouchNav());
    this.buttons.forEach(b => b.setVisible(visible && wantsTouchNav()));
  }

  setEnabled(enabled: boolean): void {
    this.buttons.forEach(b => b.setEnabled(enabled));
  }

  destroy(): void {
    this.buttons.forEach(b => b.destroy());
    this.buttons = [];
    this.container.destroy();
  }
}
