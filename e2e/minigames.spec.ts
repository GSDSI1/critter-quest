import { expect, test } from '@playwright/test';
import { gotoFresh, sceneKeys, startNewGameToOverworld, teleport, waitForScene } from './helpers';

test('fishing minigame opens from pier', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await teleport(page, 'fishing_pier', 6, 8);
  await waitForScene(page, 'Overworld');
  await page.waitForTimeout(500);

  await page.evaluate(() => window.__cq?.openFishing());
  await waitForScene(page, 'Fishing', 12_000);

  const keys = await sceneKeys(page);
  expect(keys).toContain('Fishing');
});
