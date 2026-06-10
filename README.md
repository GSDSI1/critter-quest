# Critter Quest

An original creature-collecting RPG inspired by classic monster-taming games. Phaser 3 + TypeScript.

## Play

```bash
npm install
npm run dev        # http://localhost:5180 (auto-frees port if stale)
npm run verify     # static completeness audit (93 checks)
npm run build      # production build → dist/
npm run check      # verify + build
```

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Z / Enter / Space | Confirm / talk |
| ESC / B | Back / close |
| P | Menu (Critterdex, Party, Save) |
| X / Y | Party |
| Shift / L1 | Run (after beating rival Kai) |

### Gamepad

| Button | Action |
|--------|--------|
| D-pad / Left stick | Move |
| A | Confirm |
| B | Back |
| Y | Party |
| Start | Pause menu |
| L1 | Run |

## Start flow

```
Boot (loading) → Intro splash → Title menu
  → New Game: Character select (look + name)
    → Professor lab intro → Starter table (3 orbs)
    → Controls tutorial → Verdant Town
  → Continue: resume save (summary on title screen)
```

## Features

### World (14 maps)

Verdant Town, Route 1, Forest, Route 2, Mossgrove City, Gym 1, Crystal Cave, Route 3, Ember City, Gym 2, Volcanic Path — plus Healing Center, Mart, and Research Lab interiors.

### Critters & battle

- **27 species** with evolution chains, abilities, natures, and IVs
- **6 types** with effectiveness chart
- **Status effects** — burn, paralyze, poison, sleep, freeze, confusion
- **Learn-move UI** when leveling up with a full moveset
- **Nickname prompt** on capture

### Items & progression

- Potions, Revive, Capture Orbs, held items (Mart)
- **Critterdex** — habitat, footprints, type icons
- **2 Gym badges** — Verdant (Leader Ivy) and Ember (Leader Cole)
- **Rival arc** — 3 battles with Kai (type counter to your starter)
- **PC storage** at Healing Centers

### Trainer

- **4 trainer presets** — Scout, Ranger, Scholar, Ace (your overworld + VS sprite)
- Name entry at new game
- Save v3 with character ID, story flags, rematch tracking

### Polish

- Screen-pinned UI (dialog, HUD, controls overlay)
- Interior camera (full room visible in heal/mart/lab)
- Themed procedural tiles + animated water/grass
- Keyboard + gamepad via unified input service
- Optional PNG tileset/critter drop-in (`meta.json` `placeholder: false`)

## Story path


1. Pick your trainer and starter at Prof. Elmwood's lab
2. Battle rival Kai on Route 1
3. Explore the forest; defeat Ranger Mia to unlock Route 2
4. Earn the Verdant Badge in Mossgrove → Crystal Cave & Route 3
5. Ember City, Gym Leader Cole, Volcanic Path
6. Defeat Kai's final battle with both badges → **Champion ending** (rolling credits)

## Assets

Procedural art is used by default. To use custom PNG sprites:

1. Replace files in `public/assets/` (see `public/assets/tiles/README.md` for tileset layout)
2. Set `public/assets/meta.json`:

```json
{ "placeholder": false, "version": 1 }
```

Regenerate placeholder PNGs: `npm run gen-assets`
