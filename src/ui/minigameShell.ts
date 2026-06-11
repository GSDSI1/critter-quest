import Phaser from 'phaser';
import { FONT } from './theme';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { buildScreenOverlay, buildMenuPanel } from './sceneBackdrops';
import { createTouchButton } from './touchButtons';

export interface MinigameShellOpts {
  title: string;
  subtitle?: string;
  onExit: () => void;
}

/** Shared chrome for minigame overlay scenes. */
export function buildMinigameShell(scene: Phaser.Scene, opts: MinigameShellOpts): {
  scoreText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
  setScore: (s: string) => void;
  setTimer: (s: string) => void;
} {
  buildScreenOverlay(scene, 0.55, 0);
  buildMenuPanel(scene, 24, 24, GAME_WIDTH - 48, GAME_HEIGHT - 48, 5);

  scene.add.text(GAME_WIDTH / 2, 36, opts.title, {
    fontFamily: FONT, fontSize: '20px', color: '#f5c542',
  }).setOrigin(0.5).setDepth(10);

  if (opts.subtitle) {
    scene.add.text(GAME_WIDTH / 2, 58, opts.subtitle, {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    }).setOrigin(0.5).setDepth(10);
  }

  const scoreText = scene.add.text(40, 72, 'Score: 0', {
    fontFamily: FONT, fontSize: '12px', color: '#f0f0f0',
  }).setDepth(10);

  const timerText = scene.add.text(GAME_WIDTH - 40, 72, '', {
    fontFamily: FONT, fontSize: '12px', color: '#f0f0f0',
  }).setOrigin(1, 0).setDepth(10);

  const hintText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, 'Tap or press Z', {
    fontFamily: FONT, fontSize: '10px', color: '#667788',
  }).setOrigin(0.5).setDepth(10);

  createTouchButton(scene, GAME_WIDTH - 72, 36, 'Exit', opts.onExit, { width: 72, height: 32, depth: 20, fontSize: '11px' });

  return {
    scoreText,
    timerText,
    hintText,
    setScore: (s: string) => scoreText.setText(s),
    setTimer: (s: string) => timerText.setText(s),
  };
}

export function playDayIndex(playTimeSec: number): number {
  return Math.floor(playTimeSec / 480);
}
