import { FONT, titleStyle, bodyStyle, hintStyle } from '../ui/theme';
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../data/types';
import { GameState } from '../systems/stats';
import { QUESTS, isQuestClaimed, questClaimFlag, questRewardLabel, questProgress } from '../data/quests';
import { addItem, getItem } from '../data/items';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';
import { Sfx } from '../utils/audio';
import { trySave } from '../utils/saveFeedback';
import { TouchMenuNav } from '../ui/touchMenuNav';

export class QuestLogScene extends Phaser.Scene {
  private selected = 0;
  private rowContainer!: Phaser.GameObjects.Container;
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

    this.add.text(GAME_WIDTH / 2, 64, 'QUESTS', titleStyle('22px')).setOrigin(0.5);

    this.statusText = this.add.text(GAME_WIDTH / 2, 420, 'Z: claim reward · X: close', hintStyle('10px')).setOrigin(0.5);

    this.rowContainer = this.add.container(0, 0);
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
    this.rowContainer.removeAll(true);
    const p = GameState.player;
    QUESTS.forEach((q, i) => {
      const y = 88 + i * 34;
      const complete = q.isComplete(p);
      const claimed = isQuestClaimed(p, q.id);
      const mark = claimed ? '✓' : complete ? '!' : '·';
      const sel = i === this.selected;
      if (sel) {
        const hi = this.add.graphics();
        hi.fillStyle(COLORS.panelBorder, 0.35);
        hi.fillRoundedRect(76, y - 4, GAME_WIDTH - 152, 30, 4);
        this.rowContainer.add(hi);
      }
      const prog = questProgress(p, q);
      if (!claimed && prog > 0 && prog < 1) {
        const bar = this.add.graphics();
        bar.fillStyle(COLORS.panelBorder, 0.6);
        bar.fillRoundedRect(104, y + 22, 120, 6, 2);
        bar.fillStyle(COLORS.gold, 0.9);
        bar.fillRoundedRect(104, y + 22, Math.max(4, 120 * prog), 6, 2);
        this.rowContainer.add(bar);
      }
      const color = claimed ? '#556677' : complete ? COLORS.goldHex : sel ? COLORS.textHex : COLORS.textDimHex;
      this.rowContainer.add(this.add.text(84, y, `${sel ? '▶ ' : '  '}${mark} ${q.name}`, bodyStyle('11px', color)));
      if (sel) {
        const detail = claimed ? 'Reward claimed' : complete ? `Claim: ${questRewardLabel(q)}` : q.description;
        this.rowContainer.add(this.add.text(104, y + 12, detail, hintStyle('10px')));
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
    this.cameras.main.flash(120, 245, 197, 66);
    this.renderRows();
  }

  close(): void {
    this.scene.stop();
    this.scene.resume('PauseMenu');
  }
}
