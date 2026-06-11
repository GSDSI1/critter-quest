import { expect, test } from '@playwright/test';
import { gotoFresh, pressConfirm, sceneKeys, startNewGameToOverworld, teleport, waitForScene } from './helpers';

test('fishing minigame completes a catch', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  const beforeDex = (await page.evaluate(() => window.__cq?.player()?.dexCaught.length)) ?? 0;
  await teleport(page, 'fishing_pier', 6, 8);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.openFishing());
  await waitForScene(page, 'Fishing', 12_000);
  await page.evaluate(() => window.__cq?.resolveFishing(2));
  await page.waitForTimeout(400);
  await pressConfirm(page);
  await waitForScene(page, 'Overworld', 12_000);
  const afterDex = await page.evaluate(() => window.__cq?.player()?.dexCaught.length);
  expect(afterDex).toBeGreaterThan(beforeDex);
});

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

test('bug catch minigame opens at night', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => {
    window.__cq?.setNight();
    for (let i = 0; i < 6; i++) {
      window.__cq?.addPartyMember('mossling', 5);
    }
  });
  await teleport(page, 'forest', 6, 10);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.openBugCatch());
  await waitForScene(page, 'BugCatch', 12_000);
  expect(await sceneKeys(page)).toContain('BugCatch');
});

test('critter contest opens from hall', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await teleport(page, 'contest_hall', 7, 10);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.openContest());
  await waitForScene(page, 'CritterContest', 12_000);
  expect(await sceneKeys(page)).toContain('CritterContest');
});
