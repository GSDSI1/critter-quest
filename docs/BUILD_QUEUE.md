# Critter Quest — Build Queue

Last updated: 2026-06-11 (P1 UX sprint). Source: `GAMEPLAN.md` + post-sprint audit.

## Snapshot

| Metric | Value |
|--------|-------|
| Species | 90 |
| Maps | 25 |
| Scenes (lazy) | 20+ incl. Fishing / BugCatch / CritterContest |
| Unit tests | 54 (10 files) |
| E2E specs | 10 |
| Verify checks | ~100+, green |
| Unpushed commits | 5+ on `main` (movement sprint → P1 UX) |

`GAMEPLAN.md` audit refreshed 2026-06-11 — use verify + this file for exact counts.

---

## Analysis — what to improve

### High player pain (fix first)

1. ~~**Night-gated content is invisible**~~ — **Done:** ☾/☀ HUD + Ranger Lee lock hints.
2. ~~**Dex milestones only at lab**~~ — **Done:** toast on catch via `dexNotify.ts`; claim still at lab.
3. ~~**Intro/tutorial locks movement**~~ — **Done:** B/X skip + shorter intro; `saw_controls` on skip.
4. **Minigame discoverability** — Pier / grove / contest exist but region map shows `???` until visited; no quest-style pointers after badge milestones.
5. ~~**Hold-to-walk incomplete**~~ — **Done:** hold on map re-paths when queue empties.

### Code health (medium)

