import { expect, test } from '@playwright/test';
import {
  advanceDialogs, gotoFresh, playerState, pressConfirm, startNewGameToOverworld,
  teleport, waitForScene,
} from './helpers';

test('healing center nurse heals and player can move after', async ({ page }) => {
  await gotoFresh(page);
  await startNewGameToOverworld(page);
  await waitForScene(page, 'Overworld');

  await teleport(page, 'heal_center', 4, 4, 'up');
  const atCenter = await playerState(page);
  expect(atCenter?.mapId).toBe('heal_center');

  await pressConfirm(page);
  await advanceDialogs(page, 3);

  await teleport(page, 'heal_center', 4, 6, 'down');
  const after = await playerState(page);
  expect(after?.mapId).toBe('heal_center');
  expect(after?.y).toBe(6);
});
