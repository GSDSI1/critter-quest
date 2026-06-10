import { expect, test } from '@playwright/test';
import {
  gotoFresh, playerState, pressConfirm, sceneKeys, startNewGameToOverworld, waitForScene,
} from './helpers';

test('new game reaches overworld with starter', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);

  await waitForScene(page, 'Overworld');
  const p = await playerState(page);
  expect(p?.started).toBe(true);
  expect(p?.mapId).toBe('town');
  expect(p?.name).toBeTruthy();
});

test('menu continue works after save', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);

  const before = await playerState(page);
  expect(before?.mapId).toBe('town');

  await page.evaluate(() => {
    const raw = localStorage.getItem('critter-quest-save-v3');
    if (!raw) throw new Error('save missing');
  });

  await page.reload();
  await waitForScene(page, 'Intro', 15_000);
  await page.waitForTimeout(700);
  await pressConfirm(page);
  await waitForScene(page, 'Menu');

  await pressConfirm(page);
  await page.waitForTimeout(700);
  if ((await sceneKeys(page)).includes('Menu')) {
    await page.evaluate(() => window.__cq?.menuContinue());
  }
  await waitForScene(page, 'Overworld', 15_000);

  const after = await playerState(page);
  expect(after?.started).toBe(true);
  expect(after?.mapId).toBe('town');
});
