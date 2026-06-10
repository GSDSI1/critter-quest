import type { TrainerMon } from './maps/types';

export type RematchDef = { party: TrainerMon[]; reward: number };

/** Post-champion rematch rosters keyed by map NPC id. Inline `npc.rematch` overrides these. */
export const REMATCH_ROSTERS: Record<string, RematchDef> = {
  // Rivals — scale to final evolutions
  rival: { party: [{ creatureId: '__RIVAL_EVO__', level: 32 }], reward: 800 },
  rival_forest: { party: [{ creatureId: '__RIVAL_EVO__', level: 34 }, { creatureId: 'rockord', level: 33 }], reward: 900 },
  rival2: { party: [{ creatureId: '__RIVAL_EVO2__', level: 36 }, { creatureId: 'voltwing', level: 35 }], reward: 1000 },
  rival3: { party: [{ creatureId: '__RIVAL_EVO2__', level: 40 }, { creatureId: 'infernox', level: 39 }, { creatureId: 'voltwing', level: 38 }], reward: 1400 },
  rival4: { party: [{ creatureId: '__RIVAL_EVO2__', level: 38 }, { creatureId: 'arctodon', level: 37 }], reward: 1100 },

  // Route 1–2
  hiker: { party: [{ creatureId: 'rockord', level: 30 }, { creatureId: 'bloomoss', level: 31 }], reward: 550 },
  lass: { party: [{ creatureId: 'bloomoss', level: 30 }, { creatureId: 'vineclaw', level: 31 }], reward: 480 },
  youngster: { party: [{ creatureId: 'rockord', level: 32 }, { creatureId: 'pebblite', level: 31 }], reward: 520 },

  // Forest
  ranger: { party: [{ creatureId: 'vineclaw', level: 33 }, { creatureId: 'shadespecter', level: 34 }], reward: 720 },
  bugcatcher: { party: [{ creatureId: 'bloomoss', level: 31 }, { creatureId: 'thornbeast', level: 32 }], reward: 580 },

  // Cities / routes
  cooltrainer: { party: [{ creatureId: 'voltite', level: 34 }, { creatureId: 'voltwing', level: 35 }], reward: 760 },
  hiker2: { party: [{ creatureId: 'rockord', level: 35 }, { creatureId: 'crystalynx', level: 36 }], reward: 820 },
  volcano_hiker: { party: [{ creatureId: 'grimlet', level: 38 }, { creatureId: 'rockord', level: 37 }], reward: 880 },
  skier: { party: [{ creatureId: 'snowpuff', level: 36 }, { creatureId: 'frostmoss', level: 37 }], reward: 800 },
  psychic_trainer: { party: [{ creatureId: 'psyknight', level: 40 }, { creatureId: 'dreamwisp', level: 39 }], reward: 920 },
  medium: { party: [{ creatureId: 'cerebrain', level: 41 }, { creatureId: 'shadeling', level: 40 }], reward: 940 },
  sage_apprentice: { party: [{ creatureId: 'somnara', level: 42 }, { creatureId: 'astralyn', level: 41 }], reward: 980 },

  // Gym trainers
  gym_trainer1: { party: [{ creatureId: 'bloomoss', level: 36 }, { creatureId: 'vineclaw', level: 37 }], reward: 780 },
  gym_trainer2: { party: [{ creatureId: 'thornbeast', level: 38 }, { creatureId: 'leafkit', level: 37 }], reward: 800 },
  gym2_trainer1: { party: [{ creatureId: 'flamewyrm', level: 38 }, { creatureId: 'cinderkit', level: 37 }], reward: 820 },
  gym2_trainer2: { party: [{ creatureId: 'emberlord', level: 39 }, { creatureId: 'voltite', level: 38 }], reward: 840 },
  gym3_trainer1: { party: [{ creatureId: 'glacetail', level: 40 }, { creatureId: 'blizzhound', level: 39 }], reward: 860 },
  gym3_trainer2: { party: [{ creatureId: 'frosthorn', level: 41 }, { creatureId: 'arctodon', level: 40 }], reward: 880 },
  gym4_trainer1: { party: [{ creatureId: 'dreamwisp', level: 42 }, { creatureId: 'mindling', level: 41 }], reward: 900 },
  gym4_trainer2: { party: [{ creatureId: 'psyknight', level: 43 }, { creatureId: 'cerebrain', level: 42 }], reward: 920 },

  // Gym leaders
  gym_leader: { party: [{ creatureId: 'bloomoss', level: 40 }, { creatureId: 'vineclaw', level: 41 }, { creatureId: 'thornbeast', level: 42 }], reward: 1800 },
  gym_leader_cole: { party: [{ creatureId: 'cinderkit', level: 42 }, { creatureId: 'flamewyrm', level: 43 }, { creatureId: 'infernox', level: 44 }], reward: 2000 },
  gym_leader_glacier: { party: [{ creatureId: 'glacetail', level: 44 }, { creatureId: 'blizzhound', level: 45 }, { creatureId: 'glaciorex', level: 46 }], reward: 2200 },
  gym_leader_sage: { party: [{ creatureId: 'cerebrain', level: 45 }, { creatureId: 'somnara', level: 46 }, { creatureId: 'voidseer', level: 47 }], reward: 2400 },

  // Frostvale / glacier pass trainers
  cooltrainer2: { party: [{ creatureId: 'aurorabit', level: 38 }, { creatureId: 'arctodon', level: 39 }], reward: 840 },
  mountaineer: { party: [{ creatureId: 'glacetail', level: 39 }, { creatureId: 'frosthorn', level: 40 }], reward: 860 },
  ice_climber: { party: [{ creatureId: 'blizzhound', level: 40 }, { creatureId: 'chillbite', level: 41 }], reward: 880 },

  // Elite Four + Champion (post-game gauntlet replay)
  elite_trainer1: { party: [{ creatureId: 'voidseer', level: 44 }, { creatureId: 'glaciorex', level: 45 }], reward: 1200 },
  elite_trainer2: { party: [{ creatureId: 'zenolith', level: 45 }, { creatureId: 'infernox', level: 44 }], reward: 1240 },
  elite_trainer3: { party: [{ creatureId: 'arctodon', level: 46 }, { creatureId: 'blizzhound', level: 45 }], reward: 1280 },
  elite_trainer4: { party: [{ creatureId: 'astralyn', level: 47 }, { creatureId: 'somnara', level: 46 }], reward: 1320 },
  champion: { party: [{ creatureId: 'arctodon', level: 46 }, { creatureId: 'astralyn', level: 47 }, { creatureId: 'zenolith', level: 48 }, { creatureId: 'infernox', level: 48 }], reward: 3000 },
};

export function resolveRematch(npcId: string, inline?: RematchDef): RematchDef | undefined {
  return inline ?? REMATCH_ROSTERS[npcId];
}

export function rematchRosterCount(): number {
  return Object.keys(REMATCH_ROSTERS).length;
}
