import Phaser from 'phaser';
import { CREATURES } from '../data/creatures';

export const NPC_ROLES = ['generic', 'nurse', 'clerk', 'trainer_m', 'trainer_f', 'rival', 'leader', 'prof'] as const;
export type NpcRole = typeof NPC_ROLES[number];

export const EXTERNAL_CRITTERS = Object.keys(CREATURES);

/** Loaded at boot when not using atlas — starters + first-route wild. */
export const BOOT_SPECIES = ['emberpup', 'aqualet', 'leafkit', 'mossling', 'cinderkit', 'thornling', 'sparkbit'] as const;

const CREATURE_SUFFIXES = ['', '_f2', '_back', '_sm', '_sm_f2', '_sm_back'] as const;
const LG_ATLAS = 'critters_atlas';
const SM_ATLAS = 'critters_sm_atlas';

export const SFX_KEYS = [
  'menu_select', 'menu_confirm', 'hit', 'level_up', 'catch', 'heal', 'battle_start',
  'footstep_grass', 'footstep_path',
] as const;

export const BGM_KEYS = ['overworld', 'battle', 'town'] as const;

export interface AssetMeta {
  placeholder: boolean;
  version: number;
  atlas?: boolean;
}

let assetMeta: AssetMeta = { placeholder: true, version: 1 };

export function setAssetMeta(meta: AssetMeta): void {
  assetMeta = meta;
}

export function isPlaceholderAssets(): boolean {
  return assetMeta.placeholder;
}

export function usesCreatureAtlas(scene?: Phaser.Scene): boolean {
  if (isPlaceholderAssets() || !assetMeta.atlas) return false;
  return scene ? scene.textures.exists(LG_ATLAS) : true;
}

export function preloadAssetMeta(scene: Phaser.Scene): void {
  scene.load.json('asset_meta', 'assets/meta.json');
}

export function creatureFrameName(
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): string {
  let name = speciesId;
  if (small) name += '_sm';
  if (variant === 'f2') name += '_f2';
  if (variant === 'back') name += '_back';
  return name;
}

export interface CreatureTexRef {
  key: string;
  frame?: string;
}

export function creatureTexRef(
  scene: Phaser.Scene,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): CreatureTexRef {
  const frame = creatureFrameName(speciesId, small, variant);
  if (usesCreatureAtlas(scene)) {
    const atlasKey = small ? SM_ATLAS : LG_ATLAS;
    if (scene.textures.exists(atlasKey)) return { key: atlasKey, frame };
  }
  return { key: creatureTextureKey(scene, speciesId, small, variant) };
}

export function addCreatureImage(
  scene: Phaser.Scene,
  x: number,
  y: number,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): Phaser.GameObjects.Image {
  const ref = creatureTexRef(scene, speciesId, small, variant);
  return ref.frame
    ? scene.add.image(x, y, ref.key, ref.frame)
    : scene.add.image(x, y, ref.key);
}

export function applyCreatureTexture(
  target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
  scene: Phaser.Scene,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): void {
  const ref = creatureTexRef(scene, speciesId, small, variant);
  if (ref.frame) target.setTexture(ref.key, ref.frame);
  else target.setTexture(ref.key);
}

function queueCreatureFiles(scene: Phaser.Scene, id: string): void {
  for (const suffix of CREATURE_SUFFIXES) {
    const key = `ext_creature_${id}${suffix}`;
    if (scene.textures.exists(key)) continue;
    scene.load.image(key, `assets/critters/${id}${suffix}.png`);
  }
}

function startQueuedLoads(scene: Phaser.Scene): Promise<void> {
  if (scene.load.totalToLoad === 0) return Promise.resolve();
  return new Promise(resolve => {
    scene.load.once('complete', () => resolve());
    scene.load.start();
  });
}

function queueCritterAtlases(scene: Phaser.Scene): void {
  if (!scene.textures.exists(LG_ATLAS)) {
    scene.load.atlas(LG_ATLAS, 'assets/critters/atlas.png', 'assets/critters/atlas.json');
  }
  if (!scene.textures.exists(SM_ATLAS)) {
    scene.load.atlas(SM_ATLAS, 'assets/critters/atlas-sm.png', 'assets/critters/atlas-sm.json');
  }
}

/** Tileset, NPCs, SFX, and critter art (atlas or boot-critical PNGs). */
export function preloadBootArt(scene: Phaser.Scene): void {
  scene.load.spritesheet('ext_tileset', 'assets/tiles/tileset.png', {
    frameWidth: 16,
    frameHeight: 16,
  });
  if (usesCreatureAtlas(scene)) {
    queueCritterAtlases(scene);
  } else {
    for (const id of BOOT_SPECIES) queueCreatureFiles(scene, id);
  }
  for (const role of NPC_ROLES) {
    scene.load.image(`ext_npc_${role}`, `assets/npcs/${role}.png`);
  }
  for (const key of SFX_KEYS) {
    scene.load.audio(`sfx_${key}`, `assets/audio/${key}.wav`);
  }
  for (const theme of BGM_KEYS) {
    scene.load.audio(`bgm_${theme}`, `assets/audio/music_${theme}.wav`);
  }
}

