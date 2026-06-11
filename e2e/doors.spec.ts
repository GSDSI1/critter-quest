import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, waitForScene } from './helpers';

test('walk into heal center and back out through door', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());

  await page.evaluate(() => window.__cq?.teleportAndWalk('town', 8, 8, 8, 6));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'heal_center',
    { timeout: 25_000 },
  );

  await page.evaluate(() => window.__cq?.teleportAndWalk('heal_center', 4, 6, 4, 8));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'town',
    { timeout: 25_000 },
  );

  const p = await playerState(page);
  expect(p?.mapId).toBe('town');
});

test('walk into mart through door', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());

  await page.evaluate(() => window.__cq?.teleportAndWalk('town', 12, 8, 12, 6));
  await page.waitForFunction(
    () => window.__cq?.player()?.mapId === 'mart',
    { timeout: 25_000 },
  );

  const p = await playerState(page);
  expect(p?.mapId).toBe('mart');
});
