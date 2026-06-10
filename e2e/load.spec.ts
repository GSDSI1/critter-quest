import { expect, test } from '@playwright/test';
import { focusCanvas, gotoFresh } from './helpers';

test('page loads and Phaser canvas appears', async ({ page }) => {
  await gotoFresh(page);
  await expect(page.locator('#load-error.visible')).toHaveCount(0);
  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  await focusCanvas(page);
  const keys = await page.evaluate(() => window.__cq?.sceneKeys() ?? []);
  expect(keys.length).toBeGreaterThan(0);
});
