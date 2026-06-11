import { expect, test } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, playerState } from './helpers';

test('chest claim grants loot and sets flag', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  const before = await playerState(page);
  const moneyBefore = before?.money ?? 0;
  const claimed = await page.evaluate(() => window.__cq?.claimChest('chest_town'));
  expect(claimed).toBe(true);
  const after = await playerState(page);
  expect(after?.storyFlags.chest_town).toBe(true);
  expect(after?.money).toBe(moneyBefore + 100);
  expect(after?.items.potion ?? 0).toBeGreaterThanOrEqual(1);
  const again = await page.evaluate(() => window.__cq?.claimChest('chest_town'));
  expect(again).toBe(false);
});
