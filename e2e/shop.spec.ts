import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, playerState } from './helpers';

test('shop buy deducts money and adds item', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  const before = await playerState(page);
  const moneyBefore = before?.money ?? 0;
  await page.evaluate(() => window.__cq?.openShop());
  await waitForScene(page, 'Shop', 10_000);
  const bought = await page.evaluate(() => window.__cq?.buyShopItem('potion'));
  expect(bought).toBe(true);
  const after = await playerState(page);
  expect(after?.money).toBe(moneyBefore - 300);
  expect(after?.items.potion).toBeGreaterThanOrEqual(1);
});

test('shop sell adds money and removes item', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.buyShopItem('potion'));
  const before = await playerState(page);
  const moneyBefore = before?.money ?? 0;
  const potionsBefore = before?.items.potion ?? 0;
  await page.evaluate(() => window.__cq?.openShop());
  await waitForScene(page, 'Shop', 10_000);
  const sold = await page.evaluate(() => window.__cq?.sellShopItem('potion'));
  expect(sold).toBe(true);
  const after = await playerState(page);
  expect(after?.money).toBe(moneyBefore + 150);
  expect(after?.items.potion ?? 0).toBe(potionsBefore - 1);
});
