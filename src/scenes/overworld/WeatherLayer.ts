import Phaser from 'phaser';
import type { Weather } from '../../systems/weather';
import { GAME_WIDTH, GAME_HEIGHT } from '../../data/types';

export interface WeatherLayerHandle {
  destroy: () => void;
}

export interface WeatherLayerOpts {
  /** Lighter particle count for battle scenes. */
  light?: boolean;
}

function ensureRainTexture(scene: Phaser.Scene): string {
  const key = 'weather_rain';
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xa8c8e8, 0.55);
    g.fillRect(0, 0, 2, 10);
    g.generateTexture(key, 2, 10);
    g.destroy();
  }
  return key;
}

function ensureHailTexture(scene: Phaser.Scene): string {
  const key = 'weather_hail';
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(2, 2, 2);
    g.generateTexture(key, 4, 4);
    g.destroy();
  }
  return key;
}

function pin(
  obj: Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.ScrollFactor,
  depth: number,
  scrollFactor: number,
): void {
  obj.setDepth(depth).setScrollFactor(scrollFactor);
}

/** Overworld / battle weather particles and atmosphere. */
export function buildWeatherLayer(
  scene: Phaser.Scene,
  weather: Weather,
  depth = 850,
  scrollFactor = 0,
  opts: WeatherLayerOpts = {},
): WeatherLayerHandle | null {
  if (!weather) return null;

  const light = opts.light ?? depth < 100;
  const parts: Phaser.GameObjects.GameObject[] = [];
  const timers: Phaser.Time.TimerEvent[] = [];
  const emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  if (weather === 'rain') {
    const rainKey = ensureRainTexture(scene);
    const emitter = scene.add.particles(0, 0, rainKey, {
      x: { min: -10, max: GAME_WIDTH + 10 },
      y: { min: -20, max: 0 },
      speedX: { min: -60, max: -20 },
      speedY: { min: light ? 140 : 200, max: light ? 220 : 320 },
      lifespan: light ? 900 : 1100,
      quantity: light ? 1 : 2,
      frequency: light ? 60 : 35,
      alpha: { start: 0.45, end: 0.05 },
      scale: { start: 1, end: 0.6 },
      emitting: true,
    });
    pin(emitter, depth, scrollFactor);
    parts.push(emitter);
    emitters.push(emitter);
  }

  if (weather === 'hail') {
    const hailKey = ensureHailTexture(scene);
    const count = light ? 12 : 20;
    const emitter = scene.add.particles(0, 0, hailKey, {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: -10, max: GAME_HEIGHT * 0.3 },
      speedX: { min: -12, max: 12 },
      speedY: { min: 80, max: 160 },
      lifespan: { min: 600, max: 1200 },
      quantity: light ? 1 : 2,
      frequency: light ? 120 : 80,
      alpha: { min: 0.35, max: 0.85 },
      scale: { min: 0.6, max: 1.1 },
      emitting: true,
    });
    pin(emitter, depth, scrollFactor);
    parts.push(emitter);
    emitters.push(emitter);
    if (!light) {
      timers.push(scene.time.addEvent({
        delay: 2200,
        loop: true,
        callback: () => {
          if (scene.cameras.main) scene.cameras.main.shake(80, 0.002);
        },
      }));
    }
  }

  if (weather === 'sun') {
    const warm = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffcc66, light ? 0.05 : 0.08);
    pin(warm, depth, scrollFactor);
    parts.push(warm);
    const rayCount = light ? 2 : 4;
    for (let i = 0; i < rayCount; i++) {
      const ray = scene.add.ellipse(
        GAME_WIDTH * (0.25 + i * 0.25),
        -20,
        50 + i * 16,
        GAME_HEIGHT * 0.85,
        0xfff5cc,
        0.05,
      );
      pin(ray, depth, scrollFactor);
      parts.push(ray);
      scene.tweens.add({
        targets: ray,
        alpha: 0.015,
        duration: 1800 + i * 400,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  return {
    destroy: () => {
      timers.forEach(t => t.destroy());
      emitters.forEach(e => e.destroy());
      parts.forEach(p => p.destroy());
    },
  };
}
