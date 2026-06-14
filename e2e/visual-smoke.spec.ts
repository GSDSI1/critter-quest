import { test, expect } from '@playwright/test';
import { gotoFresh, waitForScene, waitForBattleReady, skipIntroToMenu } from './helpers';

test('boot loads atlas critter graphic for emberpup', async ({ page }) => {
  await gotoFresh(page);
  await waitForScene(page, 'Menu');
  const ok = await page.evaluate(() => window.__cq?.hasCreatureGraphic('emberpup') ?? false);
  expect(ok).toBe(true);
});

test('starter select scene loads', async ({ page }) => {
  await gotoFresh(page);
  await skipIntroToMenu(page);
  await page.evaluate(() => window.__cq?.startStarterSelect());
  await waitForScene(page, 'StarterSelect');
  const keys = await page.evaluate(() => window.__cq?.sceneKeys() ?? []);
  expect(keys).toContain('StarterSelect');
});

test('wild battle skips TrainerIntro scene', async ({ page }) => {
  await gotoFresh(page);
  await skipIntroToMenu(page);
  await page.evaluate(() => window.__cq?.startWildBattle('mossling', 'route1'));
  await waitForScene(page, 'Battle');
  await waitForBattleReady(page);
  const keys = await page.evaluate(() => window.__cq?.sceneKeys() ?? []);
  expect(keys).toContain('Battle');
  expect(keys).not.toContain('TrainerIntro');
});
