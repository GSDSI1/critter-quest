/** Focus the Phaser canvas so keyboard input works without an extra click. */
export function focusGameCanvas(): void {
  if (typeof document === 'undefined') return;
  const canvas = document.querySelector('#game-container canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  if (!canvas.hasAttribute('tabindex')) canvas.setAttribute('tabindex', '0');
  try {
    canvas.focus({ preventScroll: true });
  } catch {
    canvas.focus();
  }
}
