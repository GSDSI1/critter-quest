# Critter Quest Assets

Hybrid art: drop PNG files here to override procedural fallbacks.

## Critters

`critters/{speciesId}.png` — 64×64 battle sprite  
`critters/{speciesId}_sm.png` — 32×32 overworld/dex sprite

Run `npm run gen-assets` to regenerate procedural PNGs from the built-in generator.

## NPCs

`npcs/{role}.png` — 16×16 overworld sprite

Roles: `generic`, `nurse`, `clerk`, `trainer_m`, `trainer_f`, `rival`, `leader`, `prof`

## External packs (optional)

Free CC0 sources: [Kenney](https://kenney.nl/assets), [OpenGameArt](https://opengameart.org), itch.io pixel packs.
Rename files to match species IDs in `src/data/creatures.ts`.
