import { FONT } from './theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../data/types';
import { getBadge } from '../data/badges';
import { totalOrbs } from '../data/items';
import { GameState } from '../systems/stats';
import { isNight } from '../systems/dayNight';
import { pinContainerChildren } from './screenUi';

export class OverworldHUD {
  private container: Phaser.GameObjects.Container;
  private moneyText!: Phaser.GameObjects.Text;
  private orbText!: Phaser.GameObjects.Text;
  private mapText!: Phaser.GameObjects.Text;
  private badgeText!: Phaser.GameObjects.Text;
  private hintsText!: Phaser.GameObjects.Text;
  private moveHintText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(900);
    pinContainerChildren(this.container, 900);

    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(8, 8, 224, 86, 8);
    bg.lineStyle(1, COLORS.gold, 0.6);
    bg.strokeRoundedRect(8, 8, 224, 86, 8);

    this.mapText = scene.add.text(16, 12, '', {
      fontFamily: FONT, fontSize: '11px', color: '#f5c542',
    });

    this.moneyText = scene.add.text(16, 28, '', {
      fontFamily: FONT, fontSize: '11px', color: '#f0f0f0',
    });

    this.orbText = scene.add.text(16, 42, '', {
      fontFamily: FONT, fontSize: '11px', color: '#f0f0f0',
    });

    this.badgeText = scene.add.text(16, 56, '', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    });

    this.timeText = scene.add.text(16, 70, '', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    });

    this.hintsText = scene.add.text(GAME_WIDTH - 140, 12, '[P] Menu  [X] Party', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    });

    this.moveHintText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 14, '', {
      fontFamily: FONT, fontSize: '9px', color: '#667788',
    }).setOrigin(0.5);

    this.container.add([bg, this.mapText, this.moneyText, this.orbText, this.badgeText, this.timeText, this.hintsText, this.moveHintText]);
    this.refresh('');
  }

  refresh(mapName: string): void {
    const p = GameState.player;
    this.mapText.setText(`${p.name}  ·  ${mapName}`);
    this.moneyText.setText(`$${p.money}`);
    this.orbText.setText(`Orbs: ${totalOrbs(p.items)}`);
    const badges = p.badges.map(b => getBadge(b).name.split(' ')[0][0]).join('');
    this.badgeText.setText(badges ? `Badges: ${badges}` : '');
  }

  updateTimeOfDay(playTimeSec: number, outdoor: boolean): void {
    if (!outdoor) {
      this.timeText.setVisible(false);
      return;
    }
    this.timeText.setVisible(true);
    const night = isNight(playTimeSec);
    this.timeText.setText(night ? '☾ Night' : '☀ Day');
    this.timeText.setColor(night ? '#a5b4fc' : '#fbbf24');
  }

  setTouchHints(touch: boolean): void {
    this.hintsText.setText(touch ? 'Menu · Party' : '[P] Menu  [X] Party');
  }

  showMoveHint(show: boolean): void {
    this.moveHintText.setText(show ? 'Tap to walk · Hold D-pad · Talk to interact' : '');
    this.moveHintText.setVisible(show);
  }

  clearMoveHint(): void {
    this.showMoveHint(false);
  }
}

export function drawHpBar(
  scene: Phaser.Scene,
  x: number, y: number,
  width: number, height: number,
  current: number, max: number,
  depth = 100,
  colorOverride?: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const color = colorOverride ?? (ratio > 0.5 ? COLORS.hpGreen : ratio > 0.2 ? COLORS.hpYellow : COLORS.hpRed);

  g.fillStyle(0x333333, 1);
  g.fillRoundedRect(x, y, width, height, 3);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x + 1, y + 1, Math.max(0, (width - 2) * ratio), height - 2, 2);

  return g;
}