/** Load specific species PNGs on demand (skipped when atlas is loaded). */
export function preloadCreatureTextures(scene: Phaser.Scene, ids: string[]): Promise<void> {
  if (isPlaceholderAssets() || usesCreatureAtlas(scene)) return Promise.resolve();
  for (const id of ids) queueCreatureFiles(scene, id);
  return startQueuedLoads(scene);
}

/** Background-load remaining species after menu is visible. */
export function preloadAllRemainingCreatures(scene: Phaser.Scene): Promise<void> {
  if (isPlaceholderAssets() || usesCreatureAtlas(scene)) return Promise.resolve();
  const rest = EXTERNAL_CRITTERS.filter(id => !(BOOT_SPECIES as readonly string[]).includes(id));
  return preloadCreatureTextures(scene, rest);
}

export function preloadExternalArt(scene: Phaser.Scene): void {
  preloadBootArt(scene);
  if (usesCreatureAtlas(scene)) return;
  for (const id of EXTERNAL_CRITTERS) {
    if ((BOOT_SPECIES as readonly string[]).includes(id)) continue;
    queueCreatureFiles(scene, id);
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

function hasAtlasFrame(scene: Phaser.Scene, frame: string, small: boolean): boolean {
  const atlasKey = small ? SM_ATLAS : LG_ATLAS;
  if (!scene.textures.exists(atlasKey)) return false;
  return scene.textures.getFrame(atlasKey, frame) != null;
}

export type CreatureTextureVariant = 'front' | 'f2' | 'back';

export function creatureTextureKey(
  scene: Phaser.Scene,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): string {
  if (usesCreatureAtlas(scene)) {
    return small ? SM_ATLAS : LG_ATLAS;
  }
  let suffix = small ? '_sm' : '';
  if (variant === 'f2') suffix += '_f2';
  if (variant === 'back') suffix += '_back';
  const ext = `ext_creature_${speciesId}${suffix}`;
  const proc = `creature_${speciesId}${small ? '_sm' : ''}`;
  if (isRealExternalTexture(scene, ext)) return ext;
  return proc;
}

export function hasCreatureGraphic(
  scene: Phaser.Scene,
  speciesId: string,
  small = false,
  variant: CreatureTextureVariant = 'front',
): boolean {
  if (usesCreatureAtlas(scene)) {
    return hasAtlasFrame(scene, creatureFrameName(speciesId, small, variant), small);
  }
  let suffix = small ? '_sm' : '';
  if (variant === 'f2') suffix += '_f2';
  if (variant === 'back') suffix += '_back';
  if (isRealExternalTexture(scene, `ext_creature_${speciesId}${suffix}`)) return true;
  return scene.textures.exists(`creature_${speciesId}${small ? '_sm' : ''}`);
}

export interface CritterIdleHandle {
  stop(): void;
}

export function startCritterIdle(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Image,
  speciesId: string,
  bobY?: number,
  variant: 'front' | 'back' = 'front',
): CritterIdleHandle {
  let stopped = false;
  let timer: Phaser.Time.TimerEvent | undefined;
  let bob: Phaser.Tweens.Tween | undefined;

  applyCreatureTexture(sprite, scene, speciesId, false, variant);

  const atlas = usesCreatureAtlas(scene);
  const f1 = creatureTexRef(scene, speciesId, false, variant);
  const f2 = creatureTexRef(scene, speciesId, false, 'f2');
  const hasF2 = variant === 'front' && (atlas
    ? hasAtlasFrame(scene, creatureFrameName(speciesId, false, 'f2'), false)
    : isRealExternalTexture(scene, `ext_creature_${speciesId}_f2`));

  if (hasF2) {
    let frame = 0;
    timer = scene.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        if (stopped) return;
        frame = 1 - frame;
        if (atlas && f1.frame && f2.frame) {
          sprite.setTexture(f1.key, frame ? f2.frame : f1.frame);
        } else {
          sprite.setTexture(frame ? f2.key : f1.key);
        }
      },
    });
  }
  const baseY = bobY ?? sprite.y;
  bob = scene.tweens.add({
    targets: sprite, y: baseY - 3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });

  return {
    stop() {
      stopped = true;
      timer?.remove();
      bob?.stop();
    },
  };
}

export function npcTextureKey(scene: Phaser.Scene, role: NpcRole = 'generic'): string {
  const ext = `ext_npc_${role}`;
  return isRealExternalTexture(scene, ext) ? ext : `npc_${role}`;
}

export function hasExternalCreature(scene: Phaser.Scene, id: string): boolean {
  if (usesCreatureAtlas(scene)) return hasAtlasFrame(scene, id, false);
  return isRealExternalTexture(scene, `ext_creature_${id}`);
}

export function hasExternalNpc(scene: Phaser.Scene): boolean {
  return isRealExternalTexture(scene, 'ext_npc_generic');
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
