# Critter Quest — Improvement Gameplan (Cursor-Ready)

Audit date: 2026-06-11 · Repo: github.com/GSDSI1/critter-quest · Phaser 3.88 + TS strict + Vite 6

**Current snapshot:** 95 species · 25 maps · 4 gyms + Victory Road · 3 minigames (fishing, bug catch, contest) · 49 unit tests · 10+ e2e specs · ~100 verify checks. See `docs/BUILD_QUEUE.md` for live counts.

---

## Audit Summary

**What's solid (don't touch the architecture):**
- Clean 3-layer split: `src/data/` (typed tables) → `src/systems/` (pure logic) → `src/scenes/` (render/input)
- `tsc --noEmit` passes clean; save validation + versioned migration (v3)
- `MapRenderer` tilemap layer (not per-tile Images); lazy scene registration + Phaser chunk split
- BFS tap-to-walk (`walkPath.ts`), day/night cycle, region fog, dex milestones, visited maps
- Hybrid art pipeline: PNG overrides with procedural fallback via `meta.json`
- CI: lint, verify (~100 checks), Vitest (49), Playwright e2e, GitHub Pages deploy

**Top problems remaining:**

| # | Problem | Evidence | Impact |
|---|---------|----------|--------|
| 1 | Most art still procedural | Species 71–87 lack hand pixel art; Kenney tileset not integrated | Game looks like a prototype |
| 2 | God files >300 LOC | `NpcManager.ts` ~655, `sprites.ts` ~923, `BattleScene` ~400+ | Hard to iterate in Cursor |
| 3 | `Math.random` in battle systems | battle.ts, encounters.ts, etc. — rules say injectable `Rng` | Some battle paths untestable |
| 4 | Audio mostly procedural | WebAudio beeps; BGM stubs optional | Feels unfinished |
| 5 | Minigame discoverability | Region map `???` until visited; no quest pointers | Players miss pier/grove/contest |
| 6 | Content headroom | 87/100 species target; some rares single-stage | Dex completionists want more |

---

## How to use this plan in Cursor

1. Commit this file to repo root as `GAMEPLAN.md`.
2. Work one phase at a time; each task below has a ready-to-paste Cursor prompt.
3. After every task: `npm run verify && npx tsc --noEmit` (already in `.cursor/rules`).
4. Add the rules block at the bottom of this doc to `.cursor/rules/critter-quest.mdc`.

---

## Phase 0 — Foundation (do first, ~1 day)

Unblocks safe refactoring everywhere else.

### 0.1 Add Vitest + unit tests for systems
> **Cursor prompt:** Add vitest as a devDependency with a `test:unit` script. Write unit tests for `src/systems/battle.ts` (damage calc, stage multipliers, type effectiveness), `src/systems/stats.ts` (level-up curves, IV/nature stat math), `src/systems/save.ts` (validateSaveData accepts v3, migrates v2/v1, rejects garbage), and `src/systems/status.ts`. Target ≥80% line coverage on systems/. Don't modify game logic except to export what tests need.

### 0.2 Injectable RNG (finish the planned migration)
> **Cursor prompt:** Create `src/systems/rng.ts` with an injectable `Rng` interface (`next(): number`, plus helpers `int(min,max)`, `chance(p)`, `pick(arr)`), a default Math.random implementation, and a `SeededRng` (mulberry32) for tests. Replace all 12 direct `Math.random` calls in src/systems/ and src/data/ with the injected Rng. Thread it through battle.ts function signatures. Update unit tests to use SeededRng for deterministic assertions. Scenes may keep Math.random for cosmetics only.

### 0.3 Split oversized files
> **Cursor prompt:** Refactor without behavior changes, keeping every file under ~300 lines: split `src/utils/sprites.ts` into sprites/creatures.ts, sprites/tiles.ts, sprites/npcs.ts, sprites/player.ts, sprites/battleBg.ts with an index.ts re-export; split `src/scenes/BattleScene.ts` into BattleScene.ts (orchestration) + battle/BattleUi.ts (HP bars, menus) + battle/BattleAnims.ts (tweens/shake/flash); split `src/scenes/OverworldScene.ts` by extracting overworld/MapRenderer.ts and overworld/NpcManager.ts; split `src/data/maps.ts` into `src/data/maps/` one file per map + index. Run npm run verify and tsc after; all e2e tests must still pass.

