import { expect, test } from '@playwright/test';
import { gotoFresh, playerState, startNewGameToOverworld, waitForScene } from './helpers';

test('auto-walk pathfinding moves the player', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');
  await page.evaluate(() => window.__cq?.completeTutorial());
  await page.waitForTimeout(500);

  // Spawn tile (12,15) → one step left on open path row (deterministic, no blocked tiles).
  const destX = 11;
  const destY = 15;
  await page.evaluate(({ dx, dy }) => {
    window.__cq?.teleportAndWalk('town', 12, 15, dx, dy);
  }, { dx: destX, dy: destY });

  await page.waitForFunction(
    ({ x, y }) => window.__cq?.player()?.x === x && window.__cq?.player()?.y === y,
    { x: destX, y: destY },
    { timeout: 35_000 },
  );

  const after = await playerState(page);
  expect(after?.x).toBe(destX);
  expect(after?.y).toBe(destY);
  expect(after?.mapId).toBe('town');
});
