import { describe, it, expect, beforeEach } from 'vitest';
import { creatureTexRef, creatureFrameName, setAssetMeta } from '../assetLoader';

function mockScene(textures: Record<string, Set<string>>): import('phaser').Scene {
  return {
    textures: {
      exists: (key: string) => key in textures,
      getFrame: (key: string, frame: string) => {
        const frames = textures[key];
        return frames?.has(frame) ? { name: frame } : null;
      },
    },
  } as unknown as import('phaser').Scene;
}

describe('creatureTexRef', () => {
  beforeEach(() => {
    setAssetMeta({ placeholder: false, version: 3, atlas: true });
  });

  it('falls back to procedural when atlas frame is missing', () => {
    const scene = mockScene({
      critters_atlas: new Set(['mossling', 'emberpup']),
    });
    const ref = creatureTexRef(scene, 'pebblite', false, 'front');
    expect(ref.key).toBe('creature_pebblite');
    expect(ref.frame).toBeUndefined();
  });

  it('uses atlas when frame exists', () => {
    const frame = creatureFrameName('mossling', false, 'front');
    const scene = mockScene({
      critters_atlas: new Set([frame]),
    });
    const ref = creatureTexRef(scene, 'mossling', false, 'front');
    expect(ref.key).toBe('critters_atlas');
    expect(ref.frame).toBe(frame);
  });

  it('prefers individual PNG over procedural when present', () => {
    const scene = mockScene({
      ext_creature_pebblite: new Set(['__BASE']),
    });
    const ref = creatureTexRef(scene, 'pebblite', false, 'front');
    expect(ref.key).toBe('ext_creature_pebblite');
  });
});
