# Critter Quest — Build Queue

Last updated: 2026-06-09 (P2 input extract + P3 batch6 art + grove walk e2e). **Source of truth for forward work.**

## Snapshot

| Metric | Value |
|--------|-------|
| Species | **100** |
| Maps | 25 |
| Unit tests | 59 (12 files) |
| E2E specs | 15 |
| Dex milestones | 20 / 40 / 60 / 80 / 90 / **100** |
| OverworldScene | **267 LOC** (≤350 target) |
| Verify | ~102 checks, green |

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
| **P6 partial** | Gym 1–4 badge smoke, shop sell, chest loot, **grove walk e2e** |
| **P3 partial** | batch6 hand art (10 species: pier/grove/legendaries) |

---

## Active pain points

| # | Issue | Next |
|---|-------|------|
| 1 | Procedural art 71–100 | batch6 covers 10; extend to full roster |
| 2 | Kenney tileset | manual import |

---

## Queued work (prioritized)

### P0 — Hygiene

| ID | Task | Status |
|----|------|--------|
| p0-e2e-full | Full `npm run test:e2e` before release | pending |
| p0-push | Push after green CI | pending |

### P2 — Refactor (remaining)

| ID | Task | Status |
|----|------|--------|
| p2-trainer-extract | `TrainerBattleHandler.ts` from NpcManager | **done** |
| p2-warp-dialog | `WarpBlockDialog.ts` for bounce-back copy | **done** |
| p2-overworld-trim | Pointer/input helper; OverworldScene < 350 LOC | **done** |

### P3 — Art

| ID | Task |
|----|------|
| p3-batch6-art | Hand pixels for pier/grove/legendary species | **partial** (10 species) |
| p3-kenney | Kenney tileset import |

### P4 — Minigames (remaining)

| ID | Task | Status |
|----|------|--------|
| p4-bug-e2e | Bug catch nightmoth reward | **done** |
| p4-contest-e2e | contest_winner flag | **done** |
| p4-arcade-scene | Optional ArcadeScene | deferred |

### P6 — E2E (remaining)

| ID | Task | Status |
|----|------|--------|
| p6-grove-gate | Grove accessible with badges | **done** (teleport smoke) |
| p6-dex-milestone | Milestone at 20 + 100 caught | **done** |
| p6-shop-sell | Shop sell roundtrip | **done** |
| p6-gym2-4 | Gyms 2–4 badge smoke | **done** |
| p6-chest-loot | Chest interact e2e | **done** |
| p6-grove-walk | Walk onto forest warp tile | **done** |

### P7 — Discoverability

| ID | Task | Status |
|----|------|--------|
| p7-region-hints | Mom/Prof minigame lines | **done** |
| p7-region-map | ★ hinted/visited minigame nodes | **done** |
| p7-fast-travel | Pier/grove/contest in fast travel | **done** |

### P8 — Content “100 species”

| ID | Task | Status |
|----|------|--------|
| p8-species-91-95 | glowfern, stormlet, cavemaw, psychomyst, voidreaper | **done** |
| p8-species-96-100 | solarchion, lunawisp, terradrake, stormcrown, primordix | **done** |
| p8-dex-milestone-90 | Prof reward at 90 caught | **done** |
| p8-dex-milestone-100 | Prof reward at 100 caught | **done** |

### P5 — Graphics & audio

| ID | Task |
|----|------|
| p5-cc0-bgm | Licensed BGM + CREDITS.md |
| p5-critter-polish | Generator v3 or batch art |

---

## Suggested next sprint

1. **P0 full e2e** — release confidence pass
2. **P3 batch6 art** — extend hand pixels to remaining late-game species
3. **P5 CC0 BGM** — licensed music + CREDITS.md

---

## Key files

| Area | Path |
|------|------|
| Species | `src/data/creatures.ts` |
| Trainer battles | `src/scenes/overworld/TrainerBattleHandler.ts` |
| Warp gates | `src/scenes/overworld/WarpBlockDialog.ts` |
| Dex milestones | `src/systems/dexMilestones.ts` |
| Region hints | `src/systems/regionDiscovery.ts` |
| E2E helpers | `e2e/helpers.ts` |
| Verify | `scripts/verify-build.mjs` |
