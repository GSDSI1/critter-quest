import type { Types } from 'phaser';
import { COLORS } from '../data/types';

export { COLORS };

export const FONT = '"Press Start 2P", "Courier New", monospace';

export interface TextStyleOpts {
  stroke?: string;
  strokeThickness?: number;
  shadow?: boolean;
  align?: 'left' | 'center' | 'right';
}

/** Default UI text style with optional stroke/shadow for dark panels. */
export function textStyle(
  fontSize: string,
  color: string,
  opts: TextStyleOpts = {},
): Types.GameObjects.Text.TextStyle {
  const style: Types.GameObjects.Text.TextStyle = {
    fontFamily: FONT,
    fontSize,
    color,
    align: opts.align ?? 'left',
  };
  if (opts.stroke) {
    style.stroke = opts.stroke;
    style.strokeThickness = opts.strokeThickness ?? 2;
  } else if (opts.shadow !== false && (color === '#f5c542' || color === '#f0f0f0' || color === '#c0c0c0')) {
    style.stroke = '#0a0a12';
    style.strokeThickness = 1;
  }
  return style;
}

export function titleStyle(fontSize = '20px'): Types.GameObjects.Text.TextStyle {
  return textStyle(fontSize, '#f5c542', { stroke: '#1a1a2e', strokeThickness: 2 });
}

export function bodyStyle(fontSize = '12px', color = '#c0c0c0'): Types.GameObjects.Text.TextStyle {
  return textStyle(fontSize, color);
}

export function hintStyle(fontSize = '10px'): Types.GameObjects.Text.TextStyle {
  return textStyle(fontSize, '#8899aa', { shadow: false });
}
