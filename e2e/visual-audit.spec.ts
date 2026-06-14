import { test, expect } from '@playwright/test';
import { mkdirSync } from 'fs';
import { join } from 'path';
import {
  gotoFresh,
  startNewGameToOverworld,
  waitForScene,
  waitForBattleReady,
  waitForAnyScene,
  pressConfirm,
} from './helpers';
import { AUDIT_MAPS } from './audit-maps';

const SHOT_DIR = join(process.cwd(), 'test-results', 'visual-audit');

test.describe('Visual audit', () => {
  test.beforeAll(() => {
    mkdirSync(SHOT_DIR, { recursive: true });
  });

  test('all 25 maps render with clamped camera', async ({ page }) => {
    test.setTimeout(180_000);
    await gotoFresh(page);
    await startNewGameToOverworld(page);
    await page.evaluate(() => window.__cq?.completeTutorial());

    const ids = await page.evaluate(() => window.__cq?.mapIds() ?? []);
    expect(ids.length).toBe(25);

    const failures: string[] = [];
    for (const m of AUDIT_MAPS) {
      await page.evaluate(({ id, x, y }) => window.__cq?.teleport(id, x, y), m);
      await waitForScene(page, 'Overworld', 15_000);
      await page.waitForTimeout(800);

      const p = await page.evaluate(() => window.__cq?.player());
      if (p?.mapId !== m.id) {
        failures.push(`${m.id}: teleport failed (got ${p?.mapId})`);
        continue;
      }

      const metrics = await page.evaluate(() => window.__cq?.overworldMetrics());
      if (!metrics?.cameraClamped) {
        failures.push(`${m.id}: camera not clamped (scroll ${metrics?.scrollX},${metrics?.scrollY} zoom ${metrics?.zoom})`);
      }

      await page.locator('#game-container canvas').screenshot({
        path: join(SHOT_DIR, `${m.id}.png`),
      });
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });

  test('key species graphics load from atlas', async ({ page }) => {
    await gotoFresh(page);
    await startNewGameToOverworld(page);
    await page.waitForFunction(() => window.__cq?.hasCreatureGraphic('emberpup') === true, undefined, { timeout: 15_000 });
    const spot = ['emberpup', 'mossling', 'leafkit', 'cinderkit', 'sparkbit'];
    for (const id of spot) {
      const ok = await page.evaluate((sid) => window.__cq?.hasCreatureGraphic(sid) ?? false, id);
      expect(ok, `${id} graphic`).toBe(true);
    }
  });

  test('core UI scenes load without error', async ({ page }) => {
    test.setTimeout(120_000);
    await gotoFresh(page);
    await startNewGameToOverworld(page);
    await page.evaluate(() => {
      window.__cq?.completeTutorial();
      window.__cq?.addPartyMember('infernox', 40);
      window.__cq?.fillDex(10);
    });

    const scenes: { label: string; fn: () => Promise<void> }[] = [
      {
        label: 'Battle',
        fn: async () => {
          await page.evaluate(() => window.__cq?.startWildBattle('mossling', 'route1'));
          await waitForScene(page, 'Battle');
          await waitForBattleReady(page);
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'battle-wild.png') });
          await page.evaluate(() => window.__cq?.resolveBattle('win'));
          await waitForScene(page, 'Overworld');
        },
      },
      {
        label: 'Shop',
        fn: async () => {
          await page.evaluate(() => window.__cq?.openShop());
          await waitForScene(page, 'Shop');
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'shop.png') });
          await page.keyboard.press('Escape');
          await waitForScene(page, 'Overworld');
        },
      },
      {
        label: 'PC',
        fn: async () => {
          await page.evaluate(() => window.__cq?.openPc());
          await waitForScene(page, 'PC');
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'pc.png') });
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
          await page.evaluate(() => window.__cq?.teleport('town', 12, 15));
          await waitForScene(page, 'Overworld');
        },
      },
      {
        label: 'QuestLog',
        fn: async () => {
          await page.evaluate(() => window.__cq?.openQuestLog());
          await waitForScene(page, 'QuestLog');
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'quest-log.png') });
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
          await page.evaluate(() => window.__cq?.teleport('town', 12, 15));
          await waitForScene(page, 'Overworld');
        },
      },
      {
        label: 'Fishing',
        fn: async () => {
          await page.evaluate(() => window.__cq?.teleport('fishing_pier', 6, 8));
          await waitForScene(page, 'Overworld');
          await page.evaluate(() => window.__cq?.openFishing());
          await waitForScene(page, 'Fishing');
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'fishing.png') });
          await page.evaluate(() => window.__cq?.resolveFishing(3));
          await page.waitForTimeout(400);
          await pressConfirm(page);
          await waitForScene(page, 'Overworld', 12_000);
        },
      },
      {
        label: 'HallOfFame',
        fn: async () => {
          await page.evaluate(() => {
            for (const b of ['verdant', 'ember', 'frost', 'psyche']) window.__cq?.giveBadge(b);
            window.__cq?.startTrainerBattle('champion', 'victory_road');
          });
          await waitForScene(page, 'Battle');
          await waitForBattleReady(page);
          await page.evaluate(() => window.__cq?.resolveBattle('win'));
          await waitForScene(page, 'HallOfFame', 25_000);
          await page.locator('#game-container canvas').screenshot({ path: join(SHOT_DIR, 'hall-of-fame.png') });
          await page.keyboard.press('z');
          await waitForAnyScene(page, ['Menu', 'Overworld'], 15_000);
        },
      },
    ];

    for (const s of scenes) {
      await s.fn();
      if (!(await page.evaluate(() => window.__cq?.sceneKeys() ?? [])).includes('Overworld')) {
        await page.evaluate(() => window.__cq?.teleport('town', 12, 15));
        await waitForScene(page, 'Overworld', 15_000);
      }
    }
  });
});
