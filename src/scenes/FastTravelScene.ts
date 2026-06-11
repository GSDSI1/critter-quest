import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../data/types';
import { GameState } from '../systems/stats';
import { trySave } from '../utils/saveFeedback';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { HEAL_RETURN_SPAWN, listFastTravelDestinations } from '../systems/healTravel';
import { wipeToScene } from '../ui/transitions';
import { TouchMenuNav } from '../ui/touchMenuNav';

export class FastTravelScene extends Phaser.Scene {
  private selected = 0;
  private destinations: { id: string; label: string }[] = [];
  private touchNav?: TouchMenuNav;

  constructor() {
    super('FastTravel');
  }

  create(): void {
    Input.bind(this);
    this.destinations = listFastTravelDestinations();
    buildScreenOverlay(this, 0.7);
    buildMenuPanel(this, 140, 80, 360, 320, 5);

    this.add.text(GAME_WIDTH / 2, 110, 'FAST TRAVEL', {
      fontFamily: FONT, fontSize: '22px', color: '#f5c542',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 134, 'Visit a Healing Center', {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.renderList();
    this.touchNav = new TouchMenuNav(this, {
      onUp: () => {
        const max = this.destinations.length;
        if (max) { this.selected = (this.selected - 1 + max) % max; this.renderList(); }
      },
      onDown: () => {
        const max = this.destinations.length;
        if (max) { this.selected = (this.selected + 1) % max; this.renderList(); }
      },
      onConfirm: () => this.travel(),
      onCancel: () => this.close(),
    });
  }

  update(): void {
    Input.update();
    const max = this.destinations.length;
    if (max === 0) {
      if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.close();
      return;
    }
    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + max) % max;
      this.renderList();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % max;
      this.renderList();
    }
    if (Input.justPressed('confirm')) this.travel();
    if (Input.justPressed('cancel')) this.close();
  }

  private listTexts: Phaser.GameObjects.Text[] = [];

  private renderList(): void {
    this.listTexts.forEach(t => t.destroy());
    this.listTexts = [];
    if (this.destinations.length === 0) {
      const t = this.add.text(GAME_WIDTH / 2, 220, 'No heal centers visited yet.', {
        fontFamily: FONT, fontSize: '12px', color: '#8899aa',
      }).setOrigin(0.5);
      this.listTexts.push(t);
      return;
    }
    this.destinations.forEach((d, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 170 + i * 32, (i === this.selected ? '▶ ' : '  ') + d.label, {
        fontFamily: FONT, fontSize: '14px',
        color: i === this.selected ? '#f5c542' : '#c0c0c0',
      }).setOrigin(0.5);
      this.listTexts.push(t);
    });
  }

  private travel(): void {
    const dest = this.destinations[this.selected];
    if (!dest) return;
    const spawn = HEAL_RETURN_SPAWN[dest.id] ?? { x: 10, y: 10 };
    Sfx.menuConfirm();
    GameState.player.mapId = dest.id;
    GameState.player.x = spawn.x;
    GameState.player.y = spawn.y;
    trySave(this);
    this.scene.stop('PauseMenu');
    this.scene.stop();
    wipeToScene(this, 'Overworld', { _wipeIn: true }, 'left', 320);
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
