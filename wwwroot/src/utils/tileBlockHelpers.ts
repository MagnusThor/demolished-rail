import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameEntity } from "../interface/IGameEntity";
import { IIndexedTile } from "../interface/IIndexedTile";
import { ILevelProps, ITileProps } from "../interface/ILevelProps";
import { DEFAULT_TILE_WIDTH, DEFULT_TILE_HEIGHT } from "../level/LEVEL_SAMPLE";
import { TileDefinitions } from "../level/TileDefinitions";
import { isEntityInView } from "./collitionHelpers";


/**
 * Checks if a tile is considered solid based on its type.
 * @param tileType The type of the tile.
 * @returns True if the tile is solid, false otherwise.
 */
export const isSolidTile = (tileType: number): boolean => {
    const properties = getTileProperties(tileType);
    return properties!.isSolid
}

export const getTileImageDataAndProps = (tileImageData:Map<number, ImageData>,
        type: number): { props: ITileProps, data: ImageData } | null => {
        const props = getTileProperties(type);
     
        const data = tileImageData.get(type);
            
        if (props && data) {
            return { props, data };
        }
        return null;
    }



/**
 * Finds the closest solid tile in a specific direction.
 * @param tileMap The 2D array representing the tile map.
 * @param startX The starting X coordinate.
 * @param startY The starting Y coordinate.
 * @param direction The direction to search ("up" or "down").
 * @returns The coordinates of the closest solid tile, or null if none is found.
 */
export const findClosestSolidTile = (tileMap: number[][], startX: number, startY: number, direction: "up" | "down"): { x: number, y: number } | null => {
    if (direction === "up") {
        for (let y = startY - 1; y >= 0; y--) {
            if (tileMap[y] && tileMap[y][startX] === 1) {
                return { x: startX, y: y };
            }
        }
    } else { // direction === "down"
        for (let y = startY + 1; y < tileMap.length; y++) {
            if (tileMap[y] && tileMap[y][startX] === 1) {
                return { x: startX, y: y };
            }
        }
    }
    return null;
}

/**
 * Determines whether a rectangle collides with any non-empty tiles in a tile map.
 * @param x The x-coordinate (in pixels) of the top-left corner of the rectangle.
 * @param y The y-coordinate (in pixels) of the top-left corner of the rectangle.
 * @param width The width (in pixels) of the rectangle.
 * @param height The height (in pixels) of the rectangle.
 * @param tileMap A 2D array representing the tile map, where each value corresponds to a tile type (values > 0 are considered solid).
 * @param tileWidth The width (in pixels) of a single tile.
 * @param tileHeight The height (in pixels) of a single tile.
 * @returns `true` if the rectangle overlaps any non-empty (solid) tiles; otherwise, `false`.
 */
