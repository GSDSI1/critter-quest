import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, waitForScene } from './helpers';

test('auto-walk pathfinding moves the player', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());

  const before = await playerState(page);
  const destY = (before?.y ?? 15) - 1;
  await page.evaluate(({ ty }) => {
    window.__cq?.teleportAndWalk('town', 12, 15, 12, ty);
  }, { ty: destY });

  await page.waitForFunction(
    ({ y }) => window.__cq?.player()?.y === y,
    { y: destY },
    { timeout: 25_000 },
  );

  const after = await playerState(page);
  expect(after?.y).toBe(destY);
  expect(after?.mapId).toBe('town');
});
