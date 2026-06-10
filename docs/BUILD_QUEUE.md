# Critter Quest — Build Queue

Last updated: 2026-06-10. Source: `GAMEPLAN.md`.

## Done

| Phase | Item | Status |
|-------|------|--------|
| 0.1 | Vitest + unit tests | ✓ |
| 0.2 | Injectable RNG | ✓ |
| 0.3 | File splits (sprites, maps, overworld, battle orchestration) | ✓ partial — `BattleUi.ts` still large |
| 0.4 | ESLint, CI, manualChunks | ✓ |
| 1.1 | Tilemap MapRenderer | ✓ |
| 1.2 | Texture exists guards | ✓ |
| 1.3 | Lazy scene loading | ✓ |
| 3.1 | 45 species, Ice/Psychic | ✓ |
| 3.2 | Gyms 3–4, routes 4–5 | ✓ |
| 4.1 | PWA, deploy workflow | ✓ |
| 4.2 | E2E battle/shop/PC/gym | ✓ |
| — | Starter Select layout fix | ✓ |

## Done (2026-06-10 batch)

| Phase | Item | Notes |
|-------|------|-------|
| 3.3 | Elite Four gauntlet + champion chain | Registrar, 4 elites, chained battles, Hall of Fame |
| 3.4 | Held items (scope + type boosters), rematch +3 after champion, day/night tint | |
| 3.5 | Critterdex moves/evo tabs, fast travel (Frost badge), party nickname | |
| 0.3 | Split `BattleFlow` → `battle/BattleFlow.ts` | `BattleUi.ts` now ~319 lines |

## Queued — Phase 2 (graphics, needs art pipeline)

| Item | Blocker |
|------|---------|
| 2.1 Real CC0 tileset + autotiling | Kenney pack download / `meta.json` flip |
| 2.2 Pixel-art critter PNG upgrade (45 species) | `generate-png-assets.mjs` overhaul |
| 2.3 Battle idle/VFX animations | Depends on 2.2 frames |
| 2.4 Overworld walk polish + grass particles | Depends on 2.2 |
| 2.5 9-slice UI theme + pixel webfont | Font link easy; panels need texture gen |
| 2.6 CC0 audio files + map music | Asset sourcing |

## Queued — Phase 3 remainder

| Item | Notes |
|------|-------|
| Shop sell flow | Buy only today |
| Hall of Fame save record | Scene exists; persist completion time to save field |
| Trainer rematch full roster pass | Scaling hook only after champion |

## Verify after each batch

```bash
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
