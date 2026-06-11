import Phaser from 'phaser';
import { GAME_WIDTH } from '../../data/types';
import { Sfx } from '../../utils/audio';

function isPlayerSprite(sprite: Phaser.GameObjects.Image): boolean {
  return sprite.x < GAME_WIDTH / 2;
}

type BurstFn = (scene: Phaser.Scene, x: number, y: number, color: number) => void;

function burstCircles(scene: Phaser.Scene, x: number, y: number, color: number, count: number, spread: number, dy = 0): void {
  for (let i = 0; i < count; i++) {
    const g = scene.add.graphics().setDepth(200);
    g.fillStyle(color, 0.9);
    g.fillCircle(0, 0, 3 + (i % 2));
    g.setPosition(x + (i - count / 2) * spread, y + dy);
    scene.tweens.add({
      targets: g,
      x: g.x + (i - count / 2) * 4,
      y: g.y - 8 - Math.abs(i - count / 2) * 3,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 280 + i * 30,
      onComplete: () => g.destroy(),
    });
  }
}

function burstLines(scene: Phaser.Scene, x: number, y: number, color: number): void {
  for (let i = 0; i < 5; i++) {
    const g = scene.add.graphics().setDepth(200);
    g.lineStyle(2, color, 0.95);
    const angle = (-60 + i * 30) * (Math.PI / 180);
    g.lineBetween(0, 0, Math.cos(angle) * 14, Math.sin(angle) * 14);
    g.setPosition(x, y);
    scene.tweens.add({
      targets: g,
      x: x + Math.cos(angle) * 18,
      y: y + Math.sin(angle) * 18,
      alpha: 0,
      duration: 220,
      onComplete: () => g.destroy(),
    });
  }
}

function burstRing(scene: Phaser.Scene, x: number, y: number, color: number): void {
  const g = scene.add.graphics().setDepth(200);
  g.lineStyle(3, color, 0.85);
  g.strokeCircle(0, 0, 6);
  g.setPosition(x, y);
  scene.tweens.add({
    targets: g, scaleX: 2.8, scaleY: 2.8, alpha: 0, duration: 360, onComplete: () => g.destroy(),
  });
}

const ELEMENT_BURSTS: Record<string, BurstFn> = {
  flame: (s, x, y, c) => burstCircles(s, x, y, c, 5, 6, -4),
  tide: (s, x, y, c) => {
    burstCircles(s, x, y - 4, c, 4, 8, 6);
    burstCircles(s, x, y + 2, c, 3, 5, 0);
  },
  leaf: (s, x, y, c) => burstCircles(s, x - 6, y, c, 4, 5, -2),
  volt: (s, x, y, c) => burstLines(s, x, y, c),
  stone: (s, x, y, c) => burstCircles(s, x, y + 4, c, 6, 4, 4),
  shadow: (s, x, y, c) => {
    burstCircles(s, x, y, c, 3, 7, 0);
    burstRing(s, x, y, c);
  },
  ice: (s, x, y, c) => burstCircles(s, x, y - 2, c, 5, 5, -6),
  psychic: (s, x, y, c) => burstRing(s, x, y, c),
};

export class BattleAnims {
  constructor(private scene: Phaser.Scene) {}

  animateSendOut(sprite: Phaser.GameObjects.Image, endX: number, isPlayer: boolean): void {
    sprite.setScale(isPlayer ? 2 : 1.5);
    sprite.x = isPlayer ? -80 : GAME_WIDTH + 80;
    sprite.setAlpha(0.6);
    this.scene.tweens.add({
      targets: sprite, x: endX, alpha: 1, scaleX: isPlayer ? 2 : 1.5, scaleY: isPlayer ? 2 : 1.5,
      duration: 480, ease: 'Back.easeOut',
    });
  }

