import { expect, test } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene } from './helpers';

test('dex milestone at 20 grants great orb', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.fillDex(20));
  const milestone = await page.evaluate(() => window.__cq?.claimPendingDexMilestone());
  expect(milestone).toBe(20);
  const items = await page.evaluate(() => window.__cq?.player()?.items);
  expect((items?.great_orb ?? 0)).toBeGreaterThan(0);
});

test('dex milestone at 100 grants ultra orbs', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.fillDex(100));
  const milestone = await page.evaluate(() => window.__cq?.claimPendingDexMilestone());
  expect(milestone).toBe(100);
  const items = await page.evaluate(() => window.__cq?.player()?.items);
  expect((items?.ultra_orb ?? 0)).toBeGreaterThanOrEqual(5);
});
