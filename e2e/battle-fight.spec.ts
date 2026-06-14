import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, waitForBattleReady } from './helpers';

async function advanceBattleToMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(
    () => window.__cq?.battleState()?.phase === 'menu',
    undefined,
    { timeout: 20_000 },
  ).catch(async () => {
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => window.__cq?.battleTapContinue());
      await page.waitForTimeout(250);
      const phase = await page.evaluate(() => window.__cq?.battleState()?.phase);
      if (phase === 'menu') return;
    }
  });
  await page.waitForFunction(
    () => window.__cq?.battleState()?.phase === 'menu',
    undefined,
    { timeout: 5000 },
  );
}

test('wild battle fight reduces enemy HP', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('mossling'));
  await waitForScene(page, 'Battle', 15_000);
  await waitForBattleReady(page);

  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.__cq?.battleTapContinue());
    await page.waitForTimeout(200);
  }
  await advanceBattleToMenu(page);

  const hpBefore = await page.evaluate(() => window.__cq?.battleState()?.enemyHp ?? 0);
  expect(hpBefore).toBeGreaterThan(0);

  await page.evaluate(() => window.__cq?.battlePickMove(0));

  await page.waitForFunction(
    before => {
      const hp = window.__cq?.battleState()?.enemyHp ?? before;
      return hp < before;
    },
    hpBefore,
    { timeout: 25_000 },
  );

  const hpAfter = await page.evaluate(() => window.__cq?.battleState()?.enemyHp ?? hpBefore);
  expect(hpAfter).toBeLessThan(hpBefore);
});

test('trainer battle menu omits Run', async ({ page }) => {
  await gotoFresh(page);
  const items = await page.evaluate(() => window.__cq?.battleMenuForTrainer() ?? []);
  expect(items).toEqual(['Fight', 'Bag', 'Switch']);
  expect(items).not.toContain('Run');
});
