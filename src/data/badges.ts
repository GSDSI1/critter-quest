export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  color: number;
}

export const BADGES: Record<string, BadgeDef> = {
  verdant: {
    id: 'verdant', name: 'Verdant Badge',
    description: 'Proof of victory over Gym Leader Ivy.',
    color: 0x22c55e,
  },
  ember: {
    id: 'ember', name: 'Ember Badge',
    description: 'Proof of victory over Gym Leader Cole.',
    color: 0xff6b35,
  },
};

export function getBadge(id: string): BadgeDef {
  return BADGES[id] ?? BADGES.verdant;
}

export function hasBadge(badges: string[], id: string): boolean {
  return badges.includes(id);
}
