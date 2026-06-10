import Phaser from 'phaser';
import { CREATURES } from '../data/creatures';

export const NPC_ROLES = ['generic', 'nurse', 'clerk', 'trainer_m', 'trainer_f', 'rival', 'leader', 'prof'] as const;
export type NpcRole = typeof NPC_ROLES[number];

export const EXTERNAL_CRITTERS = Object.keys(CREATURES);

export const SFX_KEYS = [
  'menu_select', 'menu_confirm', 'hit', 'level_up', 'catch', 'heal', 'battle_start',
] as const;

export interface AssetMeta {
  placeholder: boolean;
  version: number;
}

let assetMeta: AssetMeta = { placeholder: true, version: 1 };

export function setAssetMeta(meta: AssetMeta): void {
  assetMeta = meta;
}

export function isPlaceholderAssets(): boolean {
  return assetMeta.placeholder;
}

export function preloadAssetMeta(scene: Phaser.Scene): void {
  scene.load.json('asset_meta', 'assets/meta.json');
}

export function preloadExternalArt(scene: Phaser.Scene): void {
  scene.load.spritesheet('ext_tileset', 'assets/tiles/tileset.png', {
    frameWidth: 16,
    frameHeight: 16,
  });
  for (const id of EXTERNAL_CRITTERS) {
    scene.load.image(`ext_creature_${id}`, `assets/critters/${id}.png`);
    scene.load.image(`ext_creature_${id}_f2`, `assets/critters/${id}_f2.png`);
    scene.load.image(`ext_creature_${id}_back`, `assets/critters/${id}_back.png`);
    scene.load.image(`ext_creature_${id}_sm`, `assets/critters/${id}_sm.png`);
    scene.load.image(`ext_creature_${id}_sm_f2`, `assets/critters/${id}_sm_f2.png`);
    scene.load.image(`ext_creature_${id}_sm_back`, `assets/critters/${id}_sm_back.png`);
  }
  for (const role of NPC_ROLES) {
    scene.load.image(`ext_npc_${role}`, `assets/npcs/${role}.png`);
  }
  for (const key of SFX_KEYS) {
    scene.load.audio(`sfx_${key}`, `assets/audio/${key}.wav`);
  }
}

export function preloadExternalAssets(scene: Phaser.Scene): void {
  preloadAssetMeta(scene);
  preloadExternalArt(scene);
}

export function applyLoadedAssetMeta(scene: Phaser.Scene): void {
  try {
    const meta = scene.cache.json.get('asset_meta') as AssetMeta | undefined;
    if (meta && typeof meta.placeholder === 'boolean') {
      setAssetMeta(meta);
    }
  } catch {
    setAssetMeta({ placeholder: true, version: 1 });
  }
}

function isRealExternalTexture(scene: Phaser.Scene, extKey: string): boolean {
  if (isPlaceholderAssets()) return false;
  return scene.textures.exists(extKey);
}

export type CreatureTextureVariant = 'front' | 'f2' | 'back';

export function creatureTextureKey(
  scene: Phaser.Scene,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): string {
  let suffix = small ? '_sm' : '';
  if (variant === 'f2') suffix += '_f2';
  if (variant === 'back') suffix += '_back';
  const ext = `ext_creature_${speciesId}${suffix}`;
  const proc = `creature_${speciesId}${small ? '_sm' : ''}`;
  if (isRealExternalTexture(scene, ext)) return ext;
  return proc;
}

export function startCritterIdle(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Image,
  speciesId: string,
  bobY?: number,
): void {
  const f1 = creatureTextureKey(scene, speciesId, false, 'front');
  const f2 = creatureTextureKey(scene, speciesId, false, 'f2');
  const hasF2 = f2 !== f1 && scene.textures.exists(f2);
  if (hasF2) {
    let frame = 0;
    scene.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        frame = 1 - frame;
        sprite.setTexture(frame ? f2 : f1);
      },
    });
  }
  const baseY = bobY ?? sprite.y;
  scene.tweens.add({
    targets: sprite, y: baseY - 3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
}

export function npcTextureKey(scene: Phaser.Scene, role: NpcRole = 'generic'): string {
  const ext = `ext_npc_${role}`;
  return isRealExternalTexture(scene, ext) ? ext : `npc_${role}`;
}

export function hasExternalCreature(scene: Phaser.Scene, id: string): boolean {
  return isRealExternalTexture(scene, `ext_creature_${id}`);
}

export function isExternalTilesetAvailable(scene: Phaser.Scene): boolean {
  return !isPlaceholderAssets() && scene.textures.exists('ext_tileset');
}

export function battleBgForMap(mapId: string): string {
  if (mapId.includes('gym')) return 'battle_bg_gym';
  if (mapId === 'volcanic_path' || mapId.includes('ember') || mapId === 'route3') return 'battle_bg_volcano';
  if (mapId.includes('cave') || mapId === 'crystal_cave') return 'battle_bg_cave';
  if (mapId.includes('forest') || mapId.startsWith('route')) return 'battle_bg_forest';
  return 'battle_bg';
}
