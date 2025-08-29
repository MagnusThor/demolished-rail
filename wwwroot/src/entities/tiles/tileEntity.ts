// entities/tileBlock.ts

import { gameAssets, gameState } from "../../gameState";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { isEntityInView } from "../../utils/visibilityHelpers";

import { determineVisibleTiles, getTileProperties, getTilesByType, getTileXy, calculateTileCoordinates, IIndexedTile, isSolidTile } from "../../utils/tileBlockHelpers";
import { TILE_TYPES } from "../../LEVEL_SAMPLE";
import { Positioned } from "../../interface/IPositioned";
import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { GameEntity } from "../GameEntity";
import { IPoint2D } from "../../../../src/Engine/Helpers/Math/Point2D";
import { PlatformEntity } from "../platform/PlatformEntity";
import { CollectibleEntity } from "../collectible/CollectibleEntity";


export class TileEntity  extends GameEntity<ILevelProps> implements IGameEntity<ILevelProps>{
    collisionDetectors?: ICollisionDetector[] | undefined;
    private tileSpatialGrid: Map<string, IIndexedTile[]> = new Map();

    public logicalCollisionMap: boolean[][] = [];
   
    constructor(props:ILevelProps){
        super("tileBlock",props);
        
    }

    private buildSpatialGrid(indexedTiles: IIndexedTile[],grid_size:number) {
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

    onInit? = (self: IGameEntity<ILevelProps>) => {

        this.buildSpatialGrid(self.props.indexedTiles,100);

        self.props.textures.push(gameAssets.createTexture("tileset_1", 0, 0, 16, 32)!);


          self.props.tileMap.forEach((row, rowIndex) => {
            this.logicalCollisionMap[rowIndex] = [];
            row.forEach((tileType, colIndex) => {
                // Check if the tile type is considered solid
                this.logicalCollisionMap[rowIndex][colIndex] = isSolidTile(tileType);
            });
        });

        console.log("logicalCollisionMap",this.logicalCollisionMap);

        const props = self.props;
        // Use the new helper to pre-calculate all tile coordinates
        self.props.indexedTiles = calculateTileCoordinates(props.tileMap);
        // ... (rest of onInit remains the same, as getTilesByType returns grid indices)
       props.collectibles = getTilesByType(props.tileMap, 4).map(tile => {
            const { x, y } = getTileXy(props.tileMap, tile.y, tile.x);            
            // This now returns an entity with a position already set to the correct world coordinates
            return {
                ...new CollectibleEntity(tile.x,tile.y), // The width/height are now ignored in the factory
                props: {
                    ...new CollectibleEntity(tile.x, tile.y).props,
                    // The factory sets a temporary 0,0 position.
                    // This is where you should overwrite it with the correct world coordinates.
                    position: new Positioned(x, y, 16, 16) // Use correct dimensions for collectibles
                }
            };
        });
        props.platforms = getTilesByType(props.tileMap, 3).map(tile => {
            return new PlatformEntity(tile, props);
        });
    }
    onUpdate? = (self: IGameEntity<ILevelProps>, timeStamp: number) => {
    
        const viewport = gameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;
        const player = gameState.findEntities("playerBlock")[0];
        if (player) {

            self.props.platforms?.forEach(platform => {
                if (isEntityInView(platform, viewport, screenWidth, screenHeight)) {
                    const detector = platform.collisionDetectors?.find(d => d.targetName === "playerBlock");
                    if (detector) {
                        const collisionResults = detector.detectorFn(platform.props, player);
                        if (collisionResults) {
                            if (Array.isArray(collisionResults)) {
                                collisionResults.forEach(result => detector.onCollision(platform.props, result));
                            } else {
                                if (collisionResults !== true) {
                                    detector.onCollision(platform.props, collisionResults);
                                }
                            }
                        }
                    }
                }
            });

            self.props.collectibles?.forEach(collectible => {
                if (isEntityInView(collectible, viewport, screenWidth, screenHeight)) {
                    const detector = collectible.collisionDetectors?.find(d => d.targetName === "playerBlock");
                    if (detector) {
                        const collisionResults = detector.detectorFn(collectible.props, player);
                        if (collisionResults) {
                            if (Array.isArray(collisionResults)) {
                                collisionResults.forEach(result => detector.onCollision(collectible.props, result));
                            } else if (collisionResults && collisionResults !== true) {
                                detector.onCollision(collectible.props, collisionResults);
                            }
                        }
                    }
                }
            });
        }
        self.props.collectibles?.forEach(collectible => {
            if (isEntityInView(collectible, viewport, screenWidth, screenHeight)) {
                collectible.onUpdate!(collectible, timeStamp);
            }
        });
        self.props.platforms?.forEach(platform => {
            if (isEntityInView(platform, viewport, screenWidth, screenHeight)) {
                platform.onUpdate!(platform, timeStamp);
            }
        });

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
            // Check if the tile is visible using its pre-calculated world coordinates.
            const isVisible = determineVisibleTiles(props, tile, viewport, screenWidth, screenHeight);        
            if (isVisible) {
                if (tile.type === 1) {
                
                    ctx.drawImage(self.props.textures[0].texture.src, tile.x, tile.y, tileProperties.width, tileProperties.height);
                } else if (tile.type === 2) {
                    ctx.fillStyle = "#ccc";
                    ctx.fillRect(tile.x, tile.y, tileProperties.width, tileProperties.height);
                }
            }
        });
        // The drawing logic for platforms and collectibles remains the same.
        props.platforms?.forEach(platform => {
            if (isEntityInView(platform, viewport, screenWidth, screenHeight, 0)) {
                platform.onDraw!(platform, helper);
            }
        });

        props.collectibles?.forEach(collectible => {
            if (isEntityInView(collectible, viewport, screenWidth, screenHeight, 0)) {
                collectible.onDraw!(collectible, helper);
            }
        });
    };
   
    getBoundingBox = (self:IGameEntity<ILevelProps>): IBoundingBox => {  
            const width = self.props.tileMap[0].reduce((sum, tileId) => sum + getTileProperties(tileId as keyof typeof TILE_TYPES)!.width, 0);
            const height = self.props.tileMap.reduce((sum, row) => sum + Math.max(...row.map(tileId => getTileProperties(tileId as keyof typeof TILE_TYPES)!.height)), 0);
            return { x: 0, y: 0, width, height };
    }

}


