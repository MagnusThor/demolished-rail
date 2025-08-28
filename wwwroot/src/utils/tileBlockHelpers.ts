import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IGameEntity } from "../interface/IGameEntity";
import { ILevelProps, ITileProps } from "../interface/ILevelProps";
import { TILE_TYPES } from "../LEVEL_SAMPLE";
import { isEntityInView } from "./visibilityHelpers";

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

/**
 * Helper function to find the closest solid tile in a specific direction.
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
 * Determines whether a given tile type is considered solid.
 *
 * @param tileType - The numeric identifier of the tile type to check.
 * @returns `true` if the tile type is solid (i.e., type 1 or 2), otherwise `false`.
 */
export const isSolidTile = (tileType: number): boolean => {
    return tileType === 1 || tileType === 2;
}

/**
 * Determines whether a rectangle collides with any non-empty tiles in a tile map.
 *
 * @param x - The x-coordinate (in pixels) of the top-left corner of the rectangle.
 * @param y - The y-coordinate (in pixels) of the top-left corner of the rectangle.
 * @param width - The width (in pixels) of the rectangle.
 * @param height - The height (in pixels) of the rectangle.
 * @param tileMap - A 2D array representing the tile map, where each value corresponds to a tile type (values > 0 are considered solid).
 * @param tileWidth - The width (in pixels) of a single tile.
 * @param tileHeight - The height (in pixels) of a single tile.
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
 * Calculates the pixel coordinates (x, y) of a tile based on its row and column indices.
 *
 * @param row - The row index of the tile (zero-based).
 * @param col - The column index of the tile (zero-based).
 * @param width - The width of a single tile in pixels. Defaults to 32.
 * @param height - The height of a single tile in pixels. Defaults to 32.
 * @returns An `IPoint2D` representing the pixel coordinates of the top-left corner of the tile.
 */
export const getTileXy = (tileMap: number[][], row: number, col: number): IPoint2D => {
    let x = 0;
    let y = 0;

    // Calculate the Y coordinate by summing the heights of all rows above the current one.
    // The height of each row is determined by the maximum height of any tile in that row.
    for (let i = 0; i < row; i++) {
        let maxRowHeight = 0;
        const currentRow = tileMap[i];
        if (currentRow) {
            for (const tileId of currentRow) {
                const props = TILE_TYPES[tileId as keyof typeof TILE_TYPES];
                if (props && props.height > maxRowHeight) {
                    maxRowHeight = props.height;
                }
            }
        }
        y += maxRowHeight;
    }

    // Calculate the X coordinate by summing the widths of all tiles to the left in the current row.
    const currentRow = tileMap[row];
    if (currentRow) {
        for (let j = 0; j < col; j++) {
            const tileId = currentRow[j];
            const props = TILE_TYPES[tileId as keyof typeof TILE_TYPES];
            if (props) {
                x += props.width;
            }
        }
    }

    return { x, y };
};

/*
export const determineVisibleTiles = (props: ILevelProps, tile: IPoint2D,
    viewport: { x: number; y: number },
    screenWidth: number,
    screenHeight: number
): boolean => {
    const tileX = tile.x * props.tileWidth;
    const tileY = tile.y * props.tileHeight;
    return isEntityInView(
        {
            getBoundingBox: () => ({
                x: tileX,
                y: tileY,
                width: props.tileWidth,
                height: props.tileHeight
            })
        } as unknown as IGameEntity<any>,
        viewport,
        screenWidth,
        screenHeight,
        0 // No additional buffer needed here
    );
};

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



export const getTileProperties = (tileId: keyof typeof TILE_TYPES | number):ITileProps |  null=> {
    if (TILE_TYPES.hasOwnProperty(tileId)) {
        return TILE_TYPES[tileId as keyof typeof TILE_TYPES];
    }
 
    return null; 
}




export const calculateWorldDimensions = (tileMap: number[][]): { width: number; height: number } => {
    let maxWidth = 0;
    let totalHeight = 0;

    // Calculate max width of the widest row
    for (const row of tileMap) {
        let rowWidth = 0;
        for (const tileId of row) {
            const props = getTileProperties(tileId as keyof typeof TILE_TYPES);
            if (props) {
                rowWidth += props.width;
            }
        }
        if (rowWidth > maxWidth) {
            maxWidth = rowWidth;
        }
    }

    // Calculate total height
    // This assumes each row has the same height based on its tallest tile.
    // A more complex approach might be needed for different heights per column.
    // Here we'll just sum the maximum height of any tile in each row.
    for (const row of tileMap) {
        let maxHeightInRow = 0;
        for (const tileId of row) {
            const props = getTileProperties(tileId as keyof typeof TILE_TYPES);
            if (props && props.height > maxHeightInRow) {
                maxHeightInRow = props.height;
            }
        }
        totalHeight += maxHeightInRow;
    }

    return { width: maxWidth, height: totalHeight };
};


export interface IIndexedTile extends IPoint2D {
    col: number; // Grid column index
    row: number; // Grid row index
    type: number; // Tile type ID
}


export const calculateTileCoordinates = (tileMap: number[][]): IIndexedTile[] => {
    const indexedTiles: IIndexedTile[] = [];
    let currentY = 0;

    tileMap.forEach((row, rowIndex) => {
        let currentX = 0;
        let maxRowHeight = 0;

        row.forEach((tileId, colIndex) => {
            const tileProperties = getTileProperties(tileId);

            if (tileProperties) {
                if (tileProperties.height > maxRowHeight) {
                    maxRowHeight = tileProperties.height;
                }

                indexedTiles.push({
                    x: currentX,
                    y: currentY,
                    col: colIndex,
                    row: rowIndex,
                    type: tileId,
                });

                currentX += tileProperties.width;
            }
        });
        currentY += maxRowHeight;
    });

    return indexedTiles;
};

