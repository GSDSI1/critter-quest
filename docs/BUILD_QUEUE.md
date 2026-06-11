# Critter Quest — Build Queue

Last updated: 2026-06-11 (P4 minigames + full backlog). Source: `GAMEPLAN.md` + sprint audits.

## Snapshot

| Metric | Value |
|--------|-------|
| Species | 90 |
| Maps | 25 (+ 3 new chests on route4 / glacier / contest hall) |
| Scenes (lazy) | 20+ incl. Fishing / BugCatch / CritterContest |
| Unit tests | 56 (11 files) |
| E2E specs | 11 (incl. fishing completion) |
| Verify checks | ~100+, green |
| Unpushed | 1 commit (`2871cdf` P2+P3) + P4 in progress |

Use **verify + this file** for counts — not stale `GAMEPLAN.md` line items.

---

## Shipped (2026-06-11)

| Band | Deliverables |
|------|----------------|
| **Movement sprint** | BFS walk, 25 maps, 3 minigames, fun layer, species 71–87 |
| **P1 UX** | Night HUD, bug hints, dex toasts, intro skip, map hold-walk |
| **P2 refactor** | `ChestRewards`, `MinigameNpcHandlers`, `WalkController`, `warpGates` + tests |
| **P3 content** | Species 88–90 (tidewrack, embercoil, prizefawn), evo lines, contest sign |
| **P4 (this session)** | Minigame bests, fishing e2e, 3 chests, contest daily host hint |

---

## Active pain points

| # | Issue | Next fix |
|---|-------|----------|
| 1 | **Minigame discoverability** | Region map `???` fog; no post-badge quest hints to pier/grove/hall |
| 2 | **God file** | `NpcManager.ts` ~537 LOC — trainer battles + warp dialogs still inline |
| 3 | **Procedural art** | Species 71–90 lack hand pixel art (batch6 queued) |
| 4 | **Dex headroom** | 90/100 species — psychoglow, abysswisp still single-stage |
| 5 | **Arcade** | Ember City `COIN` token is inline RNG — optional `ArcadeScene` |

---

## Queued work (prioritized)

### P0 — Ship (~15 min)

| ID | Task | Status |
|----|------|--------|
| p0-push | `git push origin main` (P2+P3+P4) | **do after verify** |
| p0-e2e-full | Full `npm run test:e2e` green | pending |
| p0-gameplan-90 | Bump `GAMEPLAN.md` snapshot to 90 species | pending |

### P2 — Refactor (remaining)

| ID | Task | Notes |
|----|------|-------|
| p2-trainer-extract | `TrainerBattleHandler.ts` from NpcManager | launchBattle, rematch, gauntlet |
| p2-warp-dialog | `WarpBlockDialog.ts` — badge/flag bounce-back copy | Uses `warpGates.ts` |
| p2-overworld-trim | OverworldScene < 350 LOC | pointer/input helper |

### P3 — Content (remaining)

| ID | Task | Notes |
|----|------|-------|
| p3-batch6-art | `scripts/critter-art/batch6.mjs` for pier/grove 71–87 | Hand pixels |
| p3-species-100 | Species 91–100 (10 more) | Route toward full regional dex |
| p3-evo-psychic | psychoglow→?, abysswisp→? | Optional 1-stage each |
| p3-frostvale-sign | Frostvale town sign → contest hall pointer | Discoverability |

### P4 — Minigames & fun v2

| ID | Task | Status |
|----|------|--------|
| p4-fishing-e2e | Complete cast via `resolveFishing(2)`, dex grows | **done** |
| p4-highscores | `fishing_best` / `bug_best` in save + pause menu | **done** |
| p4-more-chests | route4, glacier_pass, contest_hall | **done** |
| p4-contest-daily | Host Vera warns if already entered today | **done** |
| p4-bug-e2e | `resolveBugCatch(30)` → nightmoth in dex | queued |
| p4-contest-e2e | Win contest → `contest_winner` flag | queued |
| p4-arcade-scene | Dedicated `ArcadeScene` (low priority) | deferred |

### P5 — Graphics & audio (multi-day)

| ID | Task |
|----|------|
| p5-kenney | Kenney tiles + `npm run import-tileset` |
| p5-cc0-bgm | Licensed BGM loops + `CREDITS.md` |
| p5-critter-polish | Generator v3 or batch6 hand art |

### P6 — E2E & QA expansion

| ID | Task |
|----|------|
| p6-shop-sell | Shop sell roundtrip |
| p6-grove-gate | secret_grove warp with verdant+ember badges |
| p6-dex-milestone | Prof grants reward at 20 caught |
| p6-gym2-4 | Smoke gyms 2–4 via `__cq` |
| p6-chest-loot | Open route4/glacier chest via interact |

### P7 — Discoverability sprint (recommended next UX)

| ID | Task | Acceptance |
|----|------|------------|
| p7-region-hints | After badge N, Mom/prof mention pier/grove/contest | 1 dialog line each |
| p7-region-map-labels | Visited minigame maps show icon on region map | Not just `???` after visit |
| p7-fast-travel-minigames | Frost badge+ unlocks contest hall in fast travel | Optional |

### P8 — Content batch “100 species”

| ID | Task |
|----|------|
| p8-species-91-95 | Mid-game gap fillers (route6?, cave rares) |
| p8-species-96-100 | Endgame legendaries / pseudo-legendaries |
| p8-dex-milestone-90 | Prof reward at 90 caught (optional 5th milestone) |

---

## Suggested next sprint

**Pick one:**

1. **P0 ship + P7 discoverability** — push + quest hints (highest player ROI)
2. **P2 finish + P6 e2e** — maintainability + CI confidence
3. **P8 species 91–95** — content velocity toward 100 dex

---

## Done (historical)

| Phase | Item |
|-------|------|
| 0–4 | Core game, CI, Pages deploy |
| Opt | Atlas, autotiles, BGM, region map, touch nav |
| Sprint | Walk BFS, 25 maps, minigames, fun layer, 70→90 species |
| P1 | Night HUD, dex toast, intro skip, walk hold |
| P2 | ChestRewards, MinigameHandlers, WalkController, warpGates |
| P3 | Species 88–90, evo lines, contest sign |
| P4 | High scores, fishing e2e, 3 chests, contest daily hint |

---

## Verify

```bash
npm run gen-assets
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```

## Key files

| Area | Path |
|------|------|
| Walk | `src/scenes/overworld/WalkController.ts` |
| NPC minigames | `src/scenes/overworld/MinigameNpcHandlers.ts` |
| Chest loot | `src/scenes/overworld/ChestRewards.ts` |
| Warp gates | `src/systems/warpGates.ts` |
| Minigame scores | `src/systems/minigameScores.ts` |
| Dex notify | `src/systems/dexNotify.ts` |
| Test bridge | `src/main.ts` → `window.__cq` |
