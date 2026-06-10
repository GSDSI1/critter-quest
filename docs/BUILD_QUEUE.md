# Critter Quest — Build Queue

Last updated: 2026-06-10. Source: `GAMEPLAN.md`.

## Done

| Phase | Item | Status |
|-------|------|--------|
| 0–1 | Foundation + performance | ✓ |
| 2.1 | Pixel tileset (`pack-tileset.mjs` + `tileset.png`) | ✓ |
| 2.2 | 45-species PNG pipeline (front/f2/back, 64+32) | ✓ |
| 2.3 | Battle idle frames + move VFX particles | ✓ |
| 2.4 | Walk FX particles, 32px NPCs | ✓ |
| 2.5 | Press Start 2P font + ui_panel nine-slice | ✓ |
| 2.6 | WAV SFX + procedural map/battle music | ✓ |
| 3.1–3.5 | Content + systems + QoL | ✓ |
| 4 | PWA, deploy, E2E | ✓ |

## Optional polish (future)

| Item | Notes |
|------|-------|
| Kenney tileset drop-in | Replace `tileset.png` from external pack; re-run pack script |
| Battle entry/faint tweens | Extra anims beyond idle + VFX |
| NPC random facing idle | Cosmetic overworld |
| Options audio controls | Music/SFX volume steps + mute in Options scene | ✓ |

## Verify

```bash
npm run gen-assets   # regenerate PNG + tileset + audio
npm run verify && npx tsc --noEmit && npm run test:unit && npm run test:e2e
```