export const isTileCollision = (
    x: number,
    y: number,
    width: number,
    height: number,
    tileMap: number[][],
    tileWidth: number,
    tileHeight: number
): boolean => {
    // Calculate the tile coordinates for the rectangle's corners
    const startCol = Math.floor(x / tileWidth);
    const endCol = Math.floor((x + width) / tileWidth);
    const startRow = Math.floor(y / tileHeight);
    const endRow = Math.floor((y + height) / tileHeight);

    // Iterate over the tiles the rectangle overlaps with
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Check if the tile coordinates are within the map bounds
            if (row >= 0 && row < tileMap.length && col >= 0 && col < tileMap[0].length) {
                // If the tile is not empty (value > 0), a collision has occurred
                if (tileMap[row][col] > 0) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Finds tiles of a specific type within the tile map.
 * @param tileMap The 2D array representing the level tile map.
 * @param type The type of tile to search for.
 * @returns An array of indexed tiles matching the specified type.
 */
export const getTilesByType = (tileMap: number[][], type: number): IPoint2D[] => {
    // This function is fine as it returns grid indices, used for object placement.
    return tileMap.flatMap((row, rowIndex) =>
        row.map((tileType, colIndex) => {
            if (tileType === type) {
                return { x: colIndex, y: rowIndex };
            }
            return null;
        }).filter(tile => tile !== null)
    ) as { x: number, y: number }[];
};


export const getTileXY = (tileMap: number[][], row: number, col: number): IPoint2D => {
    const tileWidth = DEFAULT_TILE_WIDTH;
    const tileHeight = DEFULT_TILE_HEIGHT;
    const tileId = tileMap[row][col];
    const tileProperties = getTileProperties(tileId);
    if (!tileProperties) {
        // Fallback for unknown tile types
        return { x: col * tileWidth, y: row * tileHeight };
    }
    // Calculate the y offset to align the tile's bottom with the grid cell's bottom
    const yOffset = tileHeight - tileProperties.height;
    return { x: col * tileWidth, y: row * tileHeight + yOffset };
};


/**
 * Determines which tiles are visible within the viewport.
 * @param props The level properties.
 * @param tile The tile to check.
 * @param viewport The current viewport.
 * @param screenWidth The screen width.
 * @param screenHeight The screen height.
 * @returns True if the tile is visible, false otherwise.
 */
export const determineVisibleTiles = (
    props: ILevelProps,
    tile: IIndexedTile, // This should be the absolute world coordinates
    viewport: { x: number; y: number },
    screenWidth: number,
    screenHeight: number
): boolean => {
    // We can now directly use the provided tile's x and y
    const tileX = tile.x;
    const tileY = tile.y;

    // We still need to get the tile's dimensions from its type
    const tileProperties = getTileProperties(tile.type); // Assuming 'tile' object now has a 'type' property

    if (!tileProperties) {
        return false;
    }

    return isEntityInView(
        {
            getBoundingBox: () => ({
                x: tileX,
                y: tileY,
                width: tileProperties.width,
                height: tileProperties.height,
            }),
        } as unknown as IGameEntity<any>,
        viewport,
        screenWidth,
        screenHeight,
        0
    );
};

/**
 * Gets a tile's properties based on its type.
 * @param tileId The type of the tile.
 * @returns An object with the tile's properties (width, height), or null if not found.
 */
export const getTileProperties = (tileId: keyof typeof TileDefinitions | number): ITileProps | null => {
    if (TileDefinitions.hasOwnProperty(tileId)) {
        return TileDefinitions[tileId as keyof typeof TileDefinitions];
    }
    return null; 
}

/**
 * Calculates the total width and height of the world based on the tile map.
 * @param tileMap The 2D array representing the level tile map.
 * @returns An object with the total width and height.
 */
export const calculateWorldDimensions = (tileMap: number[][]): { width: number; height: number } => {
    let maxWidth = 0;
    let totalHeight = 0;

    // Calculate max width of the widest row
    for (const row of tileMap) {
        let rowWidth = 0;
        for (const tileId of row) {
            const props = getTileProperties(tileId as keyof typeof TileDefinitions);
            if (props) {
                rowWidth += props.width;
            }
        }
        if (rowWidth > maxWidth) {
            maxWidth = rowWidth;
        }
    }

    // Calculate total height
    for (const row of tileMap) {
        let maxHeightInRow = 0;
        for (const tileId of row) {
            const props = getTileProperties(tileId as keyof typeof TileDefinitions);
            if (props && props.height > maxHeightInRow) {
                maxHeightInRow = props.height;
            }
        }
        totalHeight += maxHeightInRow;
    }

    return { width: maxWidth, height: totalHeight };
};

/**
 * Calculates the indexed tile coordinates from a tile map.
 * This function converts a 2D array of tile types into a flat array of objects
 * with their absolute x and y coordinates, taking into account varying tile sizes.
 * @param tileMap The 2D array representing the level tile map.
 * @returns An array of indexed tiles.
 */
export const calculateTileCoordinates = (tileMap: number[][]): IIndexedTile[] => {
    const indexedTiles: IIndexedTile[] = [];
    const tileWidth = 32;
    const tileHeight = 32;

    tileMap.forEach((row, rowIndex) => {
        row.forEach((tileId, colIndex) => {
            const tileProperties = getTileProperties(tileId);
            if (tileProperties) {
                // Calculate the y-coordinate with an offset to align the bottom of the tile
                const yOffset = tileHeight - tileProperties.height;
                indexedTiles.push({
                    x: colIndex * tileWidth,
                    y: rowIndex * tileHeight + yOffset,
                    col: colIndex,
                    row: rowIndex,
                    type: tileId,
                });
            }
        });
    });
    return indexedTiles;
};

/**
 * Finds the tile at a specific world position.
 * @param tileMap The 2D array representing the level tile map.
 * @param worldX The x-coordinate in the game world.
 * @param worldY The y-coordinate in the game world.
 * @returns The indexed tile at the position, or null if no tile is found.
 */
export const getTileAtPosition = (tileMap: number[][], worldX: number, worldY: number): IIndexedTile | null => {
    // Get the properties of the first tile type to determine tile dimensions.
    // This assumes all tiles have the same dimensions as the first tile type.
    const firstTileProps = getTileProperties(tileMap[0][0] as keyof typeof TileDefinitions);
    if (!firstTileProps) {
        return null;
    }
    const tileWidth = firstTileProps.width;
    const tileHeight = firstTileProps.height;

    // Convert world coordinates to tile grid coordinates
    const col = Math.floor(worldX / tileWidth);
    const row = Math.floor(worldY / tileHeight);

    // Check if the calculated tile coordinates are within the bounds of the tile map
    if (row >= 0 && row < tileMap.length && col >= 0 && col < tileMap[0].length) {
        return {
            x: col * tileWidth,
            y: row * tileHeight,
            col,
            row,
            type: tileMap[row][col],
        };
    }
    return null;
}

/**
 * Retrieves tiles from a spatial grid that are near a given bounding box.
 * This function helps to optimize collision checks by only looking at a subset of tiles.
 * @param spatialGrid The spatial grid of tiles.
 * @param bbox The bounding box to check against.
 * @param gridSize The size of each grid cell.
 * @returns An array of tiles near the bounding box.
 */
export function getSurroundingTiles(spatialGrid: Map<string, IIndexedTile[]>, bbox: IBoundingBox, gridSize: number): IIndexedTile[] {
    const surroundingTiles: IIndexedTile[] = [];
    const minGridX = Math.floor(bbox.x / gridSize);
    const maxGridX = Math.floor((bbox.x + bbox.width) / gridSize);
    const minGridY = Math.floor(bbox.y / gridSize);
    const maxGridY = Math.floor((bbox.y + bbox.height) / gridSize);

    for (let y = minGridY; y <= maxGridY; y++) {
        for (let x = minGridX; x <= maxGridX; x++) {
            const key = `${x}_${y}`;
            const tilesInCell = spatialGrid.get(key);
            if (tilesInCell) {
                surroundingTiles.push(...tilesInCell);
            }
        }
    }
    // Filter out duplicates in case a bounding box overlaps with multiple grid cells
    return Array.from(new Set(surroundingTiles));
}


export const tileBoxCollision = (boxA: IBoundingBox, boxB: IBoundingBox): boolean => {
    // Check if the boxes are not overlapping on any axis.
    // If they are not overlapping, then they are not colliding.
    // The opposite of this statement means they are colliding.
    return boxA.x < boxB.x + boxB.width &&
        boxA.x + boxA.width > boxB.x &&
        boxA.y < boxB.y + boxB.height &&
        boxA.y + boxA.height > boxB.y;
}