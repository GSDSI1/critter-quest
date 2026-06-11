import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, TYPE_COLORS } from '../../data/types';
import { lighten } from './colors';

function generateDecorAssets(scene: Phaser.Scene): void {
  const lightG = scene.make.graphics({ x: 0, y: 0 });
  lightG.fillStyle(0xf5f5f4, 0.3);
  lightG.fillRect(0, 0, 16, 16);
  lightG.fillStyle(0xfbbf24, 1);
  lightG.fillRect(4, 2, 8, 4);
  lightG.fillStyle(0xfde68a, 0.6);
  lightG.fillRect(2, 6, 12, 6);
  lightG.generateTexture('decor_light', 16, 16);
  lightG.destroy();

  const plantG = scene.make.graphics({ x: 0, y: 0 });
  plantG.fillStyle(0x166534, 1);
  plantG.fillRect(6, 10, 4, 6);
  plantG.fillStyle(0x22c55e, 1);
  plantG.fillCircle(8, 7, 5);
  plantG.fillStyle(0x15803d, 0.8);
  plantG.fillCircle(5, 9, 3);
  plantG.fillCircle(11, 9, 3);
  plantG.generateTexture('decor_plant', 16, 16);
  plantG.destroy();

  const posterG = scene.make.graphics({ x: 0, y: 0 });
  posterG.fillStyle(0x92400e, 1);
  posterG.fillRect(5, 2, 6, 8);
  posterG.fillStyle(0x3b82f6, 1);
  posterG.fillRect(6, 3, 4, 4);
  posterG.fillStyle(0xfbbf24, 1);
  posterG.fillRect(7, 5, 2, 2);
  posterG.generateTexture('decor_poster', 16, 16);
  posterG.destroy();

  const signG = scene.make.graphics({ x: 0, y: 0 });
  signG.fillStyle(COLORS.grass, 1);
  signG.fillRect(0, 0, 16, 16);
  signG.fillStyle(0x92400e, 1);
  signG.fillRect(7, 8, 2, 8);
  signG.fillStyle(0xb45309, 1);
  signG.fillRect(2, 4, 12, 6);
  signG.fillStyle(0xfbbf24, 1);
  signG.fillRect(4, 5, 8, 2);
  signG.generateTexture('sign_post', 16, 16);
  signG.destroy();
}

