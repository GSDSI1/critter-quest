import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, waitForBattleReady, playerState } from './helpers';

test('champion victory sets champion flag and reaches Hall of Fame', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => {
    for (const b of ['verdant', 'ember', 'frost', 'psyche']) window.__cq?.giveBadge(b);
    window.__cq?.addPartyMember('infernox', 60);
    window.__cq?.startTrainerBattle('champion', 'victory_road');
  });
  await waitForScene(page, 'Battle', 15_000);
  await waitForBattleReady(page);
  await page.evaluate(() => window.__cq?.resolveBattle('win'));
  await waitForScene(page, 'HallOfFame', 25_000);
  const p = await playerState(page);
  expect(p?.storyFlags.champion).toBe(true);
});

test('quest log claims a completed quest reward', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.fillDex(5));
  const moneyBefore = (await playerState(page))?.money ?? 0;
  await page.evaluate(() => window.__cq?.openQuestLog());
  await waitForScene(page, 'QuestLog', 15_000);
  // First quest (first_catch: catch 5) is selected by default — claim it.
  await page.keyboard.press('z');
  await page.waitForTimeout(400);
  const p = await playerState(page);
  const orbs = p?.items.capture_orb ?? 0;
  const money = p?.money ?? 0;
  expect(orbs >= 5 || money > moneyBefore).toBe(true);
  expect(Object.keys(p?.storyFlags ?? {})).toContain('quest_first_catch_claimed');
});

test('battle on a rainy map activates rain weather', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await page.evaluate(() => window.__cq?.startWildBattle('kelpling', 'route3'));
  await waitForScene(page, 'Battle', 15_000);
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => window.__cq?.battleState());
  expect(state?.weather).toBe('rain');
});
