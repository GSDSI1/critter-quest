# Critter Quest — Build Queue

Last updated: 2026-06-12 (P13–P17 advanced build-out). **Source of truth for forward work.**

## Snapshot

| Metric | Value |
|--------|-------|
| Species | **100** |
| Maps | 29 |
| Unit tests | 113 (17 files) |
| E2E specs | 17 files (36+ tests) |
| Dex milestones | 20 / 40 / 60 / 80 / 90 / **100** |
| Largest scene file | NpcManager 324 LOC |
| Verify | ~195 checks, green |

---

## Shipped (cumulative)

| Band | Deliverables |
|------|----------------|
| Movement sprint | BFS walk, 25 maps, 3 minigames, fun layer, species 71–87 |
| P1 UX | Night HUD, dex toasts, intro skip, map hold-walk |
| P2 | ChestRewards, MinigameHandlers, WalkController, warpGates, TrainerBattleHandler, WarpBlockDialog, **OverworldInputHandler** |
| P3 | Species 88–90, evo lines, contest sign |
| P4 | Minigame bests, fishing/bug/contest e2e, 3 chests |
| P7 | `regionDiscovery.ts`, region map hints (★ nodes), Mom/Prof lines, fast travel to minigames |
| P8 | Species 91–100, psychoglow→psychomyst, abysswisp→voidreaper, dex milestones 90+100 |
| P6 partial | Gym 1–4 badge smoke, shop sell, chest loot, grove walk e2e |
| P3 partial | batch6 hand art (10 species: pier/grove/legendaries) |
| **P9** | Atlas frame fallback, Boot load-error recovery, trainer Run hidden, calm_mind fix, speed turn order, HP tween + battle VFX, Sturdy/Thick Fat/Flash Fire/Synchronize, battle-fight e2e |
| **P10** | Generator v3 shading + distinct backs, batch7 early-route art (15 species), player trainer PNG pipeline |
| **P11** | Kenney Tiny Town tile integration (`fetch-kenney`), batch8 mid-route art (15 species), CREDITS.md |
| **P12** | batch9/10 art (30 species), Kenney interior tiles, insomnia + snow_cloak abilities |
| **P13** | Move effects (flinch/recoil/drain/multi-hit/confusion/freeze/priority, 14 moves), weather (rain/sun/hail + chlorophyll/swift_swim), wild held items, AI switching |
| **P14** | Shape-based pixel-art library (6 body plans, all non-bespoke species) |
| **P15** | 3-channel chiptune BGM (6 themes), layered SFX |
| **P16** | Shinies (1/512, featured 1/64), quest log (10 quests), daily featured species |
| **P17** | PlayerMovement + BattleMenus extracts, champion/quest/weather e2e |

---

## Active pain points

| # | Issue | Next |
|---|-------|------|
| 1 | Bespoke art coverage | Shape library covers everyone; bespoke grids for starter finals would still help |
| 2 | NpcManager 324 LOC | Next extract: NPC dialog table → data file |

---

## Queued work (prioritized)

### P0 — Hygiene

| ID | Task | Status |
|----|------|--------|
| p0-e2e-full | Full `npm run test:e2e` before release | **done** (2026-06-12) |
| p0-push | Push after green CI | **done** (P9/P10) |

### P5 — Graphics & audio

| ID | Task |
|----|------|
| p5-cc0-bgm | Licensed BGM + CREDITS.md |
| p5-critter-polish | More hand art batches |

### P3 — Art (remaining)

| ID | Task |
|----|------|
| p3-batch6-art | Extend hand pixels to remaining late-game species | partial |
| p3-kenney | Kenney tileset import | **done** |

---

## Key files

| Area | Path |
|------|------|
| Species | `src/data/creatures.ts` |
| Battle flow | `src/scenes/battle/BattleFlow.ts` |
| Battle systems | `src/systems/battle.ts` |
| Asset loader | `src/utils/assetLoader.ts` |
| Art pipeline | `scripts/generate-png-assets.mjs`, `scripts/critter-art/batch7.mjs` |
| E2E battle | `e2e/battle-fight.spec.ts` |
| Verify | `scripts/verify-build.mjs` |
