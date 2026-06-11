# External Tileset (Optional)

Drop a **16×16 pixel** tileset PNG here to replace procedural overworld tiles.

## Enable

1. Add `tileset.png` to this folder (spritesheet grid, left-to-right top-to-bottom).
2. Set `"placeholder": false` in [`../meta.json`](../meta.json).

Procedural art remains the fallback when `placeholder` is true or the file is missing.

## Tile index order

Must match the legend in [`src/data/maps.ts`](../../src/data/maps.ts):

| Index | Type |
|------:|------|
| 0 | Grass |
| 1 | Path |
| 2 | Tall grass |
| 3 | Water |
| 4 | Tree |
| 5 | Wall |
| 6 | Floor |
| 7 | Door |
| 8 | Roof |
| 9 | Heal pad |
| 10 | Sign |
| 11 | Flower |
| 12 | Rock |
| 13 | Bridge |
| 14 | Fence |
| 15 | Sand |
| 16 | Cave floor |
| 17 | Cave wall |
| 18 | Mart counter |
| 19–20 | Tall grass / water anim alt frames |
| 21–35 | Grass↔path autotile (16-case bitmask, masks 1–15) |
| 36–50 | Grass/path↔water shore autotile (masks 1–15) |

## Recommended sources

- [Kenney Tiny Town](https://kenney.nl/assets/tiny-town) (CC0)
- [Kenney Roguelike/RPG packs](https://kenney.nl/assets) (CC0)

Repack into a single 16×N column spritesheet (16px wide frames) or a grid where frame index = tile ID above.

## Kenney drop-in (recommended)

1. Place 16×16 PNGs in [`kenney/`](kenney/).
2. Map filenames → frame indices in [`kenney-map.json`](kenney-map.json).
3. Run `npm run import-tileset` (merges into `tileset.png` without touching unmapped frames).

**Do not** run `npm run pack-tileset` after importing Kenney art — it overwrites the sheet. Re-run `import-tileset` instead.

`npm run gen-assets` calls `pack-tileset` internally; re-import Kenney tiles after `gen-assets` if you use both.
