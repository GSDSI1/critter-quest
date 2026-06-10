import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, playerState } from './helpers';

test('gym 1 leader win awards verdant badge', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startTrainerBattle('gym_leader', 'gym1'));
  await waitForScene(page, 'Battle', 15_000);
  await page.evaluate(() => window.__cq?.resolveBattle('win'));
  await waitForScene(page, 'Overworld', 15_000);
  const p = await playerState(page);
  expect(p?.badges).toContain('verdant');
});
