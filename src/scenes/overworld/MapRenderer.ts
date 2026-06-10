import Phaser from 'phaser';
import { TILE_SIZE } from '../../data/types';
import { getTile, type GameMap, type MapTheme } from '../../data/maps';
import { isExternalTilesetAvailable } from '../../utils/assetLoader';
import { isSmallInterior } from '../../utils/camera';
import { tileTextureKey, proceduralTilesetKey, bakeProceduralTileset } from '../../utils/sprites';

export class MapRenderer {
  private tileLayer?: Phaser.Tilemaps.TilemapLayer;
  private animContainer?: Phaser.GameObjects.Container;
  private decorLayer?: Phaser.GameObjects.Container;
  private animTiles: { img: Phaser.GameObjects.Image; tile: number; x: number; y: number }[] = [];
  private animFrame = 0;
  private animTimer = 0;
  private map!: GameMap;

  constructor(private scene: Phaser.Scene) {}

  render(map: GameMap): void {
    this.map = map;
    this.tileLayer?.destroy();
    this.animContainer?.destroy();
    this.decorLayer?.destroy();
    this.animTiles = [];

    const data: number[][] = [];
    for (let y = 0; y < map.height; y++) {
      data[y] = [];
      for (let x = 0; x < map.width; x++) {
        data[y][x] = getTile(map, x, y);
      }
    }

    if (isExternalTilesetAvailable(this.scene)) {
      const tm = this.scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
      const tileset = tm.addTilesetImage('tileset', 'ext_tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0);
      if (tileset) {
        this.tileLayer = tm.createLayer(0, tileset, 0, 0)?.setDepth(0);
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

    this.renderEdgeOverlays();
    this.decorLayer = this.scene.add.container(0, 0).setDepth(6);
    this.renderDecorations();
  }

  update(delta: number): void {
    this.animTimer += delta;
    if (this.animTimer >= 500) {
      this.animTimer = 0;
      this.animFrame = 1 - this.animFrame;
      const theme = this.map.mapTheme;
      for (const { img, tile } of this.animTiles) {
        img.setTexture(tileTextureKey(tile, theme, this.animFrame));
      }
    }
  }

  private renderEdgeOverlays(): void {
    const edgeGfx = this.scene.add.graphics().setDepth(1);
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = getTile(this.map, x, y);
        if (tile !== 0 && tile !== 1) continue;
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        const n = [
          getTile(this.map, x, y - 1),
          getTile(this.map, x + 1, y),
          getTile(this.map, x, y + 1),
          getTile(this.map, x - 1, y),
        ];
        if (tile === 0) {
          edgeGfx.fillStyle(0x2d6b27, 0.35);
          if (n[0] === 1) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 1) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 1) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 1) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
        } else {
          edgeGfx.fillStyle(0x3d8b37, 0.25);
          if (n[0] === 0) edgeGfx.fillRect(px, py, TILE_SIZE, 2);
          if (n[1] === 0) edgeGfx.fillRect(px + TILE_SIZE - 2, py, 2, TILE_SIZE);
          if (n[2] === 0) edgeGfx.fillRect(px, py + TILE_SIZE - 2, TILE_SIZE, 2);
          if (n[3] === 0) edgeGfx.fillRect(px, py, 2, TILE_SIZE);
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
