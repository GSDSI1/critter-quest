import { FONT } from '../ui/theme';
import Phaser from 'phaser';
import { GAME_WIDTH } from '../data/types';
import { GameState } from '../systems/stats';
import { QUESTS, isQuestClaimed, questClaimFlag, questRewardLabel } from '../data/quests';
import { addItem, getItem } from '../data/items';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { trySave } from '../utils/saveFeedback';
import { TouchMenuNav } from '../ui/touchMenuNav';

export class QuestLogScene extends Phaser.Scene {
  private selected = 0;
  private rows: Phaser.GameObjects.Text[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private touchNav?: TouchMenuNav;

  constructor() {
    super('QuestLog');
  }

  create(): void {
    Input.bind(this);
    this.selected = 0;
    buildScreenOverlay(this, 0.65);
    buildMenuPanel(this, 60, 40, GAME_WIDTH - 120, 400, 5);

    this.add.text(GAME_WIDTH / 2, 64, 'QUESTS', {
      fontFamily: FONT, fontSize: '22px', color: '#f5c542',
    }).setOrigin(0.5);

    this.statusText = this.add.text(GAME_WIDTH / 2, 420, 'Z: claim reward · X: close', {
      fontFamily: FONT, fontSize: '10px', color: '#8899aa',
    }).setOrigin(0.5);

    this.renderRows();
    this.touchNav = new TouchMenuNav(this, {
      onUp: () => { this.selected = (this.selected - 1 + QUESTS.length) % QUESTS.length; this.renderRows(); },
      onDown: () => { this.selected = (this.selected + 1) % QUESTS.length; this.renderRows(); },
      onConfirm: () => this.claim(),
      onCancel: () => this.close(),
    });
  }

  update(): void {
    Input.update();
    if (Input.justPressed('up')) {
      this.selected = (this.selected - 1 + QUESTS.length) % QUESTS.length;
      this.renderRows();
    }
    if (Input.justPressed('down')) {
      this.selected = (this.selected + 1) % QUESTS.length;
      this.renderRows();
    }
    if (Input.justPressed('confirm')) this.claim();
    if (Input.justPressed('cancel')) this.close();
  }

  private renderRows(): void {
    this.rows.forEach(t => t.destroy());
    this.rows = [];
    const p = GameState.player;
    QUESTS.forEach((q, i) => {
      const complete = q.isComplete(p);
      const claimed = isQuestClaimed(p, q.id);
      const mark = claimed ? '✓' : complete ? '!' : '·';
      const color = claimed ? '#556677' : complete ? '#f5c542' : i === this.selected ? '#f0f0f0' : '#8899aa';
      const sel = i === this.selected ? '▶ ' : '  ';
      const t = this.add.text(84, 88 + i * 32, `${sel}${mark} ${q.name} — ${q.description}`, {
        fontFamily: FONT, fontSize: '11px', color,
      });
      this.rows.push(t);
      if (i === this.selected) {
        const detail = claimed ? 'Reward claimed' : complete ? `Claim: ${questRewardLabel(q)}` : `Reward: ${questRewardLabel(q)}`;
        const d = this.add.text(104, 88 + i * 32 + 14, detail, {
          fontFamily: FONT, fontSize: '9px', color: '#667788',
        });
        this.rows.push(d);
      }
    });
  }

  private claim(): void {
    const q = QUESTS[this.selected];
    const p = GameState.player;
    if (!q.isComplete(p) || isQuestClaimed(p, q.id)) return;
    Sfx.menuConfirm();
    p.storyFlags[questClaimFlag(q.id)] = true;
    if (q.reward.money) p.money += q.reward.money;
    if (q.reward.item) {
      for (let n = 0; n < (q.reward.itemCount ?? 1); n++) addItem(p.items, q.reward.item);
      void getItem(q.reward.item);
    }
    trySave(this);
    this.renderRows();
  }

  close(): void {
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
