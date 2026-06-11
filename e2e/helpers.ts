import type { Page } from '@playwright/test';

export async function focusCanvas(page: Page): Promise<void> {
  const canvas = page.locator('#game-container canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15_000 });
  await canvas.click({ position: { x: 320, y: 240 } });
}

export async function pressConfirm(page: Page): Promise<void> {
  await focusCanvas(page);
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('z');
    await page.waitForTimeout(80);
  }
}

export async function pressCancel(page: Page): Promise<void> {
  await focusCanvas(page);
  await page.keyboard.press('Escape');
}

export async function sceneKeys(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__cq?.sceneKeys() ?? []);
}

export async function waitForScene(page: Page, key: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const keys = await sceneKeys(page);
    if (keys.includes(key)) return;
    await page.waitForTimeout(200);
  }
  const keys = await sceneKeys(page);
  throw new Error(`Timed out waiting for scene "${key}". Active: ${keys.join(', ') || 'none'}`);
}

export async function waitForAnyScene(page: Page, targets: string[], timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const keys = await sceneKeys(page);
    if (targets.some(t => keys.includes(t))) return;
    await page.waitForTimeout(200);
  }
  const keys = await sceneKeys(page);
  throw new Error(`Timed out waiting for scenes [${targets.join(', ')}]. Active: ${keys.join(', ') || 'none'}`);
}

export async function clearSave(page: Page): Promise<void> {
  await page.evaluate(() => {
    ['critter-quest-save-v3', 'critter-quest-save-v2', 'critter-quest-save'].forEach(k => localStorage.removeItem(k));
  });
}

export async function gotoFresh(page: Page): Promise<void> {
  await page.goto('/');
  await clearSave(page);
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await waitForScene(page, 'Boot', 15_000);
}

export async function advanceDialogs(page: Page, count: number): Promise<void> {
  const canvas = page.locator('#game-container canvas');
  for (let i = 0; i < count; i++) {
    await page.waitForTimeout(350);
    await focusCanvas(page);
    // Dialog box sits at bottom of 640×480 game canvas
    await canvas.click({ position: { x: 320, y: 430 } });
    await page.waitForTimeout(100);
    await page.keyboard.press('z');
    await page.waitForTimeout(100);
  }
}

export async function confirmCharacterSelect(page: Page): Promise<void> {
  await page.waitForTimeout(300);
  await pressConfirm(page);
  await page.waitForTimeout(700);
  if ((await sceneKeys(page)).includes('CharacterSelect')) {
    await page.evaluate(() => window.__cq?.confirmCharacter());
  }
  await waitForAnyScene(page, ['LabIntro', 'StarterSelect'], 12_000);
}

export async function skipIntroToMenu(page: Page): Promise<void> {
  await waitForAnyScene(page, ['Intro', 'Menu'], 15_000);
  if ((await sceneKeys(page)).includes('Menu')) return;
  await page.waitForTimeout(900);
  await pressConfirm(page);
  try {
    await waitForScene(page, 'Menu', 12_000);
  } catch {
    await page.evaluate(() => window.__cq?.skipToMenu());
    await waitForScene(page, 'Menu', 8_000);
  }
}

export async function chooseNewGame(page: Page): Promise<void> {
  await waitForScene(page, 'Menu');
  await page.waitForTimeout(400);
  const hasSave = await page.evaluate(() => !!localStorage.getItem('critter-quest-save-v3'));
  if (hasSave) {
    await focusCanvas(page);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
  }
  await pressConfirm(page);
  await page.waitForTimeout(700);
  if ((await sceneKeys(page)).includes('Menu')) {
    await page.evaluate(() => window.__cq?.startNewGame());
  }
  await waitForAnyScene(page, ['CharacterSelect', 'LabIntro'], 15_000);
}

export async function startNewGameToOverworld(page: Page): Promise<void> {
  await skipIntroToMenu(page);
  await chooseNewGame(page);
  await confirmCharacterSelect(page);
  if ((await sceneKeys(page)).includes('LabIntro')) {
    await advanceDialogs(page, 4);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__cq?.startStarterSelect());
    await waitForScene(page, 'StarterSelect', 15_000);
  }
  await advanceDialogs(page, 3);
  await page.waitForTimeout(400);
  await pressConfirm(page);
  await page.waitForTimeout(800);
  await advanceDialogs(page, 3);
  if (!(await sceneKeys(page)).includes('Overworld')) {
    await page.evaluate(() => window.__cq?.pickStarter());
  }
  await waitForScene(page, 'Overworld', 25_000);
  await advanceDialogs(page, 4);
  await page.waitForTimeout(300);
  await pressCancel(page);
}

export async function playerState(page: Page) {
  return page.evaluate(() => window.__cq?.player());
}

export async function teleport(page: Page, mapId: string, x: number, y: number, facing: 'up' | 'down' | 'left' | 'right' = 'up') {
  await page.evaluate(({ mapId, x, y, facing }) => {
    window.__cq?.teleport(mapId, x, y, facing);
  }, { mapId, x, y, facing });
  await page.waitForTimeout(600);
}
