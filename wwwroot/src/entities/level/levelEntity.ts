import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity } from "../../interface/IGameEntity";
import { IIndexedTile } from "../../interface/IIndexedTile";
import { IAnimatedTileInstance, ILevelProps } from "../../interface/ILevelProps";
import { ISpriteAnimation } from "../../interface/ISpriteAnimation";
import { TileDefinitions } from "../../factory/TileDefinitions";
import { GameState } from "../../global/GameState";
import { calculateTileCoordinates, isSolidTile, getTileProperties, determineVisibleTiles } from "../../utils/tileEntityHelpers";
import { GameEntity } from "../GameEntity";
import { StateHelper } from "../StateHelper";


export class LevelEntity extends GameEntity<ILevelProps> {

    public tileSpatialGrid: Map<string, IIndexedTile[]> = new Map();
    public logicalCollisionMap: { type: number, x: number, y: number, row: number, col: number }[][] = [];
    public tileImageData: Map<number, ImageData> = new Map();
    public backgroundTiles: IIndexedTile[] = [];
    public foregroundTiles: IIndexedTile[] = [];
    public animatedTiles: IAnimatedTileInstance[] = []; // Now stores instances of IAnimatedTileInstance

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
            if (tileTypeProperties.texture && tileTypeProperties.isSolid) {
                const texture = self.props.textures![tileTypeProperties.texture!];

                if (texture) {
                    if (texture.imageData)
                        this.tileImageData.set(parseInt(key), texture.imageData);
                } else console.warn(`${key} has no texture`)

            }
        }

        // Recalculate indexed tiles and sort into background and foreground.
        self.props.indexedTiles = calculateTileCoordinates(self.props.tileMap);
        this.backgroundTiles = [];
        this.foregroundTiles = [];
        this.animatedTiles = [];
        self.props.indexedTiles.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            
            // Check for animation properties first
            if (tileProperties.tileAnimation) {
                 // Clone the animation object to create a unique instance per tile
                const animationInstance: ISpriteAnimation = {
                    ...tileProperties.tileAnimation!,
                    currentFrameIndex: 0,
                    lastFrameChangeTime: 0,
                };
                this.animatedTiles.push({
                    x: tile.x,
                    y: tile.y,
                    row: tile.row,
                    col: tile.col,
                    type: tile.type,
                    animation: animationInstance,
                });
            }

            // Then, sort into background and foreground.
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
        const viewport = GameState.viewport;
    };

    /**
     * A new method to draw animated tiles.
     * @param self The game entity.
     * @param helper The canvas helper.
     * @param tilesToDraw The array of animated tiles to draw.
     * @param timeStamp The current timestamp to determine the animation frame.
     */
    private drawAnimatedTiles(self: IGameEntity<ILevelProps>, helper: CanvasHelper, tilesToDraw: IAnimatedTileInstance[], timeStamp: number) {
        const props = self.props;
        const ctx = helper.ctx;
        const viewport = GameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;

        tilesToDraw.forEach(tileInstance => {
            const tileProperties = getTileProperties(tileInstance.type as keyof typeof TileDefinitions)!;
            const isVisible = determineVisibleTiles(props, tileInstance, viewport, screenWidth, screenHeight);

            if (isVisible && tileProperties.useLevelCreator) {
                const { animation } = tileInstance;

                // Update the animation frame if enough time has passed
                const timePerFrame = 1000 / animation.frameRate;
                if (timeStamp - animation.lastFrameChangeTime > timePerFrame) {
                    animation.currentFrameIndex = (animation.currentFrameIndex + 1) % animation.frames.length;
                    animation.lastFrameChangeTime = timeStamp;
                }

                const currentFrameTextureName = animation.frames[animation.currentFrameIndex];
                const tileTexture = self.props.textures![currentFrameTextureName];
                
                if (tileTexture && tileTexture.texture) {
                    const offsetX = tileProperties?.offset?.x || 0;
                    const offsetY = tileProperties?.offset?.y || 0;
                    const drawX = tileInstance.x + offsetX;
                    const drawY = tileInstance.y + offsetY;

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
                } else {
                    console.warn(`Animated texture '${currentFrameTextureName}' is missing for tile type ${tileInstance.type}`);
                }
            }
        });
    }

    private drawTiles(self: IGameEntity<ILevelProps>, helper: CanvasHelper, tilesToDraw: IIndexedTile[]) {
        const props = self.props;
        const ctx = helper.ctx;
        const viewport = GameState.viewport;
        const screenWidth = viewport.viewportWidth;
        const screenHeight = viewport.viewportHeight;

        tilesToDraw.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            const isVisible = determineVisibleTiles(props, tile, viewport, screenWidth, screenHeight);

            if (isVisible && tileProperties.useLevelCreator && !tileProperties.tileAnimation) { // Exclude animated tiles from this loop
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

    // Helper function to create an IIndexedTile
    private createIndexedTile(row: number, col: number, type: number): IIndexedTile {
        const x = col * this.props.tileWidth;
        const y = row * this.props.tileHeight;
        return {
            x,
            y,
            row,
            col,
            type
        };
    }

    /**
    * Updates a single tile in the level and rebuilds the necessary data structures.
    * @param row The row index of the tile.
    * @param col The column index of the tile.
    * @param newTileType The new tile type number.
    */
    public updateTileAt(row: number, col: number, newTileType: number) {
        if (row < 0 || row >= this.props.tileMap.length || col < 0 || col >= this.props.tileMap[0].length) {
            console.warn(`Attempted to update tile at out-of-bounds position (${row}, ${col}).`);
            return;
        }

        // 1. Update the main tileMap
        this.props.tileMap[row][col] = newTileType;

        // 2. Remove old tile from indexedTiles and add new one
        const oldTileIndex = this.props.indexedTiles.findIndex(t => t.row === row && t.col === col);
        if (oldTileIndex !== -1) {
            this.props.indexedTiles.splice(oldTileIndex, 1);
        }
        const newIndexedTile = this.createIndexedTile(row, col, newTileType);
        this.props.indexedTiles.push(newIndexedTile);

        // 3. Update the logicalCollisionMap
        const tileProps = getTileProperties(newTileType as keyof typeof TileDefinitions);
        if (isSolidTile(newTileType)) {
            // Store the new solid tile info
            this.logicalCollisionMap[row][col] = {
                type: newTileType,
                x: newIndexedTile.x,
                y: newIndexedTile.y,
                row,
                col
            };
        } else {
            // Clear the entry if the tile is no longer solid
            const prev = this.logicalCollisionMap[row][col];
            this.logicalCollisionMap[row][col] = {
                col: col,
                row: row,
                type: 0x00,
                x: prev.x,
                y: prev.y
            }
        }

        // 4. Rebuild the spatial grid and background/foreground tiles
        // A full rebuild is simple and ensures consistency, as the number of changed tiles is small.
        this.tileSpatialGrid.clear();
        this.backgroundTiles = [];
        this.foregroundTiles = [];
        this.animatedTiles = []; // Reset the animated tiles array as well
        this.props.indexedTiles.forEach(tile => {
            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions)!;
            
            // Check for animation properties first and add to the animatedTiles array
            if (tileProperties.tileAnimation) {
                const animationInstance: ISpriteAnimation = {
                    ...tileProperties.tileAnimation,
                    currentFrameIndex: 0,
                    lastFrameChangeTime: 0,
                };
                this.animatedTiles.push({
                    x: tile.x,
                    y: tile.y,
                    row: tile.row,
                    col: tile.col,
                    type: tile.type,
                    animation: animationInstance,
                });
            }

            if ((tileProperties.zIndex || 0) < 10) {
                this.backgroundTiles.push(tile);
            } else {
                this.foregroundTiles.push(tile);
            }
        });
        this.buildSpatialGrid(this.props.indexedTiles, this.props.tileWidth);
    }

    onDrawBackground? = (self: IGameEntity<ILevelProps>, helper: CanvasHelper, timeStamp: number) => {
        this.drawTiles(self, helper, this.backgroundTiles);
        // Draw background animated tiles, if any
        const backgroundAnimatedTiles = this.animatedTiles.filter(t => (getTileProperties(t.type)?.zIndex || 0) < 10);
        this.drawAnimatedTiles(self, helper, backgroundAnimatedTiles, timeStamp);
    };

    onDrawForeground? = (self: IGameEntity<ILevelProps>, helper: CanvasHelper, timeStamp: number): void => {
        this.drawTiles(self, helper, this.foregroundTiles);
        // Draw foreground animated tiles, if any
        const foregroundAnimatedTiles = this.animatedTiles.filter(t => (getTileProperties(t.type)?.zIndex || 0) >= 10);
        this.drawAnimatedTiles(self, helper, foregroundAnimatedTiles, timeStamp);
    };

    getBoundingBox = (self: IGameEntity<ILevelProps>): IBoundingBox => {
        const width = self.props.tileMap[0].length * self.props.tileWidth;
        const height = self.props.tileMap.length * self.props.tileHeight;
        return { x: 0, y: 0, width, height };
    }
}