  animateFaint(sprite: Phaser.GameObjects.Image, onDone: () => void): void {
    this.scene.tweens.add({
      targets: sprite, alpha: 0, y: sprite.y + 24, scaleY: 0.15, angle: isPlayerSprite(sprite) ? -12 : 12,
      duration: 550, ease: 'Quad.easeIn',
      onComplete: onDone,
    });
  }

  playHitOnEnemy(enemySprite: Phaser.GameObjects.Image, moveType?: string): void {
    Sfx.hit();
    this.scene.cameras.main.shake(120, 0.004);
    this.scene.tweens.add({ targets: enemySprite, x: 490, duration: 50, yoyo: true, repeat: 3 });
    if (moveType) this.playMoveVfx(moveType, enemySprite.x, enemySprite.y);
  }

  /** Quick lunge toward the opponent before impact. */
  animateAttackLunge(sprite: Phaser.GameObjects.Image, towardEnemy: boolean, onDone?: () => void): void {
    const baseX = sprite.x;
    const delta = towardEnemy ? 28 : -28;
    this.scene.tweens.add({
      targets: sprite, x: baseX + delta, duration: 110, yoyo: true, ease: 'Quad.easeOut',
      onComplete: () => { sprite.x = baseX; onDone?.(); },
    });
  }

  playHitOnPlayer(playerSprite: Phaser.GameObjects.Image, moveType?: string): void {
    Sfx.hit();
    this.scene.cameras.main.shake(120, 0.004);
    this.scene.tweens.add({ targets: playerSprite, x: 150, duration: 50, yoyo: true, repeat: 3 });
    if (moveType) this.playMoveVfx(moveType, playerSprite.x, playerSprite.y);
  }

  playMoveVfx(element: string, x: number, y: number): void {
    const colors: Record<string, number> = {
      flame: 0xff6b35, tide: 0x3b82f6, leaf: 0x22c55e, volt: 0xfacc15,
      stone: 0xa8a29e, shadow: 0x7c3aed, ice: 0x67e8f9, psychic: 0xf472b6,
    };
    const color = colors[element] ?? 0xffffff;
    const burst = ELEMENT_BURSTS[element];
    if (burst) burst(this.scene, x, y, color);
    else burstCircles(this.scene, x, y, color, 4, 5);
  }

  applyEffectivenessTint(
    sprite: Phaser.GameObjects.Image,
    effectiveness: number | undefined,
  ): void {
    if (!effectiveness || effectiveness === 1) return;
    sprite.setTint(effectiveness > 1 ? 0xff4444 : 0x888888);
    this.scene.time.delayedCall(350, () => sprite.clearTint());
  }

  fadeIn(sprite: Phaser.GameObjects.Image, duration = 400): void {
    this.scene.tweens.add({ targets: sprite, alpha: 1, duration });
  }

  playCapture(
    shakes: number,
    caught: boolean,
    onCaught: () => void,
    onFailed: () => void,
  ): void {
    const orb = this.scene.add.image(GAME_WIDTH / 2, 200, 'capture_orb').setScale(3);
    this.scene.tweens.add({
      targets: orb, y: 130, duration: 300,
      onComplete: () => {
        let shakeCount = 0;
        const doShake = () => {
          if (shakeCount >= shakes) {
            if (caught) {
              Sfx.catch();
              orb.destroy();
              onCaught();
            } else {
              orb.destroy();
              onFailed();
            }
            return;
          }
          shakeCount++;
          this.scene.tweens.add({
            targets: orb, angle: { from: -20, to: 20 }, duration: 150, yoyo: true,
            onComplete: doShake,
          });
        };
        doShake();
      },
    });
  }

  evolutionFlash(step: number): void {
    if (step === 0) this.scene.cameras.main.flash(400, 255, 255, 255);
    else this.scene.cameras.main.flash(300, 255, 255, 200);
  }

  fadeOut(duration: number, onComplete: () => void): void {
    this.scene.cameras.main.fadeOut(duration, 0, 0, 0);
    this.scene.time.delayedCall(duration, onComplete);
  }
}
