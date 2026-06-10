import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, sceneKeys, playerState } from './helpers';

test('wild battle starts via test bridge', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('mossling'));
  await waitForScene(page, 'Battle', 15_000);
  const keys = await sceneKeys(page);
  expect(keys).toContain('Battle');
});

test('wild battle win returns to overworld', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('mossling'));
  await waitForScene(page, 'Battle', 15_000);
  await page.evaluate(() => window.__cq?.resolveBattle('win'));
  await waitForScene(page, 'Overworld', 15_000);
});

test('wild battle lose blacks out to heal center', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('thornbeast'));
  await waitForScene(page, 'Battle', 15_000);
  await page.evaluate(() => window.__cq?.resolveBattle('lose'));
  await waitForScene(page, 'Overworld', 20_000);
  const p = await playerState(page);
  expect(p?.mapId).toBe('heal_center');
});

test('wild battle catch adds species to dex', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('mossling'));
  await waitForScene(page, 'Battle', 15_000);
  await page.evaluate(() => window.__cq?.resolveBattle('catch'));
  await waitForScene(page, 'Overworld', 15_000);
  const p = await playerState(page);
  expect(p?.dexCaught).toContain('mossling');
});

test('save roundtrip preserves player name', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  const before = await page.evaluate(() => window.__cq?.player());
  expect(before?.started).toBe(true);
  await page.reload();
  await waitForScene(page, 'Intro', 15_000);
  await page.waitForTimeout(500);
  await page.keyboard.press('z');
  await waitForScene(page, 'Menu', 10_000);
  await page.keyboard.press('z');
  await page.waitForTimeout(500);
  if ((await sceneKeys(page)).includes('Menu')) {
    await page.evaluate(() => window.__cq?.menuContinue());
  }
  await waitForScene(page, 'Overworld', 20_000);
  const after = await page.evaluate(() => window.__cq?.player());
  expect(after?.name).toBe(before?.name);
  expect(after?.started).toBe(true);
});
