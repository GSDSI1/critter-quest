# Critter Quest — Build Queue

Last updated: 2026-06-09. Source: `GAMEPLAN.md`.

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

## Optional polish (future)

| Item | Notes |
|------|-------|
| Kenney tileset drop-in | Replace `tileset.png`; re-run `npm run pack-tileset` |
| CC0 music file loops | Replace procedural BGM with licensed chiptune files |

## Verify

```bash
npm run gen-assets   # PNG + tileset + audio + critter atlases
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
