export interface LearnEntry {
  level: number;
  move: string;
}

export const LEARNSETS: Record<string, LearnEntry[]> = {
  emberpup: [
    { level: 1, move: 'scratch' }, { level: 1, move: 'growl' },
    { level: 5, move: 'ember' }, { level: 9, move: 'blaze' },
    { level: 13, move: 'bite' },
  ],
  flamewyrm: [
    { level: 1, move: 'ember' }, { level: 1, move: 'blaze' },
    { level: 20, move: 'inferno' }, { level: 26, move: 'shadowclaw' },
    { level: 30, move: 'take_down' },
  ],
  infernox: [
    { level: 1, move: 'blaze' }, { level: 1, move: 'inferno' },
    { level: 40, move: 'darkpulse' }, { level: 46, move: 'thunderbolt' },
    { level: 50, move: 'flare_blitz' },
  ],
  aqualet: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'growl' },
    { level: 5, move: 'splash' }, { level: 9, move: 'tidal' },
    { level: 13, move: 'quick_strike' },
  ],
  tidefin: [
    { level: 1, move: 'splash' }, { level: 1, move: 'tidal' },
    { level: 20, move: 'tsunami' }, { level: 24, move: 'icebeam' },
  ],
  aquadel: [
    { level: 1, move: 'tidal' }, { level: 1, move: 'tsunami' },
    { level: 38, move: 'icebeam' }, { level: 44, move: 'darkpulse' },
  ],
  leafkit: [
    { level: 1, move: 'scratch' }, { level: 1, move: 'vine' },
    { level: 6, move: 'leafblade' }, { level: 10, move: 'photosynthesis' },
    { level: 14, move: 'absorb' },
  ],
  vineclaw: [
    { level: 1, move: 'vine' }, { level: 1, move: 'leafblade' },
    { level: 19, move: 'rockthrow' }, { level: 22, move: 'sleep_powder' },
    { level: 26, move: 'pin_barrage' },
  ],
  thornbeast: [
    { level: 1, move: 'leafblade' }, { level: 1, move: 'boulder' },
    { level: 38, move: 'earthquake' }, { level: 42, move: 'photosynthesis' },
    { level: 46, move: 'leech_life' },
  ],
  sparkbit: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'spark' },
    { level: 7, move: 'thunderbolt' }, { level: 12, move: 'growl' },
  ],
  voltwing: [
    { level: 1, move: 'spark' }, { level: 1, move: 'thunderbolt' },
    { level: 22, move: 'vine' }, { level: 28, move: 'thunderwave' },
  ],
  mossling: [
    { level: 1, move: 'tackle' }, { level: 4, move: 'vine' },
    { level: 8, move: 'photosynthesis' }, { level: 12, move: 'absorb' },
  ],
  bloomoss: [
    { level: 1, move: 'vine' }, { level: 1, move: 'leafblade' },
    { level: 22, move: 'sleep_powder' }, { level: 26, move: 'photosynthesis' },
  ],
  pebblite: [
    { level: 1, move: 'tackle' }, { level: 5, move: 'rockthrow' },
    { level: 9, move: 'headbutt' },
    { level: 10, move: 'boulder' },
  ],
  rockord: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'boulder' },
    { level: 24, move: 'earthquake' },
  ],
  shadeling: [
    { level: 1, move: 'scratch' }, { level: 6, move: 'shadowclaw' },
    { level: 12, move: 'darkpulse' }, { level: 16, move: 'shadow_sneak' },
  ],
  shadespecter: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'darkpulse' },
    { level: 32, move: 'hypnosis' },
  ],
  crystalynx: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'spark' },
    { level: 14, move: 'thunderbolt' }, { level: 18, move: 'boulder' },
  ],
  cinderkit: [
    { level: 1, move: 'scratch' }, { level: 5, move: 'ember' }, { level: 9, move: 'blaze' },
  ],
  emberlord: [
    { level: 1, move: 'blaze' }, { level: 1, move: 'inferno' }, { level: 38, move: 'darkpulse' },
  ],
  geodeon: [
    { level: 1, move: 'rockthrow' }, { level: 1, move: 'spark' }, { level: 22, move: 'earthquake' },
  ],
  mistral: [
    { level: 1, move: 'spark' }, { level: 1, move: 'vine' }, { level: 20, move: 'thunderbolt' },
  ],
  grimlet: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'rockthrow' }, { level: 24, move: 'darkpulse' },
  ],
  coralite: [
    { level: 1, move: 'splash' }, { level: 1, move: 'rockthrow' }, { level: 18, move: 'tidal' },
  ],
  tidewisp: [
    { level: 1, move: 'splash' }, { level: 5, move: 'tackle' }, { level: 9, move: 'tidal' },
  ],
  thornling: [
    { level: 1, move: 'vine' }, { level: 5, move: 'tackle' }, { level: 10, move: 'leer' },
  ],
  voltite: [
    { level: 1, move: 'spark' }, { level: 5, move: 'tackle' }, { level: 10, move: 'thunderwave' },
  ],
  frostkit: [
    { level: 1, move: 'scratch' }, { level: 1, move: 'growl' },
    { level: 5, move: 'frostbite' }, { level: 9, move: 'iceshard' },
    { level: 13, move: 'icy_gale' },
  ],
  glacetail: [
    { level: 1, move: 'frostbite' }, { level: 1, move: 'iceshard' },
    { level: 20, move: 'icebeam' }, { level: 26, move: 'blizzard' },
    { level: 30, move: 'agility' },
  ],
  arctodon: [
    { level: 1, move: 'iceshard' }, { level: 1, move: 'icebeam' },
    { level: 38, move: 'boulder' }, { level: 42, move: 'earthquake' },
  ],
  mindling: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'growl' },
    { level: 5, move: 'psybeam' }, { level: 9, move: 'calm_mind' },
  ],
  cerebrain: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'calm_mind' },
    { level: 20, move: 'mindblast' }, { level: 24, move: 'hypnosis' },
  ],
  astralyn: [
    { level: 1, move: 'mindblast' }, { level: 1, move: 'calm_mind' },
    { level: 40, move: 'darkpulse' }, { level: 46, move: 'hypnosis' },
  ],
  snowpuff: [
    { level: 1, move: 'tackle' }, { level: 4, move: 'frostbite' }, { level: 8, move: 'growl' },
  ],
  blizzhound: [
    { level: 1, move: 'frostbite' }, { level: 1, move: 'iceshard' },
    { level: 22, move: 'blizzard' },
  ],
  dreamwisp: [
    { level: 1, move: 'tackle' }, { level: 6, move: 'psybeam' }, { level: 12, move: 'hypnosis' },
    { level: 16, move: 'supersonic' },
  ],
  somnara: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'hypnosis' },
    { level: 32, move: 'mindblast' }, { level: 36, move: 'calm_mind' },
  ],
  frosthorn: [
    { level: 1, move: 'iceshard' }, { level: 1, move: 'tackle' }, { level: 14, move: 'rockthrow' },
  ],
  glaciorex: [
    { level: 1, move: 'icebeam' }, { level: 1, move: 'spark' },
    { level: 16, move: 'thunderbolt' }, { level: 22, move: 'blizzard' },
  ],
  chillbite: [
    { level: 1, move: 'frostbite' }, { level: 1, move: 'shadowclaw' }, { level: 18, move: 'darkpulse' },
    { level: 22, move: 'bite' }, { level: 28, move: 'icy_gale' },
  ],
  frostmoss: [
    { level: 1, move: 'frostbite' }, { level: 1, move: 'vine' }, { level: 12, move: 'photosynthesis' },
  ],
  psyknight: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'scratch' }, { level: 20, move: 'calm_mind' },
    { level: 24, move: 'double_kick' }, { level: 30, move: 'agility' },
  ],
  voidseer: [
    { level: 1, move: 'mindblast' }, { level: 1, move: 'darkpulse' }, { level: 24, move: 'hypnosis' },
  ],
  aurorabit: [
    { level: 1, move: 'frostbite' }, { level: 5, move: 'tackle' }, { level: 10, move: 'iceshard' },
  ],
  zenolith: [
    { level: 1, move: 'mindblast' }, { level: 1, move: 'rockthrow' },
    { level: 28, move: 'calm_mind' }, { level: 34, move: 'earthquake' },
  ],
  coalemb: [
    { level: 1, move: 'ember' }, { level: 1, move: 'growl' },
    { level: 8, move: 'coalsurge' }, { level: 14, move: 'blaze' },
  ],
  kelpling: [
    { level: 1, move: 'splash' }, { level: 1, move: 'tackle' },
    { level: 6, move: 'tidal' }, { level: 12, move: 'growl' },
  ],
  reefguard: [
    { level: 1, move: 'splash' }, { level: 1, move: 'reef_surge' },
    { level: 24, move: 'tidal' }, { level: 28, move: 'vine' },
  ],
  nightmoth: [
    { level: 1, move: 'shadow_dust' }, { level: 1, move: 'tackle' },
    { level: 10, move: 'shadowclaw' }, { level: 16, move: 'hypnosis' },
    { level: 20, move: 'confuse_ray' },
  ],
  stormhorn: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'leer' },
    { level: 10, move: 'spark' }, { level: 18, move: 'volt_ram' },
    { level: 24, move: 'take_down' },
  ],
  embershell: [
    { level: 1, move: 'coalsurge' }, { level: 1, move: 'ember' },
    { level: 28, move: 'magma_crush' }, { level: 32, move: 'boulder' },
  ],
  murkfox: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'leer' },
    { level: 8, move: 'murk_fang' }, { level: 14, move: 'shadowclaw' },
    { level: 18, move: 'shadow_sneak' }, { level: 24, move: 'confuse_ray' },
  ],
  frostnip: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'growl' },
    { level: 6, move: 'frostbite' }, { level: 12, move: 'frost_shatter' },
  ],
  psychora: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'psybeam' },
    { level: 12, move: 'calm_mind' }, { level: 20, move: 'psy_burst' },
  ],
  galesprite: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'spark' },
    { level: 16, move: 'gale_dash' }, { level: 24, move: 'calm_mind' },
  ],
  glaciara: [
    { level: 1, move: 'frost_shatter' }, { level: 1, move: 'frostbite' },
    { level: 22, move: 'glacier_fang' }, { level: 28, move: 'icebeam' },
  ],
  shadeprowl: [
    { level: 1, move: 'murk_fang' }, { level: 1, move: 'shadowclaw' },
    { level: 24, move: 'night_stalk' }, { level: 30, move: 'darkpulse' },
    { level: 34, move: 'bite' },
  ],
  crystmite: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'tackle' },
    { level: 10, move: 'prism_beam' }, { level: 16, move: 'rockthrow' },
  ],
  brinepup: [
    { level: 1, move: 'splash' }, { level: 1, move: 'tackle' },
    { level: 8, move: 'brine_splash' }, { level: 14, move: 'tidal' },
  ],
  thornbud: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'vine' },
    { level: 8, move: 'thorn_lash' }, { level: 14, move: 'leafblade' },
  ],
  tidemast: [
    { level: 1, move: 'brine_splash' }, { level: 1, move: 'splash' },
    { level: 26, move: 'tidal_maul' }, { level: 30, move: 'tsunami' },
  ],
  thornqueen: [
    { level: 1, move: 'thorn_lash' }, { level: 1, move: 'vine' },
    { level: 24, move: 'rose_strike' }, { level: 28, move: 'sleep_powder' },
  ],
  prismdon: [
    { level: 1, move: 'prism_beam' }, { level: 1, move: 'psybeam' },
    { level: 28, move: 'crystal_lance' }, { level: 32, move: 'mindblast' },
  ],
  ashpuff: [
    { level: 1, move: 'ember' }, { level: 1, move: 'tackle' },
    { level: 8, move: 'cinder_swipe' }, { level: 12, move: 'coalsurge' },
  ],
  voltchick: [
    { level: 1, move: 'tackle' }, { level: 1, move: 'leer' },
    { level: 6, move: 'static_peck' }, { level: 10, move: 'spark' },
  ],
  voltail: [
    { level: 1, move: 'static_peck' }, { level: 1, move: 'spark' },
    { level: 18, move: 'thunder_dive' }, { level: 22, move: 'thunderbolt' },
  ],
  thunderhawk: [
    { level: 1, move: 'thunder_dive' }, { level: 1, move: 'thunderbolt' },
    { level: 34, move: 'volt_ram' }, { level: 38, move: 'storm_beak' },
    { level: 42, move: 'agility' },
  ],
  ashlynx: [
    { level: 1, move: 'cinder_swipe' }, { level: 1, move: 'ember' },
    { level: 20, move: 'scorch_claw' }, { level: 24, move: 'blaze' },
  ],
  scorchmane: [
    { level: 1, move: 'scorch_claw' }, { level: 1, move: 'blaze' },
    { level: 36, move: 'ash_roar' }, { level: 40, move: 'magma_crush' },
  ],
  gleamfin: [
    { level: 1, move: 'splash' }, { level: 1, move: 'psybeam' },
    { level: 12, move: 'gleam_pulse' }, { level: 16, move: 'tidal' },
  ],
  piercrab: [
    { level: 1, move: 'splash' }, { level: 1, move: 'boulder' },
    { level: 10, move: 'brine_splash' }, { level: 14, move: 'tidal' },
  ],
  moonmoth: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'sleep_powder' },
    { level: 12, move: 'leafblade' }, { level: 16, move: 'mindblast' },
  ],
  brinecrown: [
    { level: 1, move: 'tidal' }, { level: 1, move: 'brine_splash' },
    { level: 18, move: 'boulder' }, { level: 22, move: 'tidal_maul' },
  ],
  grovespirit: [
    { level: 1, move: 'vine' }, { level: 1, move: 'psybeam' },
    { level: 20, move: 'rose_strike' }, { level: 24, move: 'mindblast' },
  ],
  miragen: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'shadowclaw' },
    { level: 22, move: 'darkpulse' }, { level: 26, move: 'mindblast' },
  ],
  shroomcap: [
    { level: 1, move: 'vine' }, { level: 1, move: 'sleep_powder' },
    { level: 10, move: 'thorn_lash' }, { level: 14, move: 'photosynthesis' },
  ],
  buzzwing: [
    { level: 1, move: 'spark' }, { level: 1, move: 'tackle' },
    { level: 12, move: 'thunderbolt' }, { level: 16, move: 'thunderwave' },
    { level: 20, move: 'pin_barrage' },
  ],
  sandcrab: [
    { level: 1, move: 'splash' }, { level: 1, move: 'tackle' },
    { level: 12, move: 'boulder' }, { level: 16, move: 'brine_splash' },
    { level: 20, move: 'double_kick' },
  ],
  frostwisp: [
    { level: 1, move: 'iceshard' }, { level: 1, move: 'psybeam' },
    { level: 14, move: 'frostbite' }, { level: 18, move: 'mindblast' },
  ],
  wraithling: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'psybeam' },
    { level: 20, move: 'darkpulse' }, { level: 24, move: 'hypnosis' },
  ],
  fungloom: [
    { level: 1, move: 'thorn_lash' }, { level: 1, move: 'rose_strike' },
    { level: 22, move: 'sleep_powder' }, { level: 26, move: 'photosynthesis' },
  ],
  embermite: [
    { level: 1, move: 'ember' }, { level: 1, move: 'coalsurge' },
    { level: 12, move: 'scorch_claw' }, { level: 16, move: 'blaze' },
  ],
  tidepod: [
    { level: 1, move: 'splash' }, { level: 1, move: 'brine_splash' },
    { level: 10, move: 'tidal' }, { level: 14, move: 'tackle' },
  ],
  psychoglow: [
    { level: 1, move: 'psybeam' }, { level: 1, move: 'calm_mind' },
    { level: 14, move: 'mindblast' }, { level: 18, move: 'hypnosis' },
  ],
  abysswisp: [
    { level: 1, move: 'darkpulse' }, { level: 1, move: 'mindblast' },
    { level: 24, move: 'shadow_dust' }, { level: 28, move: 'hypnosis' },
  ],
  bouldercrust: [
    { level: 1, move: 'boulder' }, { level: 1, move: 'brine_splash' },
    { level: 26, move: 'earthquake' }, { level: 30, move: 'tidal_maul' },
  ],
  glaciwhisp: [
    { level: 1, move: 'icebeam' }, { level: 1, move: 'mindblast' },
    { level: 22, move: 'frostbite' }, { level: 26, move: 'calm_mind' },
  ],
  tidewrack: [
    { level: 1, move: 'brine_splash' }, { level: 1, move: 'tidal' },
    { level: 24, move: 'tidal_maul' }, { level: 28, move: 'splash' },
  ],
  embercoil: [
    { level: 1, move: 'coalsurge' }, { level: 1, move: 'scorch_claw' },
    { level: 22, move: 'blaze' }, { level: 26, move: 'ember' },
  ],
  prizefawn: [
    { level: 1, move: 'calm_mind' }, { level: 1, move: 'psybeam' },
    { level: 18, move: 'mindblast' }, { level: 22, move: 'hypnosis' },
  ],
  glowfern: [
    { level: 1, move: 'vine' }, { level: 1, move: 'psybeam' },
    { level: 16, move: 'photosynthesis' }, { level: 20, move: 'sleep_powder' },
  ],
  stormlet: [
    { level: 1, move: 'spark' }, { level: 1, move: 'tackle' },
    { level: 14, move: 'thunderbolt' }, { level: 18, move: 'thunderwave' },
  ],
  cavemaw: [
    { level: 1, move: 'shadowclaw' }, { level: 1, move: 'boulder' },
    { level: 22, move: 'darkpulse' }, { level: 26, move: 'tackle' },
  ],
  psychomyst: [
    { level: 1, move: 'calm_mind' }, { level: 1, move: 'mindblast' },
    { level: 26, move: 'psybeam' }, { level: 30, move: 'hypnosis' },
  ],
  voidreaper: [
    { level: 1, move: 'darkpulse' }, { level: 1, move: 'mindblast' },
    { level: 38, move: 'shadow_dust' }, { level: 42, move: 'hypnosis' },
  ],
  solarchion: [
    { level: 1, move: 'inferno' }, { level: 1, move: 'mindblast' },
    { level: 40, move: 'blaze' }, { level: 45, move: 'gleam_pulse' },
  ],
  lunawisp: [
    { level: 1, move: 'darkpulse' }, { level: 1, move: 'mindblast' },
    { level: 40, move: 'shadow_dust' }, { level: 45, move: 'hypnosis' },
  ],
  terradrake: [
    { level: 1, move: 'earthquake' }, { level: 1, move: 'inferno' },
    { level: 42, move: 'boulder' }, { level: 48, move: 'scorch_claw' },
  ],
  stormcrown: [
    { level: 1, move: 'thunder_dive' }, { level: 1, move: 'storm_beak' },
    { level: 44, move: 'mindblast' }, { level: 50, move: 'thunderbolt' },
  ],
  primordix: [
    { level: 1, move: 'mindblast' }, { level: 1, move: 'darkpulse' },
    { level: 50, move: 'crystal_lance' }, { level: 55, move: 'gleam_pulse' },
  ],
};

export function movesKnownAtLevel(speciesId: string, level: number): string[] {
  const entries = LEARNSETS[speciesId] ?? LEARNSETS.mossling;
  const moves: string[] = [];
  for (const e of entries) {
    if (e.level <= level && !moves.includes(e.move)) moves.push(e.move);
  }
  return moves.slice(-4);
}

export function newMovesOnLevelUp(speciesId: string, oldLevel: number, newLevel: number): string[] {
  const entries = LEARNSETS[speciesId] ?? [];
  const learned: string[] = [];
  for (const e of entries) {
    if (e.level > oldLevel && e.level <= newLevel) learned.push(e.move);
  }
  return learned;
}

export function tryLearnMove(currentMoves: string[], moveId: string): { moves: string[]; learned: boolean; replaced?: string } {
  if (currentMoves.includes(moveId)) return { moves: currentMoves, learned: false };
  if (currentMoves.length < 4) return { moves: [...currentMoves, moveId], learned: true };
  const replaced = currentMoves[0];
  return { moves: [...currentMoves.slice(1), moveId], learned: true, replaced };
}
