import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, waitForScene } from './helpers';

test('walk into heal center and back out through door', async ({ page }) => {
  test.setTimeout(120_000);
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());
  await page.waitForTimeout(500);

  await page.evaluate(() => window.__cq?.walkToWarp('town', 8, 6));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'heal_center',
    undefined,
    { timeout: 35_000 },
  );

  await page.evaluate(() => window.__cq?.teleportAndWalk('heal_center', 4, 7, 4, 8));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'town',
    undefined,
    { timeout: 35_000 },
  );

  const p = await playerState(page);
  expect(p?.mapId).toBe('town');
});

test('walk into mart through door', async ({ page }) => {
  test.setTimeout(90_000);
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());
  await page.waitForTimeout(500);

  await page.evaluate(() => window.__cq?.walkToWarp('town', 12, 6));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'mart',
    undefined,
    { timeout: 35_000 },
  );

  const p = await playerState(page);
  expect(p?.mapId).toBe('mart');
});
