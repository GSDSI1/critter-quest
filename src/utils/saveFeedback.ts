import Phaser from 'phaser';
import { saveGame } from '../systems/save';
import { showToast } from '../ui/mapBanner';

/** Persist game; show toast if localStorage fails (quota, private mode). */
export function trySave(scene: Phaser.Scene): boolean {
  const ok = saveGame();
  if (!ok) showToast(scene, 'Save failed — storage may be full.');
  return ok;
}