### 0.4 Build hygiene
> **Cursor prompt:** In vite.config.ts add `build.rollupOptions.output.manualChunks` to split phaser into its own chunk, and set chunkSizeWarningLimit appropriately. Add ESLint (typescript-eslint, flat config) + a `lint` script enforcing no-explicit-any and no floating promises. Add a GitHub Actions workflow `.github/workflows/ci.yml` running install, lint, verify, tsc, unit tests, build, and Playwright e2e on push/PR to main.

---

## Phase 1 — Performance (~1 day)

### 1.1 Tilemap rendering for procedural path
> **Cursor prompt:** In OverworldScene the procedural fallback draws one `add.image` per tile (lines ~240-247). Replace with a real Phaser tilemap: at boot, bake the procedural tile textures into a single spritesheet texture (use a hidden RenderTexture or canvas, frame index = tile ID matching public/assets/tiles/README.md), then use `make.tilemap` + `createLayer` for both procedural and external art paths — one code path. Keep animated water/tall-grass via Phaser tile animation or a small overlay layer of only the animated tiles. Decor/signs stay as images. Verify scene start is visibly faster on the largest map and all e2e tests pass.

### 1.2 Texture generation caching
> **Cursor prompt:** `generateAssets` redraws all procedural textures every boot. Cache generated creature/tile/NPC textures: generate once in BootScene, guard with `scene.textures.exists(key)`, and ensure scene restarts (Overworld restart on teleport) never regenerate. Profile boot time before/after and report numbers.

### 1.3 Lazy-load heavy scenes
> **Cursor prompt:** All 17 scenes load in main.ts config. Keep Boot/Intro/Menu eager; register the rest via `scene.add` with dynamic `import()` so Vite code-splits them. Ensure scene keys are unchanged and e2e tests pass.

---

## Phase 2 — Graphics overhaul (~3-5 days, biggest visible win)

The asset pipeline already supports PNG overrides — the work is producing real art and upgrading the renderer to use it well.

### 2.1 Real tileset
> **Cursor prompt:** Integrate a CC0 16×16 tileset (Kenney Tiny Town / Roguelike pack — see public/assets/tiles/README.md for the required 19-tile index order). Write `scripts/pack-tileset.mjs` that takes source PNGs and emits public/assets/tiles/tileset.png in the correct frame order. Set meta.json placeholder:false. Add autotiling for water/path edges (47-blob or simple 16-case bitmask) in MapRenderer so transitions aren't hard squares.

### 2.2 Critter sprite upgrade — generated pixel art
> **Cursor prompt:** Upgrade scripts/generate-png-assets.mjs from flat shapes to real pixel-art: per-species palette ramps (3-4 shades from def.color), 1px dark outline, dithered shading, eye highlights, and type-specific details (flames, leaves, fins per element). Output 64×64 battle + 32×32 overworld PNGs for all 27 species. Add a `_back.png` variant (rear view) for the player's battle sprite instead of reusing the front. Keep deterministic output (seed from species id).

### 2.3 Critter animation
> **Cursor prompt:** Add 2-frame idle animation support: extend the asset pipeline to emit `{id}_f2.png`, load both frames as an animation in BattleScene (replace the y-bob tween with frame animation + subtle bob). Add entry animations (slide/scale-in), faint animation (flatten + fade), and per-move-type attack VFX using Phaser particles (flame burst, leaf swirl, water splash, spark, rock shard, shadow wisp — keyed off move element).

### 2.4 Overworld player/NPC animation polish
> **Cursor prompt:** Player walk uses generated frames — verify 4-direction × 2-frame walk cycles render correctly with the new art style, add NPC idle facing changes (random direction flips every few seconds), grass rustle particle when walking through tall grass, and footstep dust on path tiles.

### 2.5 UI/UX skin
> **Cursor prompt:** Create a consistent 9-slice UI theme: generated panel texture (rounded pixel border) used by DialogBox, HUD, battle menus, shop, party screens — replace ad-hoc Graphics rectangles. Add a unified font (load a pixel webfont like 'Press Start 2P' or monogram via index.html, with fallback), text shadow for readability, and screen transitions (fade/wipe) between scenes via a shared helper in src/ui/transitions.ts.

