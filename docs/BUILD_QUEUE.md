# Critter Quest — Build Queue

Last updated: 2026-06-11 (P7 discoverability + P8 species 95). **Source of truth for forward work.**

## Snapshot

| Metric | Value |
|--------|-------|
| Species | **95** |
| Maps | 25 |
| Unit tests | 59 (12 files) |
| E2E specs | 14 |
| Dex milestones | 20 / 40 / 60 / 80 / **90** |
| Verify | ~100 checks, green |

---

## Shipped (cumulative)

| Band | Deliverables |
|------|----------------|
| Movement sprint | BFS walk, 25 maps, 3 minigames, fun layer, species 71–87 |
| P1 UX | Night HUD, dex toasts, intro skip, map hold-walk |
| P2 | ChestRewards, MinigameHandlers, WalkController, warpGates |
| P3 | Species 88–90, evo lines, contest sign |
| P4 | Minigame bests, fishing/bug/contest e2e, 3 chests |
| **P7** | `regionDiscovery.ts`, region map hints (★ nodes), Mom/Prof lines, fast travel to minigames |
| **P8 partial** | Species 91–95, psychoglow→psychomyst, abysswisp→voidreaper, dex milestone 90 |

---

## Active pain points

| # | Issue | Next |
|---|-------|------|
| 1 | NpcManager still ~550 LOC | Trainer battle extract |
| 2 | Procedural art 71–95 | batch6 hand art |
| 3 | 95/100 species | Final 5 legendaries |
| 4 | Grove walk e2e flaky | Optional: `stepOntoWarp` test bridge |

---

## Queued work (prioritized)

### P0 — Hygiene

| ID | Task | Status |
|----|------|--------|
| p0-e2e-full | Full `npm run test:e2e` before release | pending |
| p0-push | Push after green CI | pending |

### P2 — Refactor (remaining)

| ID | Task |
|----|------|
| p2-trainer-extract | `TrainerBattleHandler.ts` from NpcManager |
| p2-warp-dialog | `WarpBlockDialog.ts` for bounce-back copy |
| p2-overworld-trim | Pointer/input helper; OverworldScene < 350 LOC |

### P3 — Art

| ID | Task |
|----|------|
| p3-batch6-art | Hand pixels for pier/grove species 71–87 |
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
| p6-dex-milestone | Milestone at 20 caught | **done** |
| p6-shop-sell | Shop sell roundtrip | queued |
| p6-gym2-4 | Gyms 2–4 badge smoke | queued |
| p6-chest-loot | Chest interact e2e | queued |
| p6-grove-walk | Walk onto forest warp tile | queued |

### P7 — Discoverability

| ID | Task | Status |
|----|------|--------|
| p7-region-hints | Mom/Prof minigame lines | **done** |
| p7-region-map | ★ hinted/visited minigame nodes | **done** |
| p7-fast-travel | Pier/grove/contest in fast travel | **done** |
| p7-frostvale-sign | Frostvale guide mentions contest | done (existing sign) |

### P8 — Content “100 species”

| ID | Task | Status |
|----|------|--------|
| p8-species-91-95 | glowfern, stormlet, cavemaw, psychomyst, voidreaper | **done** |
| p8-species-96-100 | 5 endgame species | queued |
| p8-dex-milestone-90 | Prof reward at 90 caught | **done** |
| p8-evo-finish | Remaining single-stage rares | optional |

### P5 — Graphics & audio

| ID | Task |
|----|------|
| p5-cc0-bgm | Licensed BGM + CREDITS.md |
| p5-critter-polish | Generator v3 or batch art |

---

## Suggested next sprint

1. **P8 species 96–100** — finish regional dex
2. **P2 trainer extract** — maintainability before more content
3. **P6 gym2–4 + shop sell e2e** — CI confidence

---

## Verify

```bash
npm run gen-assets
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```

## Key files

| Area | Path |
|------|------|
| Region discovery | `src/systems/regionDiscovery.ts` |
| Fast travel | `src/systems/healTravel.ts` |
| Minigame scores | `src/systems/minigameScores.ts` |
| Dex milestones | `src/systems/dexMilestones.ts` |
| Test bridge | `src/main.ts` → `__cq` |
