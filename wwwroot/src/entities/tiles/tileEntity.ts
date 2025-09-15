import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { ILevelProps } from "../../interface/ILevelProps";
import { TileDefinitions } from "../../level/TileDefinitions";
import { gameState } from "../../state/gameState";
import { calculateTileCoordinates, isSolidTile, getTileProperties, determineVisibleTiles, getTileXY, getTilesByType } from "../../utils/tileBlockHelpers";
import { GameEntity } from "../GameEntity";
import { StateHelper } from "../StateHelper";
import { gameAssets } from "../../state/gameState";


export class TileEntity extends GameEntity<ILevelProps> {
 
    public tileSpatialGrid: Map<string, IIndexedTile[]> = new Map();
    
    // Updated to store an object with the tile type, original world coordinates, and logical row/col
    public logicalCollisionMap: { type: number, x: number, y: number, row: number, col: number }[][] = [];
    public tileImageData: Map<number, ImageData> = new Map();

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

        // Recalculate indexed tiles to be safe.
        self.props.indexedTiles = calculateTileCoordinates(self.props.tileMap);
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

    onDraw? = (self: IGameEntity<ILevelProps>, helper: CanvasHelper) => {
        const props = self.props;
        const ctx = helper.ctx;
        const viewport = gameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;

        // Iterate over the pre-calculated tiles. This is much faster.
        self.props.indexedTiles.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            const isVisible = determineVisibleTiles(props, tile, viewport, screenWidth, screenHeight);
            if (isVisible && isSolidTile(tile.type)) {
                if (tileProperties.texture) {
                    const tileTexture = self.props.textures![tileProperties.texture!];
                    if (tileTexture.texture) {                    
                        // Use the full drawImage signature to specify source and destination rectangles
                        ctx.drawImage(
                            tileTexture.texture.src, // Source image
                            tileTexture.x,           // Source x
                            tileTexture.y,           // Source y
                            tileTexture.width,       // Source width
                            tileTexture.height,      // Source height
                            tile.x,                  // Destination x
                            tile.y,                  // Destination y
                            tileProperties.width,    // Destination width
                            tileProperties.height      // Destination height
                        );
                    }else console.warn("texture is missing",tile.type)
                } else {
                    ctx.fillStyle = "#8B4513";
                    ctx.fillRect(tile.x, tile.y, tileProperties.width, tileProperties.height);
                }
            }
        });
    };

    getBoundingBox = (self: IGameEntity<ILevelProps>): IBoundingBox => {
        // Correctly calculate the level's bounding box
        const width = self.props.tileMap[0].length * self.props.tileWidth;
        const height = self.props.tileMap.length * self.props.tileHeight;
        return { x: 0, y: 0, width, height };
    }
}
