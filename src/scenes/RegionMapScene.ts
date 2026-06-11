import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../data/types';
import { getBadge } from '../data/badges';
import { GameState } from '../systems/stats';
import { HEAL_HUBS } from '../systems/healTravel';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { REGION_NODES, REGION_LINKS } from '../data/regionMap';
import { TouchMenuNav } from '../ui/touchMenuNav';

export class RegionMapScene extends Phaser.Scene {
  private touchNav?: TouchMenuNav;

  constructor() {
    super('RegionMap');
  }

  create(): void {
    Input.bind(this);
    buildScreenOverlay(this, 0.75);
    buildMenuPanel(this, 24, 24, GAME_WIDTH - 48, 432, 5);

    this.add.text(GAME_WIDTH / 2, 44, 'VERDANT REGION', {
      fontFamily: FONT, fontSize: '20px', color: '#f5c542',
    }).setOrigin(0.5);

    const here = GameState.player.mapId;
    const gfx = this.add.graphics().setDepth(1);
    gfx.lineStyle(2, 0x334155, 0.8);
    for (const [a, b] of REGION_LINKS) {
      const na = REGION_NODES.find(n => n.id === a);
      const nb = REGION_NODES.find(n => n.id === b);
      if (na && nb) gfx.lineBetween(na.x, na.y, nb.x, nb.y);
    }

    for (const node of REGION_NODES) {
      const isHere = here === node.id || here.startsWith(node.id);
      const visitedHub = node.hub && GameState.player.visitedHealCenters.includes(node.id);
      const hasBadge = node.badge && GameState.player.badges.includes(node.badge);
      const color = isHere ? COLORS.gold
        : hasBadge ? 0x22c55e
          : visitedHub ? 0x60a5fa
            : node.kind === 'gym' ? 0xf97316
              : 0x64748b;

      this.add.circle(node.x, node.y, isHere ? 10 : 7, color, isHere ? 1 : 0.85).setDepth(2);
      if (hasBadge) {
        const badge = getBadge(node.badge!);
        this.add.circle(node.x + 8, node.y - 8, 4, badge.color).setDepth(3);
      }
      this.add.text(node.x, node.y + 14, node.label, {
        fontFamily: FONT, fontSize: '8px',
        color: isHere ? '#f5c542' : '#8899aa',
      }).setOrigin(0.5).setDepth(2);
    }

    const hubCount = GameState.player.visitedHealCenters.filter(id => HEAL_HUBS[id]).length;
    this.add.text(GAME_WIDTH / 2, 400, `You are here: ${here}  ·  Hubs: ${hubCount}/5  ·  Badges: ${GameState.player.badges.length}/4`, {
      fontFamily: FONT, fontSize: '10px', color: '#667788',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 420, 'Press B / ESC to close', {
      fontFamily: FONT, fontSize: '11px', color: '#8899aa',
    }).setOrigin(0.5);

    this.touchNav = new TouchMenuNav(this, {
      onUp: () => {},
      onDown: () => {},
      onConfirm: () => this.close(),
      onCancel: () => this.close(),
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('confirm') || Input.justPressed('cancel')) this.close();
  }

  private close(): void {
    Sfx.menuConfirm();
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
