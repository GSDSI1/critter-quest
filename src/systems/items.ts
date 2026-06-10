import { getItem, type ItemBag, removeItem } from '../data/items';
import type { CritterInstance } from './stats';
import { clearStatus, displayName, isFainted } from './stats';

export function useItemOnCritter(bag: ItemBag, itemId: string, target: CritterInstance): { ok: boolean; message: string } {
  const item = getItem(itemId);
  if ((bag[itemId] ?? 0) <= 0) return { ok: false, message: "You don't have that item!" };

  if (item.revive) {
    if (!isFainted(target)) return { ok: false, message: "It won't have any effect!" };
    removeItem(bag, itemId);
    target.currentHp = item.id === 'max_revive' ? target.maxHp : Math.floor(target.maxHp / 2);
    clearStatus(target);
    return { ok: true, message: `${displayName(target)} was revived!` };
  }

  if (isFainted(target) && item.category !== 'capture') {
    return { ok: false, message: "It won't have any effect!" };
  }

  if (item.category === 'heal') {
    if (item.id === 'full_restore') {
      removeItem(bag, itemId);
      target.currentHp = target.maxHp;
      clearStatus(target);
      return { ok: true, message: `${displayName(target)} fully restored!` };
    }
    if (target.currentHp >= target.maxHp) return { ok: false, message: "HP is already full!" };
    removeItem(bag, itemId);
    const heal = item.healAmount ?? 20;
    const before = target.currentHp;
    target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
    return { ok: true, message: `${displayName(target)} recovered ${target.currentHp - before} HP!` };
  }

  if (item.category === 'status' && item.curesStatus) {
    if (!target.status) return { ok: false, message: "It won't have any effect!" };
    if (item.curesStatus !== 'all' && target.status !== item.curesStatus) {
      return { ok: false, message: "It won't have any effect!" };
    }
    removeItem(bag, itemId);
    clearStatus(target);
    return { ok: true, message: `${displayName(target)} was cured of its status!` };
  }

  if (item.id === 'ether') {
    const move = target.moves.find(m => m.pp < m.maxPp);
    if (!move) return { ok: false, message: "It won't have any effect!" };
    removeItem(bag, itemId);
    move.pp = Math.min(move.maxPp, move.pp + 10);
    return { ok: true, message: `${displayName(target)} restored PP!` };
  }

  return { ok: false, message: "Can't use that here!" };
}

export function getBattleUsableItems(bag: ItemBag, isWild: boolean): string[] {
  return Object.keys(bag).filter(id => {
    if ((bag[id] ?? 0) <= 0) return false;
    const item = getItem(id);
    if (!item.usableInBattle) return false;
    if (item.category === 'capture' && !isWild) return false;
    if (item.id === 'oran_berry' || item.id === 'charcoal' || item.id === 'mystic_water') return false;
    return true;
  });
}
