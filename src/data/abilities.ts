export interface AbilityDef {
  id: string;
  name: string;
  description: string;
}

export const ABILITIES: Record<string, AbilityDef> = {
  blaze: { id: 'blaze', name: 'Blaze', description: 'Powers up Flame moves when HP is low.' },
  torrent: { id: 'torrent', name: 'Torrent', description: 'Powers up Tide moves when HP is low.' },
  overgrow: { id: 'overgrow', name: 'Overgrow', description: 'Powers up Leaf moves when HP is low.' },
  static: { id: 'static', name: 'Static', description: 'May paralyze on contact.' },
  intimidate: { id: 'intimidate', name: 'Intimidate', description: 'Lowers foe Attack on entry.' },
  levitate: { id: 'levitate', name: 'Levitate', description: 'Immune to Stone-type moves.' },
  sturdy: { id: 'sturdy', name: 'Sturdy', description: 'Cannot be OHKO from full HP.' },
  shadow_tag: { id: 'shadow_tag', name: 'Shadow Tag', description: 'Prevents fleeing.' },
  chlorophyll: { id: 'chlorophyll', name: 'Chlorophyll', description: 'Speed boost in sunny areas.' },
  volt_absorb: { id: 'volt_absorb', name: 'Volt Absorb', description: 'Heals when hit by Volt moves.' },
  water_absorb: { id: 'water_absorb', name: 'Water Absorb', description: 'Heals when hit by Tide moves.' },
  flash_fire: { id: 'flash_fire', name: 'Flash Fire', description: 'Immune to Flame; boosts next Flame move.' },
  rock_head: { id: 'rock_head', name: 'Rock Head', description: 'No recoil damage.' },
  swift_swim: { id: 'swift_swim', name: 'Swift Swim', description: 'Doubles Speed in rain.' },
  inner_focus: { id: 'inner_focus', name: 'Inner Focus', description: 'Cannot flinch.' },
};

export function getAbility(id: string): AbilityDef {
  return ABILITIES[id] ?? { id: 'none', name: 'None', description: 'No special ability.' };
}

export function defaultAbilityForTypes(types: string[]): string {
  if (types.includes('flame')) return 'blaze';
  if (types.includes('tide')) return 'torrent';
  if (types.includes('leaf')) return 'overgrow';
  if (types.includes('volt')) return 'static';
  if (types.includes('shadow')) return 'shadow_tag';
  if (types.includes('stone')) return 'sturdy';
  return 'inner_focus';
}

/** Returns damage multiplier from ability on attack */
export function abilityAttackMult(abilityId: string, moveType: string, hpRatio: number): number {
  if (hpRatio <= 0.33) {
    if (abilityId === 'blaze' && moveType === 'flame') return 1.5;
    if (abilityId === 'torrent' && moveType === 'tide') return 1.5;
    if (abilityId === 'overgrow' && moveType === 'leaf') return 1.5;
  }
  return 1;
}

export function isTypeImmune(abilityId: string, moveType: string): boolean {
  if (abilityId === 'levitate' && moveType === 'stone') return true;
  if (abilityId === 'flash_fire' && moveType === 'flame') return true;
  if (abilityId === 'volt_absorb' && moveType === 'volt') return true;
  if (abilityId === 'water_absorb' && moveType === 'tide') return true;
  return false;
}

export function onEnterAbility(abilityId: string): { stat: string; stages: number; message: string } | null {
  if (abilityId === 'intimidate') {
    return { stat: 'atk', stages: -1, message: 'Intimidate lowered Attack!' };
  }
  return null;
}

export function contactAbilityEffect(abilityId: string): 'paralyze' | null {
  if (abilityId === 'static') return Math.random() < 0.3 ? 'paralyze' : null;
  return null;
}

export function absorbHeal(abilityId: string, moveType: string): number | null {
  if (abilityId === 'volt_absorb' && moveType === 'volt') return 0.25;
  if (abilityId === 'water_absorb' && moveType === 'tide') return 0.25;
  return null;
}
