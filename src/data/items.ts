export interface ItemDef {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'heal' | 'status' | 'capture' | 'battle';
  healAmount?: number;
  curesStatus?: 'burn' | 'paralyze' | 'poison' | 'sleep' | 'all';
  catchBonus?: number;
  usableInBattle: boolean;
  usableOverworld: boolean;
  revive?: boolean;
}

export const ITEMS: Record<string, ItemDef> = {
  capture_orb: {
    id: 'capture_orb', name: 'Capture Orb', description: 'A basic orb for catching critters.',
    price: 200, category: 'capture', catchBonus: 1, usableInBattle: true, usableOverworld: false,
  },
  great_orb: {
    id: 'great_orb', name: 'Great Orb', description: 'Better catch rate than a Capture Orb.',
    price: 600, category: 'capture', catchBonus: 1.5, usableInBattle: true, usableOverworld: false,
  },
  ultra_orb: {
    id: 'ultra_orb', name: 'Ultra Orb', description: 'Highest catch rate orb available.',
    price: 1200, category: 'capture', catchBonus: 2, usableInBattle: true, usableOverworld: false,
  },
  potion: {
    id: 'potion', name: 'Potion', description: 'Restores 20 HP.',
    price: 300, category: 'heal', healAmount: 20, usableInBattle: true, usableOverworld: true,
  },
  super_potion: {
    id: 'super_potion', name: 'Super Potion', description: 'Restores 50 HP.',
    price: 700, category: 'heal', healAmount: 50, usableInBattle: true, usableOverworld: true,
  },
  hyper_potion: {
    id: 'hyper_potion', name: 'Hyper Potion', description: 'Restores 120 HP.',
    price: 1500, category: 'heal', healAmount: 120, usableInBattle: true, usableOverworld: true,
  },
  antidote: {
    id: 'antidote', name: 'Antidote', description: 'Cures poison.',
    price: 100, category: 'status', curesStatus: 'poison', usableInBattle: true, usableOverworld: true,
  },
  paralyze_heal: {
    id: 'paralyze_heal', name: 'Paralyze Heal', description: 'Cures paralysis.',
    price: 200, category: 'status', curesStatus: 'paralyze', usableInBattle: true, usableOverworld: true,
  },
  burn_heal: {
    id: 'burn_heal', name: 'Burn Heal', description: 'Cures burns.',
    price: 250, category: 'status', curesStatus: 'burn', usableInBattle: true, usableOverworld: true,
  },
  awakening: {
    id: 'awakening', name: 'Awakening', description: 'Wakes a sleeping critter.',
    price: 250, category: 'status', curesStatus: 'sleep', usableInBattle: true, usableOverworld: true,
  },
  full_heal: {
    id: 'full_heal', name: 'Full Heal', description: 'Cures all status conditions.',
    price: 600, category: 'status', curesStatus: 'all', usableInBattle: true, usableOverworld: true,
  },
  full_restore: {
    id: 'full_restore', name: 'Full Restore', description: 'Fully restores HP and cures status.',
    price: 3000, category: 'heal', healAmount: 9999, curesStatus: 'all', usableInBattle: true, usableOverworld: true,
  },
  revive: {
    id: 'revive', name: 'Revive', description: 'Revives a fainted critter to half HP.',
    price: 1500, category: 'heal', healAmount: 0, revive: true, usableInBattle: true, usableOverworld: true,
  },
  max_revive: {
    id: 'max_revive', name: 'Max Revive', description: 'Revives a fainted critter to full HP.',
    price: 4000, category: 'heal', healAmount: 9999, revive: true, usableInBattle: true, usableOverworld: true,
  },
  ether: {
    id: 'ether', name: 'Ether', description: 'Restores 10 PP to one move.',
    price: 1200, category: 'battle', usableInBattle: true, usableOverworld: true,
  },
  oran_berry: {
    id: 'oran_berry', name: 'Oran Berry', description: 'Held: restores 10 HP when low.',
    price: 100, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  charcoal: {
    id: 'charcoal', name: 'Charcoal', description: 'Held: boosts Flame moves 20%.',
    price: 9800, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  mystic_water: {
    id: 'mystic_water', name: 'Mystic Water', description: 'Held: boosts Tide moves 20%.',
    price: 9800, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  silk_scarf: {
    id: 'silk_scarf', name: 'Silk Scarf', description: 'Held: boosts Leaf moves 20%.',
    price: 9800, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  never_melt_ice: {
    id: 'never_melt_ice', name: 'Never-Melt Ice', description: 'Held: boosts Ice moves 20%.',
    price: 9800, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  twisted_spoon: {
    id: 'twisted_spoon', name: 'Twisted Spoon', description: 'Held: boosts Psychic moves 20%.',
    price: 9800, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
  scope_lens: {
    id: 'scope_lens', name: 'Scope Lens', description: 'Held: raises critical-hit ratio.',
    price: 12000, category: 'battle', usableInBattle: false, usableOverworld: false,
  },
};

export const SHOP_STOCK = [
  'capture_orb', 'great_orb', 'ultra_orb',
  'potion', 'super_potion', 'hyper_potion', 'full_restore',
  'revive', 'ether',
  'antidote', 'paralyze_heal', 'burn_heal', 'awakening', 'full_heal',
  'oran_berry', 'charcoal', 'mystic_water', 'silk_scarf', 'never_melt_ice', 'twisted_spoon', 'scope_lens',
];

export function getItem(id: string): ItemDef {
  return ITEMS[id] ?? ITEMS.potion;
}

export type ItemBag = Record<string, number>;

export function emptyBag(): ItemBag {
  return {
    capture_orb: 5,
    great_orb: 0,
    ultra_orb: 0,
    potion: 3,
    super_potion: 0,
    hyper_potion: 0,
    antidote: 0,
    paralyze_heal: 0,
    burn_heal: 0,
    awakening: 0,
    full_heal: 0,
    full_restore: 0,
    revive: 0,
    max_revive: 0,
    ether: 0,
    oran_berry: 0,
    charcoal: 0,
    mystic_water: 0,
    silk_scarf: 0,
    never_melt_ice: 0,
    twisted_spoon: 0,
    scope_lens: 0,
  };
}

export function itemCount(bag: ItemBag, id: string): number {
  return bag[id] ?? 0;
}

export function addItem(bag: ItemBag, id: string, qty = 1): void {
  bag[id] = (bag[id] ?? 0) + qty;
}

export function removeItem(bag: ItemBag, id: string, qty = 1): boolean {
  if ((bag[id] ?? 0) < qty) return false;
  bag[id] -= qty;
  return true;
}

export function totalOrbs(bag: ItemBag): number {
  return (bag.capture_orb ?? 0) + (bag.great_orb ?? 0) + (bag.ultra_orb ?? 0);
}

export function bestOrb(bag: ItemBag): { id: string; bonus: number } | null {
  if ((bag.ultra_orb ?? 0) > 0) return { id: 'ultra_orb', bonus: 2 };
  if ((bag.great_orb ?? 0) > 0) return { id: 'great_orb', bonus: 1.5 };
  if ((bag.capture_orb ?? 0) > 0) return { id: 'capture_orb', bonus: 1 };
  return null;
}