### 2.6 Real audio
> **Cursor prompt:** Replace oscillator beeps: keep audio.ts API surface (Sfx.menuSelect etc.) but back it with small generated/CC0 sound files loaded through Phaser audio; add looping background music per map theme + battle theme (CC0 chiptune, e.g. from OpenGameArt), volume settings (master/music/sfx) persisted to localStorage, and a mute toggle in PauseMenuScene. Add the new files under public/assets/audio/ with attribution in a CREDITS.md.

---

## Phase 3 — Game buildout (~1-2 weeks, content)

### 3.1 Content pass: species + moves
> **Cursor prompt:** Expand from 27 to 45+ species using the existing CreatureDef table format in src/data/creatures.ts: add 2 new types to the chart (e.g. Ice, Psychic) with full effectiveness rows, 3-stage evolution lines for each starter family, and 20+ new moves with status/stat-stage effects. Update learnsets.ts, encounters.ts, evolutions.ts. npm run verify must pass — extend verify-build.mjs checks to cover the new counts.

### 3.2 World expansion: gyms 3-4 + routes
> **Cursor prompt:** Using the ASCII map format in src/data/maps/ (t() legend), add: Route 4, Glacier Pass, Frostvale City + Gym 3 (Ice leader), Route 5, Mindspire Tower + Gym 4 (Psychic leader), each with 2-3 trainers, encounter tables, warps wired into existing maps, gate requirements on badges, and NPC dialog. Follow the difficulty curve: wild levels ~18-26, gym leaders 24/28.

### 3.3 Endgame: Victory Road + Elite Four
> **Cursor prompt:** Add a badge-gated Victory Road cave map and an Elite Four gauntlet: 4 consecutive trainer battles + champion (rival with evolved team), no healing between rounds except limited items, a HallOfFameScene recording party + completion time to the save, and credits roll. Reuse TrainerIntroScene/VictoryScene patterns.

### 3.4 Systems depth
> **Cursor prompt:** Add held items (slot on CritterInstance + save migration with version bump per .cursor rules), 5 held items affecting battle (crit boost, status cure, pinch berry, type boosters), trainer rematch scaling after Elite Four, and a day/night tint cycle on outdoor maps affecting 2-3 encounter tables.

### 3.5 Quality of life
> **Cursor prompt:** Add: run-toggle setting, battle text speed setting, options scene reachable from pause menu (persists to localStorage), critter nickname editing from PartyScene (NicknameScene exists), Critterdex detail page showing evolution chain + learnset, and an in-game map/fast-travel between visited heal centers after badge 3.

---

## Phase 4 — Ship it (~1 day)

### 4.1 Deploy + PWA
> **Cursor prompt:** Add GitHub Pages deploy (workflow building to dist with base './' already set), a PWA manifest + service worker (vite-plugin-pwa) for offline play, favicon/app icons from the emberpup sprite, and an in-game version string sourced from package.json.

### 4.2 E2E expansion
> **Cursor prompt:** Extend Playwright e2e to cover: full battle win/lose/catch flows via the __cq test bridge (add battle helpers to the bridge), shop buy/sell, PC deposit/withdraw, save/continue roundtrip, and gym 1 badge acquisition. Keep each spec under 60s.

---

## Suggested additions to `.cursor/rules/critter-quest.mdc`

```
- Unit tests (vitest) are required for any change to src/systems/ — use SeededRng, never real randomness in tests.
- All new art goes through the asset pipeline (scripts/generate-png-assets.mjs or public/assets/ PNG overrides) — never inline base64 or new procedural drawing in scenes.
- New maps use the ASCII t() format, one file per map in src/data/maps/, and must be registered in the maps index + have an encounter table + at least one warp in AND out.
- New species/moves/items must update verify-build.mjs counts in the same PR.
- Performance: never add per-tile GameObjects; map rendering goes through MapRenderer/tilemap layers.
- Audio: all sounds via the Sfx/music API in src/utils/audio.ts; respect persisted volume settings.
```

---

## Order of operations

```
Phase 0 (foundation) → Phase 1 (perf) → Phase 2 (graphics) → Phase 3 (content) → Phase 4 (ship)
```

Phases 2 and 3 can interleave once Phase 0 lands. Estimated total: 3-4 weeks part-time.
