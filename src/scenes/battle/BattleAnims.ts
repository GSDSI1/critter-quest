import Phaser from 'phaser';
import { GAME_WIDTH } from '../../data/types';
import { Sfx } from '../../utils/audio';

function isPlayerSprite(sprite: Phaser.GameObjects.Image): boolean {
  return sprite.x < GAME_WIDTH / 2;
}

const ELEMENT_COLORS: Record<string, number> = {
  flame: 0xff6b35, tide: 0x3b82f6, leaf: 0x22c55e, volt: 0xfacc15,
  stone: 0xa8a29e, shadow: 0x7c3aed, ice: 0x67e8f9, psychic: 0xf472b6,
};

type EmitterCfg = {
  count: number;
  speed: { min: number; max: number };
  angle: { min: number; max: number };
  scale: { start: number; end: number };
  lifespan: number;
  gravityY?: number;
  tint?: number;
};

const ELEMENT_EMITTERS: Record<string, EmitterCfg> = {
  flame: { count: 14, speed: { min: 40, max: 120 }, angle: { min: 240, max: 300 }, scale: { start: 0.5, end: 0 }, lifespan: 380, gravityY: -30 },
  tide: { count: 12, speed: { min: 30, max: 90 }, angle: { min: 200, max: 340 }, scale: { start: 0.45, end: 0 }, lifespan: 420, gravityY: 60 },
  leaf: { count: 10, speed: { min: 25, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 500, gravityY: 20 },
  volt: { count: 16, speed: { min: 80, max: 180 }, angle: { min: 0, max: 360 }, scale: { start: 0.35, end: 0 }, lifespan: 220 },
  stone: { count: 12, speed: { min: 50, max: 110 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0.1 }, lifespan: 350, gravityY: 80 },
  shadow: { count: 10, speed: { min: 20, max: 55 }, angle: { min: 0, max: 360 }, scale: { start: 0.55, end: 0 }, lifespan: 450 },
  ice: { count: 12, speed: { min: 35, max: 90 }, angle: { min: 220, max: 320 }, scale: { start: 0.4, end: 0 }, lifespan: 400, gravityY: 40 },
  psychic: { count: 14, speed: { min: 15, max: 45 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 480 },
};

export class BattleAnims {
  private particleKey = 'battle_particle';

  constructor(private scene: Phaser.Scene) {
    if (!scene.textures.exists(this.particleKey)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture(this.particleKey, 8, 8);
      g.destroy();
    }
  }

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

  playHitOnEnemy(enemySprite: Phaser.GameObjects.Image, moveType?: string, effectiveness?: number): void {
    Sfx.hit();
    this.scene.cameras.main.shake(120, 0.004);
    this.scene.tweens.add({ targets: enemySprite, x: 490, duration: 50, yoyo: true, repeat: 3 });
    if (moveType) this.playMoveVfx(moveType, enemySprite.x, enemySprite.y);
    if (effectiveness && effectiveness >= 2) this.flashSuperEffective();
  }

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
    const color = ELEMENT_COLORS[element] ?? 0xffffff;
    const cfg = ELEMENT_EMITTERS[element] ?? ELEMENT_EMITTERS.flame;
    const emitter = this.scene.add.particles(x, y, this.particleKey, {
      speed: cfg.speed,
      angle: cfg.angle,
      scale: cfg.scale,
      lifespan: cfg.lifespan,
      gravityY: cfg.gravityY ?? 0,
      tint: color,
      quantity: cfg.count,
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(200);
    emitter.explode(cfg.count);
    this.scene.time.delayedCall(cfg.lifespan + 80, () => emitter.destroy());
  }

  private flashSuperEffective(): void {
    this.scene.cameras.main.flash(180, 255, 255, 255, false, undefined, 0.35);
  }

  applyEffectivenessTint(
    sprite: Phaser.GameObjects.Image,
    effectiveness: number | undefined,
  ): void {
    if (!effectiveness || effectiveness === 1) return;
    sprite.setTint(effectiveness > 1 ? 0xff4444 : 0x888888);
    this.scene.time.delayedCall(350, () => sprite.clearTint());
  }

  animateMiss(sprite: Phaser.GameObjects.Image, onDone?: () => void): void {
    const baseX = sprite.x;
    this.scene.tweens.add({
      targets: sprite,
      x: baseX + (isPlayerSprite(sprite) ? -18 : 18),
      alpha: 0.6,
      duration: 120,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => { sprite.x = baseX; sprite.setAlpha(1); onDone?.(); },
    });
  }

  animateHeal(sprite: Phaser.GameObjects.Image): void {
    this.scene.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * 1.08,
      scaleY: sprite.scaleY * 1.08,
      duration: 180,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
    const emitter = this.scene.add.particles(sprite.x, sprite.y, this.particleKey, {
      speed: { min: 20, max: 50 },
      angle: { min: 240, max: 300 },
      scale: { start: 0.4, end: 0 },
      lifespan: 400,
      gravityY: -40,
      tint: 0x22c55e,
      quantity: 8,
      emitting: false,
      blendMode: 'ADD',
    }).setDepth(200);
    emitter.explode(8);
    this.scene.time.delayedCall(480, () => emitter.destroy());
  }

  animateStatBoost(sprite: Phaser.GameObjects.Image, up: boolean): void {
    const tint = up ? 0x44ff88 : 0xff6644;
    sprite.setTint(tint);
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y - (up ? 6 : 0),
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => sprite.clearTint(),
    });
  }

  animateStatusInflict(sprite: Phaser.GameObjects.Image, moveType?: string): void {
    const color = ELEMENT_COLORS[moveType ?? 'shadow'] ?? 0xffffff;
    sprite.setTint(color);
    this.scene.time.delayedCall(280, () => sprite.clearTint());
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
