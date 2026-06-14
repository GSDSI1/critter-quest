import { test, expect } from '@playwright/test';
import { gotoFresh, startNewGameToOverworld, waitForScene, waitForBattleReady, playerState } from './helpers';

const GYMS = [
  { npcId: 'gym_leader', mapId: 'gym1', badge: 'verdant' },
  { npcId: 'gym_leader_cole', mapId: 'gym2', badge: 'ember' },
  { npcId: 'gym_leader_glacier', mapId: 'gym3', badge: 'frost' },
  { npcId: 'gym_leader_sage', mapId: 'gym4', badge: 'psyche' },
] as const;

for (const gym of GYMS) {
  test(`gym ${gym.mapId} leader win awards ${gym.badge} badge`, async ({ page }) => {
    await gotoFresh(page);
    await startNewGameToOverworld(page);
    await page.evaluate(({ npcId, mapId }) => {
      window.__cq?.startTrainerBattle(npcId, mapId);
    }, gym);
    await waitForScene(page, 'Battle', 15_000);
    await waitForBattleReady(page);
    await page.evaluate(() => window.__cq?.resolveBattle('win'));
    await waitForScene(page, 'Overworld', 15_000);
    const p = await playerState(page);
    expect(p?.badges).toContain(gym.badge);
  });
}