export function generateUiAssets(scene: Phaser.Scene): void {
  generateDecorAssets(scene);

  if (!scene.textures.exists('ui_panel')) {
    const panelG = scene.make.graphics({ x: 0, y: 0 });
    panelG.fillStyle(COLORS.panel, 0.98);
    panelG.fillRoundedRect(0, 0, 48, 48, 10);
    panelG.lineStyle(2, COLORS.gold, 1);
    panelG.strokeRoundedRect(0, 0, 48, 48, 10);
    panelG.lineStyle(1, lighten(COLORS.gold, 30), 0.5);
    panelG.strokeRoundedRect(3, 3, 42, 42, 8);
    panelG.fillStyle(COLORS.accent, 0.2);
    panelG.fillRect(6, 6, 36, 3);
    panelG.fillStyle(COLORS.gold, 0.9);
    panelG.fillRect(4, 4, 4, 4);
    panelG.fillRect(40, 4, 4, 4);
    panelG.fillRect(4, 40, 4, 4);
    panelG.fillRect(40, 40, 4, 4);
    panelG.generateTexture('ui_panel', 48, 48);
    panelG.destroy();
  }

  const labG = scene.make.graphics({ x: 0, y: 0 });
  labG.fillGradientStyle(0x2d3748, 0x2d3748, 0x4a5568, 0x553c9a, 1);
  labG.fillRect(0, 0, 640, 480);
  labG.fillStyle(0xe2e8f0, 1);
  labG.fillRect(0, 340, 640, 140);
  for (let x = 0; x < 640; x += 32) {
    labG.fillStyle((x / 32) % 2 === 0 ? 0xcbd5e1 : 0xe2e8f0, 0.6);
    labG.fillRect(x, 340, 32, 140);
  }
  labG.lineStyle(2, 0x94a3b8, 0.5);
  labG.lineBetween(0, 340, 640, 340);
  labG.fillStyle(0x78350f, 1);
  labG.fillRect(24, 60, 80, 200);
  labG.fillRect(536, 60, 80, 200);
  labG.fillStyle(0x92400e, 1);
  for (let row = 0; row < 5; row++) {
    labG.fillRect(28, 80 + row * 38, 72, 4);
    labG.fillRect(540, 80 + row * 38, 72, 4);
    labG.fillStyle(0x6366f1, 0.7);
    labG.fillRect(32 + (row % 3) * 18, 88 + row * 38, 14, 22);
    labG.fillStyle(0x22c55e, 0.7);
    labG.fillRect(52 + (row % 2) * 16, 88 + row * 38, 14, 22);
    labG.fillStyle(0x92400e, 1);
  }
  labG.fillStyle(0x0ea5e9, 0.25);
  labG.fillRoundedRect(268, 20, 104, 56, 6);
  labG.lineStyle(2, 0x94a3b8, 0.8);
  labG.strokeRoundedRect(268, 20, 104, 56, 6);
  labG.lineStyle(2, 0xcbd5e1, 0.6);
  labG.lineBetween(320, 20, 320, 76);
  labG.lineBetween(268, 48, 372, 48);
  labG.fillStyle(0xffffff, 0.1);
  labG.fillTriangle(276, 28, 300, 28, 276, 44);
  labG.fillStyle(0x4338ca, 1);
  labG.fillRoundedRect(100, 300, 440, 18, 4);
  labG.fillStyle(0x312e81, 1);
  labG.fillRect(100, 318, 440, 6);
  labG.generateTexture('starter_lab_bg', 640, 480);
  labG.destroy();

  for (const [type, color] of [['flame', 0xff6b35], ['tide', 0x3b82f6], ['leaf', 0x22c55e]] as const) {
    const og = scene.make.graphics({ x: 0, y: 0 });
    const c = color as number;
    og.fillStyle(0x44403c, 1);
    og.fillRoundedRect(14, 52, 36, 10, 3);
    og.fillStyle(0x57534e, 1);
    og.fillRoundedRect(18, 48, 28, 6, 2);
    og.fillStyle(c, 0.25);
    og.fillCircle(32, 30, 28);
    og.fillStyle(0xffffff, 1);
    og.fillCircle(32, 28, 24);
    og.fillStyle(0xf0f0f0, 1);
    og.fillCircle(32, 30, 22);
    og.fillStyle(c, 1);
    og.fillCircle(32, 28, 17);
    og.fillStyle(lighten(c, 50), 0.7);
    og.fillCircle(24, 20, 7);
    og.fillStyle(0xffffff, 0.35);
    og.fillEllipse(38, 22, 8, 5);
    og.lineStyle(4, 0x1a1a2e, 1);
    og.strokeCircle(32, 28, 22);
    og.fillStyle(0x1a1a2e, 1);
    og.fillRect(8, 26, 48, 4);
    og.fillStyle(lighten(c, 30), 1);
    og.fillCircle(32, 28, 6);
    og.fillStyle(0xffffff, 0.5);
    og.fillCircle(30, 26, 2);
    og.generateTexture(`starter_orb_${type}`, 64, 64);
    og.destroy();
  }

  for (const [type, color] of Object.entries(TYPE_COLORS)) {
    const tg = scene.make.graphics({ x: 0, y: 0 });
    tg.fillStyle(color, 1);
    tg.fillCircle(8, 8, 7);
    tg.fillStyle(lighten(color as number, 40), 1);
    tg.fillCircle(6, 6, 2);
    tg.generateTexture(`type_${type}`, 16, 16);
    tg.destroy();
  }

  const footprintShapes: Record<string, number> = {
    blob: 0xc0c0c0, quadruped: 0xa89070, serpent: 0x8899aa, avian: 0x667788,
    humanoid: 0x996633, crystalline: 0xb794f6,
  };
  for (const [shape, color] of Object.entries(footprintShapes)) {
    const fg = scene.make.graphics({ x: 0, y: 0 });
    fg.fillStyle(color, 1);
    if (shape === 'avian') {
      fg.fillTriangle(8, 2, 4, 12, 12, 12);
    } else if (shape === 'serpent') {
      fg.fillEllipse(8, 8, 12, 6);
    } else {
      fg.fillCircle(5, 10, 3);
      fg.fillCircle(11, 10, 3);
      fg.fillEllipse(8, 6, 8, 5);
    }
    fg.generateTexture(`footprint_${shape}`, 16, 16);
    fg.destroy();
  }

  const panelG = scene.make.graphics({ x: 0, y: 0 });
  panelG.fillStyle(COLORS.panel, 0.95);
  panelG.fillRoundedRect(0, 0, 200, 80, 8);
  panelG.lineStyle(2, COLORS.panelBorder, 1);
  panelG.strokeRoundedRect(0, 0, 200, 80, 8);
  panelG.generateTexture('panel', 200, 80);
  panelG.destroy();

  for (const [key, fill, border] of [
    ['btn_normal', COLORS.panel, COLORS.panelBorder],
    ['btn_selected', COLORS.panelBorder, COLORS.gold],
    ['btn_hover', lighten(COLORS.panel, 12), COLORS.gold],
  ] as const) {
    const btn = scene.make.graphics({ x: 0, y: 0 });
    btn.fillStyle(fill, 0.95);
    btn.fillRoundedRect(0, 0, 200, 36, 6);
    btn.lineStyle(2, border, 1);
    btn.strokeRoundedRect(0, 0, 200, 36, 6);
    if (key === 'btn_hover') {
      btn.fillStyle(COLORS.gold, 0.15);
      btn.fillRect(4, 4, 192, 4);
    }
    btn.generateTexture(key, 200, 36);
    btn.destroy();
  }

  const dialogG = scene.make.graphics({ x: 0, y: 0 });
  const dw = GAME_WIDTH - 32;
  dialogG.fillStyle(COLORS.panel, 0.97);
  dialogG.fillRoundedRect(0, 0, dw, 96, 10);
  dialogG.lineStyle(2, COLORS.gold, 1);
  dialogG.strokeRoundedRect(0, 0, dw, 96, 10);
  dialogG.lineStyle(1, lighten(COLORS.gold, 25), 0.4);
  dialogG.strokeRoundedRect(3, 3, dw - 6, 90, 8);
  dialogG.fillStyle(COLORS.accent, 0.15);
  dialogG.fillRect(8, 8, dw - 16, 3);
  dialogG.fillStyle(COLORS.gold, 0.85);
  dialogG.fillRect(6, 6, 5, 5);
  dialogG.fillRect(dw - 11, 6, 5, 5);
  dialogG.generateTexture('dialog_frame', dw, 96);
  dialogG.destroy();

  const ctrlG = scene.make.graphics({ x: 0, y: 0 });
  ctrlG.fillStyle(COLORS.panel, 0.97);
  ctrlG.fillRoundedRect(0, 0, 560, 320, 12);
  ctrlG.lineStyle(3, COLORS.gold, 1);
  ctrlG.strokeRoundedRect(0, 0, 560, 320, 12);
  ctrlG.generateTexture('controls_panel', 560, 320);
  ctrlG.destroy();

  const titleG = scene.make.graphics({ x: 0, y: 0 });
  titleG.fillStyle(COLORS.panel, 0.95);
  titleG.fillRoundedRect(0, 0, 420, 72, 10);
  titleG.lineStyle(3, COLORS.gold, 1);
  titleG.strokeRoundedRect(0, 0, 420, 72, 10);
  titleG.fillStyle(COLORS.accent, 0.4);
  titleG.fillTriangle(0, 0, 40, 0, 0, 40);
  titleG.fillTriangle(420, 0, 380, 0, 420, 40);
  titleG.fillStyle(COLORS.panelBorder, 0.6);
  titleG.fillRect(12, 60, 396, 4);
  titleG.generateTexture('title_banner', 420, 72);
  titleG.destroy();

  const platG = scene.make.graphics({ x: 0, y: 0 });
  platG.fillStyle(0x000000, 0.2);
  platG.fillEllipse(60, 20, 118, 38);
  platG.fillStyle(0x4ade80, 0.15);
  platG.fillEllipse(60, 18, 100, 28);
  platG.lineStyle(1, 0xffffff, 0.1);
  platG.strokeEllipse(60, 20, 118, 38);
  platG.generateTexture('battle_platform', 120, 40);
  platG.destroy();

  const orbG = scene.make.graphics({ x: 0, y: 0 });
  orbG.fillStyle(0xffffff, 1);
  orbG.fillCircle(8, 8, 7);
  orbG.fillStyle(COLORS.accent, 1);
  orbG.fillCircle(8, 8, 5);
  orbG.lineStyle(2, 0x333333, 1);
  orbG.strokeCircle(8, 8, 7);
  orbG.lineBetween(2, 8, 14, 8);
  orbG.generateTexture('capture_orb', 16, 16);
  orbG.destroy();
}
