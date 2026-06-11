# Critter Quest — Build Queue

Last updated: 2026-06-09 (graphics sprint). Source: `GAMEPLAN.md`.

## Done

| Phase | Item | Status |
|-------|------|--------|
| 0–4 | Core game + content + ship | ✓ |
| **Opt** | Tiered boot / lazy scenes / map cache / PWA | ✓ |
| **Opt** | Critter texture atlas (135+135 frames, 2 HTTP requests) | ✓ |
| **Opt** | Screen transitions (`fadeToScene` / `fadeInOnStart`) | ✓ |
| **Opt** | Grass/path/water edge autotiling + corner fills | ✓ |
| **Opt** | Battle send-out + faint tween polish | ✓ |
| **Opt** | Post-champion trainer rematch roster pass (`src/data/rematches.ts`) | ✓ |
| **Opt** | Grass↔path 16-case autotile bitmask + night encounter tables | ✓ |
| **Opt** | Water-shore autotile bitmask (frames 36–50) | ✓ |
| **Opt** | Battle feel pass (back idle, text speed, element VFX, walk puffs) | ✓ |
| **Opt** | Lum Berry held item + pause-menu mute toggle | ✓ |
| **Opt** | Chiptune BGM WAV loops + footstep SFX + Critterdex learnset scroll | ✓ |
| **Opt** | Procedural outdoor autotiles (grass/path + water shore) | ✓ |
| **Opt** | Sitrus Berry + type-boost held items (shop/party) | ✓ |
| **Opt** | Battle attack lunge + Region Map pause menu | ✓ |
| **Opt** | UI theme (Press Start 2P) + panel nine-slice fix + master volume | ✓ |
| **Opt** | Procedural art v2 (tiles + critters + battle BG parallax) | ✓ |
| **Opt** | Particle battle VFX + super-effective flash | ✓ |
| **Opt** | Overworld sky parallax + heal interior + tile night tint | ✓ |
| **Opt** | Kenney import workflow (`npm run import-tileset`) | ✓ |
| **Opt** | Touch menu nav + wipe transitions | ✓ |
| **Opt** | Battle/shop/PC/fast-travel touch nav + fly wipe | ✓ |
| **Opt** | 50 species + 4 moves + kelpling line + city atmosphere + NPC art v2 | ✓ |

## Optional polish (future)

| Item | Notes |
|------|-------|
| Kenney art files | Drop PNGs in `public/assets/tiles/kenney/` + `npm run import-tileset` |
| CC0 music file loops | Replace procedural BGM with licensed chiptune files |

## Verify

```bash
npm run gen-assets   # PNG + tileset + audio + critter atlases
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
