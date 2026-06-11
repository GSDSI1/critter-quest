import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, teleport, waitForScene } from './helpers';

test('auto-walk pathfinding moves the player', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await teleport(page, 'town', 12, 14, 'up');
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__cq?.completeTutorial());

  const before = await playerState(page);
  expect(before?.mapId).toBe('town');

  const destX = (before?.x ?? 12) + 3;
  const destY = before?.y ?? 14;
  await page.evaluate(({ tx, ty }) => window.__cq?.requestWalk(tx, ty), { tx: destX, ty: destY });

  await page.waitForFunction(
    ({ x, y }) => {
      const p = window.__cq?.player();
      return !!p && (p.x !== x || p.y !== y);
    },
    { x: before?.x, y: before?.y },
    { timeout: 12_000 },
  );

  const after = await playerState(page);
  expect(after?.x !== before?.x || after?.y !== before?.y).toBe(true);
});
