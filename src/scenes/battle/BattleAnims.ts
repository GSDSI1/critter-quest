import Phaser from 'phaser';
import { GAME_WIDTH } from '../../data/types';
import { Sfx } from '../../utils/audio';

export class BattleAnims {
  constructor(private scene: Phaser.Scene) {}

  addIdleBob(sprite: Phaser.GameObjects.Image, y: number, duration: number): void {
    this.scene.tweens.add({
      targets: sprite, y, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  animateSendOut(sprite: Phaser.GameObjects.Image, endX: number, isPlayer: boolean): void {
    sprite.x = isPlayer ? -80 : GAME_WIDTH + 80;
    this.scene.tweens.add({ targets: sprite, x: endX, duration: 450, ease: 'Back.easeOut' });
  }

  animateFaint(sprite: Phaser.GameObjects.Image, onDone: () => void): void {
    this.scene.tweens.add({
      targets: sprite, alpha: 0, y: sprite.y + 30, duration: 500,
      onComplete: onDone,
    });
  }

  playHitOnEnemy(enemySprite: Phaser.GameObjects.Image, moveType?: string): void {
    Sfx.hit();
    this.scene.cameras.main.shake(120, 0.004);
    this.scene.tweens.add({ targets: enemySprite, x: 490, duration: 50, yoyo: true, repeat: 3 });
    if (moveType) this.playMoveVfx(moveType, enemySprite.x, enemySprite.y);
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
    const g = this.scene.add.graphics().setDepth(200);
    g.fillStyle(colors[element] ?? 0xffffff, 0.85);
    g.fillCircle(x, y, 10);
    this.scene.tweens.add({
      targets: g, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 320,
      onComplete: () => g.destroy(),
    });
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
