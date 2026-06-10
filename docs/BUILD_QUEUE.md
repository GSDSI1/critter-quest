# Critter Quest — Build Queue

Last updated: 2026-06-10. Source: `GAMEPLAN.md`.

## Done

| Phase | Item | Status |
|-------|------|--------|
| 0–1 | Foundation + performance | ✓ |
| 2 | Graphics pipeline (art, audio, UI) | ✓ |
| 3 | Content + systems + QoL | ✓ |
| 4 | PWA, deploy, E2E | ✓ |
| **Opt** | Tiered boot preload (tileset/NPCs/SFX + 7 boot species) | ✓ |
| **Opt** | On-demand scene chunks (`installLazySceneLoader`) | ✓ |
| **Opt** | Skip procedural tiles/NPCs/critters when external art loaded | ✓ |
| **Opt** | Map tile-data cache + tile-layer grass/water anim (no per-cell Images) | ✓ |
| **Opt** | PWA runtime cache for critter PNGs; `game-data` Vite chunk | ✓ |
| **Opt** | Battle creature on-demand preload; idle timer cleanup | ✓ |
| **Opt** | NPC idle facing flips | ✓ |

## Optional polish (future)

| Item | Notes |
|------|-------|
| Kenney tileset drop-in | Replace `tileset.png`; re-run `npm run pack-tileset` |
| Critter texture atlas | Pack 270 PNGs into 1–2 atlases for fewer HTTP requests |
| 16-case autotiling | Bitmask edges on external tileset |
| Battle entry/faint tweens | Extra polish beyond current anims |
| Screen transitions helper | Wire `fadeToScene` into more scene hops |

## Verify

```bash
npm run gen-assets   # regenerate PNG + tileset + audio
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
npm run build        # check game-data chunk + PWA workbox split
```
