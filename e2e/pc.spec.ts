import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, playerState } from './helpers';

test('PC deposit and withdraw roundtrip', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.addPartyMember('mossling', 5));
  const withTwo = await playerState(page);
  expect(withTwo?.partyCount).toBe(2);

  await page.evaluate(() => window.__cq?.openPc());
  await waitForScene(page, 'PC', 10_000);
  const deposited = await page.evaluate(() => window.__cq?.depositPartySlot(1));
  expect(deposited).toBe(true);

  const afterDeposit = await playerState(page);
  expect(afterDeposit?.partyCount).toBe(1);
  expect(afterDeposit?.storageCount).toBe(1);

  const withdrawn = await page.evaluate(() => window.__cq?.withdrawStorageSlot(0));
  expect(withdrawn).toBe(true);

  const afterWithdraw = await playerState(page);
  expect(afterWithdraw?.partyCount).toBe(2);
  expect(afterWithdraw?.storageCount).toBe(0);
});
