import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { ILevelProps } from "../../interface/ILevelProps";
import { TileDefinitions } from "../../level-settings/TileDefinitions";
import { gameState } from "../../state/gameState";
import { calculateTileCoordinates, isSolidTile, getTileProperties, determineVisibleTiles } from "../../utils/tileBlockHelpers";
import { GameEntity } from "../GameEntity";
import { StateHelper } from "../StateHelper";

export class LevelEntity extends GameEntity<ILevelProps> {
    
    public tileSpatialGrid: Map<string, IIndexedTile[]> = new Map();
    public logicalCollisionMap: { type: number, x: number, y: number, row: number, col: number }[][] = [];
    public tileImageData: Map<number, ImageData> = new Map();
    public backgroundTiles: IIndexedTile[] = [];
    public foregroundTiles: IIndexedTile[] = [];

    lifeTime: number = Infinity;

    constructor(props: ILevelProps) {
        super("tileBlock", props);
        
        this.stateHelper = new StateHelper(props);
    }

    /**
     * Retrieves the properties and image data for a specific tile type.
     * @param type The tile type number.
     * @returns An object containing the tile properties and its ImageData.
     */
    private buildSpatialGrid(indexedTiles: IIndexedTile[], grid_size: number) {
        for (const tile of indexedTiles) {
            const gridX = Math.floor(tile.x / grid_size);
            const gridY = Math.floor(tile.y / grid_size);
            const key = `${gridX}_${gridY}`;
            if (!this.tileSpatialGrid.has(key)) {
                this.tileSpatialGrid.set(key, []);
            }
            this.tileSpatialGrid.get(key)!.push(tile);
        }
    }

    public getTilesInArea(x: number, y: number, width: number, height: number, gridSize: number): IIndexedTile[] {
        const tilesInArea: IIndexedTile[] = [];
        const startX = Math.floor(x / gridSize);
        const startY = Math.floor(y / gridSize);
        const endX = Math.floor((x + width) / gridSize);
        const endY = Math.floor((y + height) / gridSize);

        for (let gridX = startX; gridX <= endX; gridX++) {
            for (let gridY = startY; gridY <= endY; gridY++) {
                const key = `${gridX}_${gridY}`;
                const tiles = this.tileSpatialGrid.get(key);
                if (tiles) {
                    tilesInArea.push(...tiles);
                }
            }
        }
        return tilesInArea;
    }

    onInit? = (self: IGameEntity<ILevelProps>) => {
        const tileTypes = Object.keys(TileDefinitions);
        for (const key of tileTypes) { 
            const tileTypeProperties = TileDefinitions[key];
            if(tileTypeProperties.texture && tileTypeProperties.isSolid){
            const texture = self.props.textures![tileTypeProperties.texture!];
            
            if(texture){
                if(texture.imageData)
                    this.tileImageData.set(parseInt(key), texture.imageData);
            }else console.warn(`${key} has no texture`)
            
            }
        }

        // Recalculate indexed tiles and sort into background and foreground.
        self.props.indexedTiles = calculateTileCoordinates(self.props.tileMap);
        this.backgroundTiles = [];
        this.foregroundTiles = [];
        self.props.indexedTiles.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            // Assuming the player's zIndex is 10, separate tiles into background and foreground.
            if ((tileProperties.zIndex || 0) < 10) {
                this.backgroundTiles.push(tile);
            } else {
                this.foregroundTiles.push(tile);
            }
        });

        // Build spatial grid with tile width for optimal performance.
        this.buildSpatialGrid(self.props.indexedTiles, self.props.tileWidth);

        // Initialize the logicalCollisionMap with nulls.
        this.logicalCollisionMap = new Array(self.props.tileMap.length).fill(null).map(() => new Array(self.props.tileMap[0].length).fill(null));

        // Iterate through indexed tiles to build the collision map.
        self.props.indexedTiles.forEach(tile => {
            const tileProps = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            
            // Check if the tile is solid. This logic now handles all solid tiles, including complex ones like tile 7.
            if (isSolidTile(tile.type)) { 
                const tileWidth = tileProps?.width ?? self.props.tileWidth;
                const tileHeight = tileProps?.height ?? self.props.tileHeight;

                const startCol = Math.floor(tile.x / self.props.tileWidth);
                const startRow = Math.floor(tile.y / self.props.tileHeight);

                const cellsX = Math.floor(tileWidth / self.props.tileWidth);
                const cellsY = Math.floor(tileHeight / self.props.tileHeight);

                for (let x = 0; x < cellsX; x++) {
                    for (let y = 0; y < cellsY; y++) {
                        const logicalRow = startRow + y;
                        const logicalCol = startCol + x;
                        if (logicalRow < this.logicalCollisionMap.length && logicalCol < this.logicalCollisionMap[0].length) {
                             // Store the tile type and the top-left coordinates of the tile
                             this.logicalCollisionMap[logicalRow][logicalCol] = { type: tile.type, x: tile.x, y: tile.y, row: logicalRow, col: logicalCol };
                        }
                    }
                }
            }
        });
    }

    onUpdate? = (self: IGameEntity<ILevelProps>, timeStamp: number) => {
        const viewport = gameState.viewport;
    };

    private drawTiles(self: IGameEntity<ILevelProps>, helper: CanvasHelper, tilesToDraw: IIndexedTile[]) {
        const props = self.props;
        const ctx = helper.ctx;
        const viewport = gameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;

        tilesToDraw.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            const isVisible = determineVisibleTiles(props, tile, viewport, screenWidth, screenHeight);
            
            if (isVisible && tileProperties.useLevelCreator) {
                const offsetX = tileProperties?.offset?.x || 0;
                const offsetY = tileProperties?.offset?.y || 0;
                const drawX = tile.x + offsetX;
                const drawY = tile.y + offsetY;

                if (tileProperties.texture) {
                    const tileTexture = self.props.textures![tileProperties.texture!];
                    if (tileTexture.texture) { 
                        ctx.drawImage(
                            tileTexture.texture.src,
                            tileTexture.x,
                            tileTexture.y,
                            tileTexture.width,
                            tileTexture.height,
                            drawX,
                            drawY,
                            tileProperties.width,
                            tileProperties.height
                        );
                    } else console.warn("texture is missing", tile.type)
                } else {
                    ctx.fillStyle = "#8B4513";
                    ctx.fillRect(drawX, drawY, tileProperties.width, tileProperties.height);
                }
            }
        });
    }

    onDrawBackground? = (self: IGameEntity<ILevelProps>, helper: CanvasHelper) => {
        this.drawTiles(self, helper, this.backgroundTiles);
    };

    onDrawForeground? = (self: IGameEntity<ILevelProps>, helper: CanvasHelper) => {
        this.drawTiles(self, helper, this.foregroundTiles);
    };

    getBoundingBox = (self: IGameEntity<ILevelProps>): IBoundingBox => {
        const width = self.props.tileMap[0].length * self.props.tileWidth;
        const height = self.props.tileMap.length * self.props.tileHeight;
        return { x: 0, y: 0, width, height };
    }
}