| Issue | Location | Notes |
|-------|----------|-------|
| God file | `NpcManager.ts` (~655 LOC) | interact, warps, chests, minigames, trainers — split candidates: `NpcInteract.ts`, `WarpHandler.ts`, `ChestRewards.ts` |
| Large scene | `OverworldScene.ts` (~418 LOC) | Walk queue + input could move to `WalkController.ts` |
| Cosmetic RNG | `NpcManager`, minigame scenes | `Math.random` for arcade/chest mom gift — OK for cosmetics; wild encounters should use injectable `Rng` |
| Procedural art gap | Species 71–87 | Only batch5 + starters have hand pixel art; rest are generator shapes |
| Duplicate dex species | `nightmoth` (#49) → `moonmoth` (#72) | Works mechanically; Critterdex evo tab may confuse (same line, non-adjacent dex #s) |

### Content gaps (lower urgency)

- No evo for **tidepod**, **embermite**, **psychoglow**, **abysswisp** (endgame rare stays single-stage — OK or add 1 stage each).
- **Fishing pier** has no wild encounters (intentional interior); could add pier atmosphere NPC dialog loop.
- **Contest** daily limit uses `lastContestDay` but no visible “come back tomorrow” on hall sign after win.
- **Arcade** (`COIN` in Ember City) is inline RNG only — plan mentioned optional dedicated scene.
- Target **100 species** for “complete” regional dex feel (~13 more).

### Already solid (don't re-open)

- Tilemap path in `MapRenderer` (not per-tile Images for base layer)
- Lazy scenes + Phaser chunk split
- CI: lint, verify, unit, build, e2e
- GitHub Pages deploy workflow
- Walk BFS, 25 maps, 4 gyms, Victory Road, rematches, fast travel (Frost badge+)

---

## Queued work (prioritized)

### P0 — Ship & hygiene (~30 min) ✅ 2026-06-11

| ID | Task | Status |
|----|------|--------|
| p0-push | `git push origin main` | pending after verify |
| p0-gameplan | Refresh `GAMEPLAN.md` audit summary | done |
| p0-e2e-ci | Full `npm run test:e2e` green before push | pending |

### P1 — UX sprint “discoverability” ✅ 2026-06-11

| ID | Task | Status |
|----|------|--------|
| p1-night-hud | Moon icon + “Night” on outdoor HUD | done (`HUD.ts`) |
| p1-bug-hint | Ranger Lee locked-state dex/night hints | done |
| p1-dex-toast | Milestone toast on catch | done (`dexNotify.ts`) |
| p1-walk-hold | Map hold re-paths when queue empty | done |
| p1-skip-tutorial | B/X skip intro | done |

### P2 — Refactor (~1 session, no behavior change)

| ID | Task | Acceptance |
|----|------|------------|
| p2-split-npc | Extract `ChestRewards.ts` + `MinigameLaunchers.ts` from `NpcManager` | NpcManager < 400 LOC; e2e green |
| p2-split-walk | Extract `WalkController.ts` from `OverworldScene` | OverworldScene < 300 LOC |
| p2-warp-tests | Unit tests: `requiresAllBadges`, `requiresFlag`, champion OR badges grove gate | `walkPath.test.ts` or new `warps.test.ts` |

### P3 — Content batch “90 species” (~1–2 sessions)

| ID | Task | Notes |
|----|------|-------|
| p3-species-90 | Add 88–90 (3 species) + encounters + learnsets | e.g. contest-themed, grove rare, volcanic evo |
| p3-evo-lines | tidepod→tidewrack, embermite→embercoil (optional 2-stage) | Fill dex gaps |
| p3-batch6-art | `scripts/critter-art/batch6.mjs` for 71–87 highlights | Match batch5 quality for pier/grove species |
| p3-contest-sign | Frostvale + hall signs show daily reset hint | `lastContestDay` copy |

### P4 — Minigames & fun layer v2 (~1 session)

| ID | Task | Notes |
|----|------|-------|
| p4-fishing-e2e | E2E: complete 1 cast, assert reward dialog | Extend `minigames.spec.ts` |
| p4-highscores | `storyFlags.fishing_best`, `bug_best`, persist in save v3 | Pause menu or minigame shell |
| p4-arcade-scene | Optional `ArcadeScene` (replace inline COIN dialog) | Low priority |
| p4-more-chests | 2–3 chests on route4 / glacier_pass / contest_hall | Reuse CHEST token |

### P5 — Graphics & audio (multi-day, optional)

| ID | Task | Notes |
|----|------|-------|
| p5-kenney | Drop Kenney tiles + `npm run import-tileset` | See `public/assets/tiles/README.md` |
| p5-cc0-bgm | Replace procedural BGM WAV with licensed loops + `CREDITS.md` | |
| p5-critter-polish | Generator v3: outline + dither for all 87 | Or continue hand batches |

### P6 — E2E & QA expansion

| ID | Task |
|----|------|
| p6-shop-sell | E2E shop sell roundtrip |
| p6-grove-gate | E2E warp to secret_grove with verdant+ember badges |
| p6-dex-milestone | E2E prof grants milestone at 20 caught |
| p6-gym2-4 | Smoke gym 2–4 badge via `__cq` bridge |

---

## Suggested next sprint (pick one)

**Recommended: P0 + P1** — ship unpushed work, then night HUD + dex toast + walk hold. Highest impact per hour for players who just got minigames/maps.

**Alternative: P2 + P3** — refactor NpcManager then species 90 batch if prioritizing maintainability + content.

---

## Done (historical)

| Phase | Item | Status |
|-------|------|--------|
| 0–4 | Core game + content + ship | ✓ |
| **Opt** | Tiered boot / lazy scenes / map cache / PWA | ✓ |
| **Opt** | Critter texture atlas | ✓ |
| **Opt** | Autotiles, battle VFX, BGM, touch nav, region map | ✓ |
| **Opt** | 50→70 species content batches | ✓ |
| **Sprint** | Walk pathfinding, 3 maps, minigames, fun layer | ✓ |
| **Sprint+** | visitedMaps fog, drag-retarget, species 71–75 | ✓ |
| **Content** | Species 76–87, dex milestones, minigame e2e | ✓ |

## Optional polish (deferred)

| Item | Notes |
|------|-------|
| Kenney art files | Drop PNGs in `public/assets/tiles/kenney/` |
| CC0 music file loops | Licensed chiptune replacement |

## Verify

```bash
npm run gen-assets
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
