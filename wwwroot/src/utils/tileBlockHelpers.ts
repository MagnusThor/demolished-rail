import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ITileProps";
import { isEntityInView } from "./visibilityHelpers";

/**
 * Helper function to get the coordinates of all tiles of a specific type.
 * @param tileMap The 2D array representing the tile map.
 * @param type The type of tile to filter for.
 * @returns An array of objects with x and y coordinates.
 */
export const getTilesByType = (tileMap: number[][], type: number): IPoint2D[] => {
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
export const getTileXy = (row: number, col: number, width: number = 32, height: number = 32): IPoint2D => {
    return new Point2D(col * width, row * height);
}


export const determineVisibleTiles = (props: ITileProps, tile: IPoint2D,
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