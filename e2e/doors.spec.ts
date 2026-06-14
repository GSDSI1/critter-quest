import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, waitForScene, walkThroughWarp, waitForMap } from './helpers';

test('walk into heal center and back out through door', async ({ page }) => {
  test.setTimeout(120_000);
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());
  await page.waitForTimeout(500);

  await walkThroughWarp(page, 'town', 8, 6, 8, 8);
  await waitForMap(page, 'heal_center');

  await page.evaluate(() => window.__cq?.teleportAndWalk('heal_center', 4, 7, 4, 8));
  await waitForMap(page, 'town');

  const p = await playerState(page);
  expect(p?.mapId).toBe('town');
});

test('walk into mart through door', async ({ page }) => {
  test.setTimeout(120_000);
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());
  await page.waitForTimeout(500);

  await walkThroughWarp(page, 'town', 10, 6, 10, 8);
  await waitForMap(page, 'mart');

  const p = await playerState(page);
  expect(p?.mapId).toBe('mart');
});
