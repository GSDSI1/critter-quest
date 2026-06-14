import { expect, test } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, teleport, waitForScene, playerState, walkThroughWarp, waitForMap } from './helpers';

test('secret grove accessible with verdant and ember badges', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => {
    window.__cq?.giveBadge('verdant');
    window.__cq?.giveBadge('ember');
  });
  await teleport(page, 'secret_grove', 10, 14);
  await waitForScene(page, 'Overworld', 15_000);
  const p = await playerState(page);
  expect(p?.mapId).toBe('secret_grove');
});

test('forest walk reaches secret grove warp', async ({ page }) => {
  test.setTimeout(120_000);
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => {
    window.__cq?.giveBadge('verdant');
    window.__cq?.giveBadge('ember');
    window.__cq?.completeTutorial();
  });
  await teleport(page, 'forest', 20, 9);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.stepPlayer(0, -1));
  await waitForMap(page, 'secret_grove');
  const p = await playerState(page);
  expect(p?.mapId).toBe('secret_grove');
});
