import Phaser from 'phaser';

export type GameAction =
  | 'up' | 'down' | 'left' | 'right'
  | 'confirm' | 'cancel' | 'party' | 'pause' | 'run' | 'tab';

const STICK_DEADZONE = 0.25;

class InputManager {
  private scene: Phaser.Scene | null = null;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private prevHeld = new Set<GameAction>();
  private currHeld = new Set<GameAction>();
  private justPressedSet = new Set<GameAction>();
  private padIndex = 0;
  private padConnected = false;
  private wasPadConnected = false;

  bind(scene: Phaser.Scene): void {
    this.scene = scene;
    if (!scene.input.keyboard) return;

    const kb = scene.input.keyboard;
    this.keys = {
      W: kb.addKey('W'), A: kb.addKey('A'), S: kb.addKey('S'), D: kb.addKey('D'),
      UP: kb.addKey('UP'), DOWN: kb.addKey('DOWN'), LEFT: kb.addKey('LEFT'), RIGHT: kb.addKey('RIGHT'),
      Z: kb.addKey('Z'), ENTER: kb.addKey('ENTER'), SPACE: kb.addKey('SPACE'),
      ESC: kb.addKey('ESC'), X: kb.addKey('X'), P: kb.addKey('P'),
      SHIFT: kb.addKey('SHIFT'), TAB: kb.addKey('TAB'),
    };

    scene.input.gamepad?.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.padIndex = pad.index;
      this.padConnected = true;
    });
    scene.input.gamepad?.on('disconnected', () => {
      this.padConnected = false;
    });
  }

  update(): void {
    this.prevHeld = new Set(this.currHeld);
    this.currHeld.clear();
    this.justPressedSet.clear();

    const add = (a: GameAction) => {
      this.currHeld.add(a);
      if (!this.prevHeld.has(a)) this.justPressedSet.add(a);
    };

    if (this.keys.UP?.isDown || this.keys.W?.isDown) add('up');
    if (this.keys.DOWN?.isDown || this.keys.S?.isDown) add('down');
    if (this.keys.LEFT?.isDown || this.keys.A?.isDown) add('left');
    if (this.keys.RIGHT?.isDown || this.keys.D?.isDown) add('right');
    if (this.keys.Z?.isDown || this.keys.ENTER?.isDown || this.keys.SPACE?.isDown) add('confirm');
    if (this.keys.ESC?.isDown) add('cancel');
    if (this.keys.X?.isDown) add('party');
    if (this.keys.P?.isDown) add('pause');
    if (this.keys.SHIFT?.isDown) add('run');
    if (this.keys.TAB?.isDown) add('tab');

    const pad = this.getPad();
    if (pad) {
      this.padConnected = true;
      const lx = pad.leftStick?.x ?? 0;
      const ly = pad.leftStick?.y ?? 0;
      if (pad.left || lx < -STICK_DEADZONE) add('left');
      if (pad.right || lx > STICK_DEADZONE) add('right');
      if (pad.up || ly < -STICK_DEADZONE) add('up');
      if (pad.down || ly > STICK_DEADZONE) add('down');
      if (pad.A) add('confirm');
      if (pad.B) add('cancel');
      if (pad.Y) add('party');
      if (pad.buttons[9]?.pressed) add('pause');
      if (pad.L1 > 0.5) add('run');
    } else {
      this.padConnected = false;
    }
  }

  private getPad(): Phaser.Input.Gamepad.Gamepad | null {
    if (!this.scene?.input.gamepad) return null;
    const gp = this.scene.input.gamepad;
    return gp.getPad(this.padIndex) ?? gp.getAll()[0] ?? null;
  }

  getMovement(): { dx: number; dy: number } {
    let dx = 0, dy = 0;
    if (this.isHeld('left')) dx = -1;
    else if (this.isHeld('right')) dx = 1;
    if (this.isHeld('up')) dy = -1;
    else if (this.isHeld('down')) dy = 1;
    return { dx, dy };
  }

  justPressed(action: GameAction): boolean {
    return this.justPressedSet.has(action);
  }

  isHeld(action: GameAction): boolean {
    return this.currHeld.has(action);
  }

  isGamepadConnected(): boolean {
    return this.padConnected;
  }

  /** True once when a gamepad connects this frame */
  gamepadJustConnected(): boolean {
    const now = this.padConnected;
    const fresh = now && !this.wasPadConnected;
    this.wasPadConnected = now;
    return fresh;
  }
}

export const Input = new InputManager();
