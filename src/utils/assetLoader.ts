import Phaser from 'phaser';
import { CREATURES } from '../data/creatures';

export const NPC_ROLES = ['generic', 'nurse', 'clerk', 'trainer_m', 'trainer_f', 'rival', 'leader', 'prof'] as const;
export type NpcRole = typeof NPC_ROLES[number];

export const EXTERNAL_CRITTERS = Object.keys(CREATURES);

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

/** Load meta.json only — used at boot before deciding whether to fetch PNG art. */
export function preloadAssetMeta(scene: Phaser.Scene): void {
  scene.load.json('asset_meta', 'assets/meta.json');
}

/** Load external PNG art (skip when meta.json has placeholder: true). */
export function preloadExternalArt(scene: Phaser.Scene): void {
  scene.load.spritesheet('ext_tileset', 'assets/tiles/tileset.png', {
    frameWidth: 16,
    frameHeight: 16,
  });
  for (const id of EXTERNAL_CRITTERS) {
    scene.load.image(`ext_creature_${id}`, `assets/critters/${id}.png`);
    scene.load.image(`ext_creature_${id}_sm`, `assets/critters/${id}_sm.png`);
  }
  for (const role of NPC_ROLES) {
    scene.load.image(`ext_npc_${role}`, `assets/npcs/${role}.png`);
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

export function creatureTextureKey(scene: Phaser.Scene, speciesId: string, small = false): string {
  const ext = small ? `ext_creature_${speciesId}_sm` : `ext_creature_${speciesId}`;
  const proc = small ? `creature_${speciesId}_sm` : `creature_${speciesId}`;
  return isRealExternalTexture(scene, ext) ? ext : proc;
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
