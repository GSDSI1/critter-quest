import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import { getTile, type GameMap, type MapTheme } from '../../data/maps';
import { isExternalTilesetAvailable } from '../../utils/assetLoader';
import { isSmallInterior } from '../../utils/camera';
import { tileTextureKey, proceduralTilesetKey, bakeProceduralTileset } from '../../utils/sprites';

/** Alternate tileset frames for animated tall grass / water (see pack-tileset.mjs). */
const ANIM_ALT: Record<number, number> = { 2: 19, 3: 20 };

export class MapRenderer {
  private static tileDataCache = new Map<string, number[][]>();

  private tileLayer?: Phaser.Tilemaps.TilemapLayer;
  private animContainer?: Phaser.GameObjects.Container;
  private decorLayer?: Phaser.GameObjects.Container;
  private animTiles: { img: Phaser.GameObjects.Image; tile: number; x: number; y: number }[] = [];
  private animCells: { x: number; y: number; base: number; alt: number }[] = [];
  private animFrame = 0;
  private animTimer = 0;
  private map!: GameMap;
  private useTileAnim = false;

  constructor(private scene: Phaser.Scene) {}

  render(map: GameMap): void {
    this.map = map;
    this.tileLayer?.destroy();
    this.animContainer?.destroy();
    this.decorLayer?.destroy();
    this.animTiles = [];
    this.animCells = [];
    this.useTileAnim = false;

    const data = MapRenderer.tileDataFor(map);

    if (isExternalTilesetAvailable(this.scene)) {
      const tm = this.scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
      const tileset = tm.addTilesetImage('tileset', 'ext_tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0);
      if (tileset) {
        this.tileLayer = tm.createLayer(0, tileset, 0, 0)?.setDepth(0);
        this.buildAnimatedOverlays(map, true);
        this.renderEdgeOverlays();
        this.decorLayer = this.scene.add.container(0, 0).setDepth(6);
        this.renderDecorations();
        return;
      }
    }

    const theme: MapTheme = map.mapTheme ?? 'outdoor';
    bakeProceduralTileset(this.scene, theme);
    const tm = this.scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = tm.addTilesetImage('tiles', proceduralTilesetKey(theme), TILE_SIZE, TILE_SIZE, 0, 0);
    if (tileset) {
      this.tileLayer = tm.createLayer(0, tileset, 0, 0)?.setDepth(0);
    }

    this.buildAnimatedOverlays(map, false);
    this.renderEdgeOverlays();
    this.decorLayer = this.scene.add.container(0, 0).setDepth(6);
    this.renderDecorations();
  }

  private static tileDataFor(map: GameMap): number[][] {
    let cached = MapRenderer.tileDataCache.get(map.id);
    if (cached) return cached;
    cached = [];
    for (let y = 0; y < map.height; y++) {
      cached[y] = [];
      for (let x = 0; x < map.width; x++) {
        cached[y][x] = getTile(map, x, y);
      }
    }
    MapRenderer.tileDataCache.set(map.id, cached);
    return cached;
  }

  private buildAnimatedOverlays(map: GameMap, external: boolean): void {
    if (external && this.tileLayer) {
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const tile = getTile(map, x, y);
          const alt = ANIM_ALT[tile];
          if (alt !== undefined) this.animCells.push({ x, y, base: tile, alt });
        }
      }
      this.useTileAnim = this.animCells.length > 0;
      return;
    }

    const theme: MapTheme = map.mapTheme ?? 'outdoor';
    this.animContainer = this.scene.add.container(0, 0).setDepth(2);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = getTile(map, x, y);
        if (tile === 2 || tile === 3) {
          const img = this.scene.add.image(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            tileTextureKey(tile, theme, 0),
          );
          this.animContainer.add(img);
          this.animTiles.push({ img, tile, x, y });
        }
      }
    }
  }

  update(delta: number): void {
    this.animTimer += delta;
    if (this.animTimer < 500) return;
    this.animTimer = 0;
    this.animFrame = 1 - this.animFrame;

    if (this.useTileAnim && this.tileLayer) {
      for (const { x, y, base, alt } of this.animCells) {
        this.tileLayer.putTileAt(this.animFrame ? alt : base, x, y);
      }
      return;
    }

    const theme = this.map.mapTheme;
    for (const { img, tile } of this.animTiles) {
      img.setTexture(tileTextureKey(tile, theme, this.animFrame));
    }
  }

  private renderEdgeOverlays(): void {
    const edgeGfx = this.scene.add.graphics().setDepth(1);
    const shore = (tile: number) => tile === 0 || tile === 1;

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = getTile(this.map, x, y);
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const n = [
          getTile(this.map, x, y - 1),
          getTile(this.map, x + 1, y),
          getTile(this.map, x, y + 1),
          getTile(this.map, x - 1, y),
        ];
        const nw = getTile(this.map, x - 1, y - 1);
        const ne = getTile(this.map, x + 1, y - 1);

        if (tile === 0) {
          edgeGfx.fillStyle(0x2d6b27, 0.35);
          if (n[0] === 1) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 1) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 1) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 1) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
          if (n[0] === 1 && n[3] === 1 && nw !== 1) {
            edgeGfx.fillStyle(0x3d8b37, 0.45);
            edgeGfx.fillRect(px, py, 3, 3);
          }
          if (n[0] === 1 && n[1] === 1 && ne !== 1) {
            edgeGfx.fillStyle(0x3d8b37, 0.45);
            edgeGfx.fillRect(px + TILE_SIZE - 3, py, 3, 3);
          }
        } else if (tile === 1) {
          edgeGfx.fillStyle(0x3d8b37, 0.25);
          if (n[0] === 0) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 0) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 0) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 0) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
        } else if (tile === 3) {
          edgeGfx.fillStyle(0x1e40af, 0.35);
          if (shore(n[0])) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (shore(n[1])) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (shore(n[2])) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (shore(n[3])) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
        }
      }
    }
  }

  private renderDecorations(): void {
    if (!isSmallInterior(this.map)) return;
    for (let x = 1; x < this.map.width - 1; x++) {
      if (getTile(this.map, x, 1) === 6) {
        this.decorLayer!.add(
          this.scene.add.image(x * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE + 2, 'decor_light'),
        );
      }
    }
    const corners = [
      { x: 1, y: 5 },
      { x: this.map.width - 2, y: 5 },
    ];
    for (const c of corners) {
      if (getTile(this.map, c.x, c.y) === 6) {
        this.decorLayer!.add(
          this.scene.add.image(c.x * TILE_SIZE + TILE_SIZE / 2, c.y * TILE_SIZE + TILE_SIZE / 2, 'decor_plant'),
        );
      }
    }
    if (this.map.mapTheme === 'lab' && this.map.width > 7) {
      this.decorLayer!.add(
        this.scene.add.image(7 * TILE_SIZE + TILE_SIZE / 2, 5 * TILE_SIZE + TILE_SIZE / 2, 'decor_poster'),
      );
    }
  }
}
