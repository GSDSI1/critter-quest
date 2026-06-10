import { test, expect } from '@playwright/test';
import {
  gotoFresh, skipIntroToMenu, chooseNewGame, confirmCharacterSelect,
  advanceDialogs, waitForScene, sceneKeys,
} from './helpers';

test('lab intro dialog advances to starter select without test bridge', async ({ page }) => {
  await gotoFresh(page);
  await skipIntroToMenu(page);
  await chooseNewGame(page);
  await confirmCharacterSelect(page);

  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toBeVisible();

  // Advance professor dialog via click + keyboard (no __cq.startStarterSelect)
  await advanceDialogs(page, 4);
  await page.waitForTimeout(800);

  const keys = await sceneKeys(page);
  expect(keys).toContain('StarterSelect');
});
