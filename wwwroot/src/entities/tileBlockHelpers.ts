/**
 * Helper function to get the coordinates of all tiles of a specific type.
 * @param tileMap The 2D array representing the tile map.
 * @param type The type of tile to filter for.
 * @returns An array of objects with x and y coordinates.
 */
export const getTilesByType = (tileMap: number[][], type: number): { x: number, y: number }[] => {
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
export const findClosestSolidTile = (tileMap: number[][], startX: number, startY: number, direction: "up" | "down"): 
{ x: number, y: number } | null  =>{
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


export const  isSolidTile = (tileType: number): boolean => {
    return tileType === 1 || tileType === 2;
}