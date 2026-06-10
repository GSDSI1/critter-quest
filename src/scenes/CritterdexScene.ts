import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TYPE_NAMES } from '../data/types';
import { DEX_ORDER, getCreature, totalSpecies } from '../data/creatures';
import { getEvolutionChain } from '../data/evolutions';
import { LEARNSETS } from '../data/learnsets';
import { getMove } from '../data/moves';
import { GameState } from '../systems/stats';
import { addCreatureImage } from '../utils/assetLoader';
import { buildScreenOverlay, buildMenuPanel } from '../ui/sceneBackdrops';
import { Input } from '../systems/input';

export class CritterdexScene extends Phaser.Scene {
  private selected = 0;
  private fromPause = false;
  private tab: 'info' | 'area' | 'moves' | 'evo' = 'info';
  private learnScroll = 0;

  constructor() {
    super('Critterdex');
  }

  create(data: { fromPause?: boolean }): void {
    Input.bind(this);
    this.fromPause = data.fromPause ?? false;
    this.tab = 'info';
    this.renderShell();
    this.bindKeys();
  }

  private bindKeys(): void {
    this.input.keyboard?.off('keydown-UP');
    this.input.keyboard?.off('keydown-DOWN');
    this.input.keyboard?.off('keydown-LEFT');
    this.input.keyboard?.off('keydown-RIGHT');
    this.input.keyboard?.off('keydown-ESC');
    this.input.keyboard?.off('keydown-Z');
    this.input.keyboard?.on('keydown-UP', () => { this.selected = Math.max(0, this.selected - 1); this.renderList(); });
    this.input.keyboard?.on('keydown-DOWN', () => { this.selected = Math.min(DEX_ORDER.length - 1, this.selected + 1); this.renderList(); });
    this.input.keyboard?.on('keydown-LEFT', () => this.cycleTab(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.cycleTab(1));
    this.input.keyboard?.on('keydown-ESC', () => this.close());
    this.input.keyboard?.on('keydown-Z', () => this.close());
  }

  update(): void {
    Input.update();
    if (this.tab === 'moves') {
      const id = DEX_ORDER[this.selected];
      const total = (LEARNSETS[id] ?? []).length;
      const maxScroll = Math.max(0, total - 12);
      if (Input.justPressed('up')) {
        this.learnScroll = Math.max(0, this.learnScroll - 1);
        this.renderDetail();
        return;
      }
      if (Input.justPressed('down')) {
        this.learnScroll = Math.min(maxScroll, this.learnScroll + 1);
        this.renderDetail();
        return;
      }
    }
    if (Input.justPressed('up')) { this.selected = Math.max(0, this.selected - 1); this.learnScroll = 0; this.renderList(); }
    if (Input.justPressed('down')) { this.selected = Math.min(DEX_ORDER.length - 1, this.selected + 1); this.learnScroll = 0; this.renderList(); }
    if (Input.justPressed('left')) this.cycleTab(-1);
    if (Input.justPressed('right')) this.cycleTab(1);
    if (Input.justPressed('cancel') || Input.justPressed('confirm')) this.close();
  }

  private readonly tabs: Array<'info' | 'area' | 'moves' | 'evo'> = ['info', 'area', 'moves', 'evo'];

  private cycleTab(dir: number): void {
    const idx = this.tabs.indexOf(this.tab);
    this.tab = this.tabs[(idx + dir + this.tabs.length) % this.tabs.length];
    this.learnScroll = 0;
    this.renderDetail();
  }

  private renderShell(): void {
    this.children.removeAll(true);
    buildScreenOverlay(this, 0.82);
    buildMenuPanel(this, 12, 8, GAME_WIDTH - 24, GAME_HEIGHT - 16, 2);
    const caught = GameState.player.dexCaught.length;
    this.add.text(GAME_WIDTH / 2, 16, `Critterdex  ${caught}/${totalSpecies()}`, {
      fontFamily: '"Courier New", monospace', fontSize: '20px', color: '#f5c542',
    }).setOrigin(0.5).setName('header');
    this.renderList();
    this.renderDetail();
  }

  private listContainer!: Phaser.GameObjects.Container;
  private detailContainer!: Phaser.GameObjects.Container;

  private renderList(): void {
    if (this.listContainer) this.listContainer.destroy();
    this.listContainer = this.add.container(0, 0);
    const start = Math.max(0, this.selected - 4);
    const visible = DEX_ORDER.slice(start, start + 9);

    visible.forEach((id, vi) => {
      const idx = start + vi;
      const def = getCreature(id);
      const seen = GameState.player.dexSeen.includes(id);
      const caught = GameState.player.dexCaught.includes(id);
      const y = 44 + vi * 42;
      const sel = idx === this.selected;

      const bg = this.add.graphics();
      bg.fillStyle(sel ? COLORS.panelBorder : COLORS.panel, 0.85);
      bg.fillRoundedRect(24, y, 280, 38, 5);
      this.listContainer.add(bg);

      const num = String(def.dexNumber).padStart(3, '0');
      const name = caught ? def.name : seen ? def.name : '???';
      this.listContainer.add(this.add.text(36, y + 10, `${num}  ${name}`, {
        fontFamily: '"Courier New", monospace', fontSize: '12px',
        color: caught ? '#f0f0f0' : seen ? '#8899aa' : '#444444',
      }));

      if (caught || seen) {
        def.types.forEach((t, ti) => {
          this.listContainer.add(this.add.image(230 + ti * 16, y + 19, `type_${t}`).setScale(0.55));
        });
      }
      if (caught) {
        this.listContainer.add(addCreatureImage(this, 270, y + 19, id, true).setScale(1.5));
      }
    });
  }

  private renderDetail(): void {
    if (this.detailContainer) this.detailContainer.destroy();
    this.detailContainer = this.add.container(0, 0);

    const id = DEX_ORDER[this.selected];
    const def = getCreature(id);
    const caught = GameState.player.dexCaught.includes(id);
    const seen = GameState.player.dexSeen.includes(id);

    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.95);
    panel.fillRoundedRect(320, 44, 300, 400, 8);
    panel.lineStyle(2, COLORS.panelBorder, 1);
    panel.strokeRoundedRect(320, 44, 300, 400, 8);
    this.detailContainer.add(panel);

    const tabLabels: [typeof this.tab, string, number][] = [
      ['info', 'Info', 330], ['area', 'Area', 390], ['moves', 'Moves', 450], ['evo', 'Evo', 510],
    ];
    tabLabels.forEach(([key, label, x]) => {
      this.detailContainer.add(this.add.text(x, 52, this.tab === key ? `▶ ${label}` : `  ${label}`, {
        fontFamily: '"Courier New", monospace', fontSize: '10px', color: this.tab === key ? '#f5c542' : '#667788',
      }).setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.tab = key; this.renderDetail(); }));
    });

    if (!seen && !caught) {
      this.detailContainer.add(this.add.text(470, 200, '???', {
        fontFamily: '"Courier New", monospace', fontSize: '24px', color: '#444444',
      }).setOrigin(0.5));
      return;
    }

    if (caught) {
      this.detailContainer.add(addCreatureImage(this, 470, 120, id).setScale(1.5));
      this.detailContainer.add(this.add.image(340, 120, `footprint_${def.shape}`).setScale(1.2));
    }

    this.detailContainer.add(this.add.text(470, 200, caught ? def.name : '???', {
      fontFamily: '"Courier New", monospace', fontSize: '18px', color: '#f5c542',
    }).setOrigin(0.5));

    def.types.forEach((t, ti) => {
      this.detailContainer.add(this.add.image(450 + ti * 22, 222, `type_${t}`).setScale(0.7));
    });

    if (this.tab === 'info') {
      this.detailContainer.add(this.add.text(470, 248, caught ? def.types.map(t => TYPE_NAMES[t]).join(' / ') : '???', {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#8899aa',
      }).setOrigin(0.5));
      this.detailContainer.add(this.add.text(330, 270, caught ? def.description : 'Seen in the wild.', {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#c0c0c0',
        wordWrap: { width: 280 }, align: 'center',
      }).setOrigin(0.5, 0));
      if (caught) {
        const b = def.baseStats;
        this.detailContainer.add(this.add.text(330, 350, `HP ${b.hp}  ATK ${b.atk}  DEF ${b.def}\nSPA ${b.spa}  SPD ${b.spd}  SPE ${b.spe}`, {
          fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#667788',
        }));
        if (def.height && def.weight) {
          this.detailContainer.add(this.add.text(330, 390, `H:${def.height}m  W:${def.weight}kg`, {
            fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#667788',
          }));
        }
      }
    } else if (this.tab === 'area') {
      const habitat = def.habitat ?? 'Unknown area';
      this.detailContainer.add(this.add.text(470, 280, 'Habitat', {
        fontFamily: '"Courier New", monospace', fontSize: '14px', color: '#f5c542',
      }).setOrigin(0.5));
      this.detailContainer.add(this.add.text(330, 310, seen || caught ? habitat : 'Unknown', {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#c0c0c0',
        wordWrap: { width: 280 }, align: 'center',
      }).setOrigin(0.5, 0));
    } else if (this.tab === 'moves' && caught) {
      const entries = LEARNSETS[id] ?? [];
      const visible = entries.slice(this.learnScroll, this.learnScroll + 12);
      const lines = visible.map(e => `Lv.${String(e.level).padStart(2)}  ${getMove(e.move).name}`);
      this.detailContainer.add(this.add.text(330, 270, lines.join('\n') || 'No learnset data.', {
        fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#c0c0c0',
        lineSpacing: 4,
      }));
      if (entries.length > 12) {
        this.detailContainer.add(this.add.text(330, 390, `↑↓ scroll  ${this.learnScroll + 1}-${Math.min(this.learnScroll + 12, entries.length)} / ${entries.length}`, {
          fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#667788',
        }));
      }
    } else if (this.tab === 'evo' && (seen || caught)) {
      const chain = getEvolutionChain(id);
      const chainText = chain.map(sid => getCreature(sid).name).join(' → ');
      this.detailContainer.add(this.add.text(330, 280, 'Evolution', {
        fontFamily: '"Courier New", monospace', fontSize: '13px', color: '#f5c542',
      }).setOrigin(0.5, 0));
      this.detailContainer.add(this.add.text(330, 310, chainText, {
        fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#c0c0c0',
        wordWrap: { width: 280 }, align: 'center',
      }).setOrigin(0.5, 0));
    }
  }

  private close(): void {
    this.scene.stop();
    if (this.fromPause) this.scene.resume('PauseMenu');
    else this.scene.resume('Overworld');
  }
}
