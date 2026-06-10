# Critter Quest — Build Queue

Last updated: 2026-06-10. Source: `GAMEPLAN.md`.

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

## Optional polish (future)

| Item | Notes |
|------|-------|
| Kenney tileset drop-in | Replace `tileset.png`; re-run `npm run pack-tileset` |
| Full 16-case tile bitmask | Dedicated transition tiles in tileset |

## Verify

```bash
npm run gen-assets   # PNG + tileset + audio + critter atlases
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
