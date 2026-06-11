/** Focus the Phaser canvas so keyboard input works without an extra click. */
export function focusGameCanvas(): void {
  if (typeof document === 'undefined') return;
  const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
  canvas.style.outline = 'none';
  try {
    canvas.focus({ preventScroll: true });
  } catch {
    canvas.focus();
  }
}

/** Call once at boot so the first keypress reaches the game. */
export function installCanvasFocusOnBoot(): void {
  if (typeof document === 'undefined') return;
  const focus = () => focusGameCanvas();
  document.addEventListener('pointerdown', focus, { capture: true, passive: true });
  document.addEventListener('keydown', focus, { capture: true, passive: true });
  window.addEventListener('focus', focus);
}
