import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { gameAssets, gameState } from "../../gameState";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPositioned";
import { TILE_TYPES } from "../../LEVEL_SAMPLE";
import { isSolidTile, calculateTileCoordinates, getTilesByType, getTileXy, getTileAtPosition, getTileProperties, determineVisibleTiles, getSurroundingTiles } from "../../utils/tileBlockHelpers";
import { isEntityInView } from "../../utils/collitionHelpers";
import { CollectibleEntity } from "../collectible/CollectibleEntity";
import { GameEntity } from "../GameEntity";
import { PlatformEntity } from "../platform/PlatformEntity";

export class TileEntity extends GameEntity<ILevelProps> implements IGameEntity<ILevelProps>{
    collisionDetectors?: ICollisionDetector[];
    private tileSpatialGrid: Map<string, IIndexedTile[]> = new Map();

    public logicalCollisionMap: boolean[][] = [];
    
    constructor(props:ILevelProps){
        super("tileBlock",props);
        
      
    }

    private buildSpatialGrid(indexedTiles: IIndexedTile[], grid_size:number) {
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
        // Recalculate indexed tiles to be safe.
        self.props.indexedTiles = calculateTileCoordinates(self.props.tileMap);
        // Build spatial grid with tile width for optimal performance.
        this.buildSpatialGrid(self.props.indexedTiles, self.props.tileWidth);
        
        // Build a logical collision map for quick lookups
        self.props.tileMap.forEach((row, rowIndex) => {
            this.logicalCollisionMap[rowIndex] = [];
            row.forEach((tileType, colIndex) => {
                this.logicalCollisionMap[rowIndex][colIndex] = isSolidTile(tileType);
            });
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
            const tileProperties = getTileProperties(tile.type as keyof typeof TILE_TYPES)!;
            const isVisible = determineVisibleTiles(props, tile, viewport, screenWidth, screenHeight); 
            
            if (isVisible) {
                if (tile.type === 1) {
                    const tileTexture = self.props.textures!["solid"] 
                    // Use the full drawImage signature to specify source and destination rectangles
                    ctx.drawImage(
                        tileTexture.texture.src, // Source image
                        tileTexture.x,          // Source x
                        tileTexture.y,          // Source y
                        tileTexture.width,      // Source width
                        tileTexture.height,      // Source height
                        tile.x,          // Destination x
                        tile.y,          // Destination y
                        tileProperties.width,    // Destination width
                        tileProperties.height     // Destination height
                    );
                } else if (tile.type === 2) {
                    ctx.fillStyle = "#8B4513";
                    ctx.fillRect(tile.x, tile.y, tileProperties.width, tileProperties.height);
                } else if (tile.type === 5) {
                    const tileTexture = self.props.textures!["pilar"];
                    ctx.drawImage(
                        tileTexture.texture.src,
                        tileTexture.x,
                        tileTexture.y,
                        tileTexture.width,
                        tileTexture.height,
                        tile.x,
                        tile.y,
                        tileProperties.width,
                        tileProperties.height
                    );
                }
            }
        });

    
    };
    
    getBoundingBox = (self:IGameEntity<ILevelProps>): IBoundingBox => { 
        // Correctly calculate the level's bounding box
        const width = self.props.tileMap[0].length * self.props.tileWidth;
        const height = self.props.tileMap.length * self.props.tileHeight;
        return { x: 0, y: 0, width, height };
    }
}
