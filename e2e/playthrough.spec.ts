import { test, expect } from '@playwright/test';
import {
  gotoFresh,
  startNewGameToOverworld,
  waitForScene,
  waitForBattleReady,
  playerState,
} from './helpers';
import { AUDIT_MAPS } from './audit-maps';

async function prepStory(page: import('@playwright/test').Page): Promise<void> {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => {
    window.__cq?.completeTutorial();
    window.__cq?.addPartyMember('bloomoss', 18);
    window.__cq?.addPartyMember('voltwing', 18);
  });
}

/** Validates full story map sequence loads (teleport smoke — door walks covered in doors.spec). */
test('main story map sequence loads through victory_road', async ({ page }) => {
  test.setTimeout(180_000);
  await prepStory(page);
  await page.evaluate(() => {
    window.__cq?.giveBadge('verdant');
    window.__cq?.giveBadge('ember');
    window.__cq?.giveBadge('frost');
    window.__cq?.giveBadge('psyche');
    window.__cq?.player();
    window.__cq?.startTrainerBattle('ranger', 'forest');
  });
  await waitForScene(page, 'Battle', 15_000);
  await waitForBattleReady(page);
  await page.evaluate(() => window.__cq?.resolveBattle('win'));
  await waitForScene(page, 'Overworld', 15_000);

  const storyMaps = [
    'town', 'route1', 'forest', 'route2', 'mossgrove', 'route3', 'ember_city',
    'route4', 'glacier_pass', 'frostvale', 'route5', 'mindspire', 'victory_road',
  ];
  for (const id of storyMaps) {
    await page.evaluate((mapId) => window.__cq?.teleport(mapId, 12, 10), id);
    await waitForScene(page, 'Overworld', 15_000);
    await page.waitForTimeout(300);
    expect((await playerState(page))?.mapId).toBe(id);
    const metrics = await page.evaluate(() => window.__cq?.overworldMetrics());
    expect(metrics?.cameraClamped, `${id} camera`).toBe(true);
  }
});

test('all story and side maps load via teleport', async ({ page }) => {
  test.setTimeout(120_000);
  await prepStory(page);
  await page.evaluate(() => {
    for (const b of ['verdant', 'ember', 'frost', 'psyche']) window.__cq?.giveBadge(b);
  });

  for (const m of AUDIT_MAPS) {
    await page.evaluate(({ id, x, y }) => window.__cq?.teleport(id, x, y), m);
    await waitForScene(page, 'Overworld', 15_000);
    await page.waitForTimeout(400);
    const p = await playerState(page);
    expect(p?.mapId).toBe(m.id);
    const metrics = await page.evaluate(() => window.__cq?.overworldMetrics());
    expect(metrics?.cameraClamped, `${m.id} camera`).toBe(true);
  }
});

test('four gym leaders award badges in order', async ({ page }) => {
  test.setTimeout(120_000);
  await prepStory(page);

  const gyms = [
    { npcId: 'gym_leader', mapId: 'gym1', badge: 'verdant' },
    { npcId: 'gym_leader_cole', mapId: 'gym2', badge: 'ember' },
    { npcId: 'gym_leader_glacier', mapId: 'gym3', badge: 'frost' },
    { npcId: 'gym_leader_sage', mapId: 'gym4', badge: 'psyche' },
  ] as const;

  for (const gym of gyms) {
    await page.evaluate(({ mapId }) => window.__cq?.teleport(mapId, 6, 11), gym);
    await waitForScene(page, 'Overworld');
    await page.evaluate(({ npcId, mapId }) => window.__cq?.startTrainerBattle(npcId, mapId), gym);
    await waitForScene(page, 'Battle', 15_000);
    await waitForBattleReady(page);
    await page.evaluate(() => window.__cq?.resolveBattle('win'));
    await waitForScene(page, 'Overworld', 15_000);
    expect((await playerState(page))?.badges).toContain(gym.badge);
  }
});
