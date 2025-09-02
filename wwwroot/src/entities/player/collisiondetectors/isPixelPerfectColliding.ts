import { IBoundingBox, IBoundingCircle } from "../../../interface/IBoundingBox";

export class ExtendedCollitionHelper {
    /**
     * Performs a pixel-perfect collision check between a rectangular player and a tile with an alpha mask.
     * @param playerBox The player's bounding box in world coordinates.
     * @param tileBox The tile's bounding box in world coordinates.
     * @param tileMaskData The ImageData of the tile's collision mask (binary alpha channel).
     * @returns True if a collision is detected, false otherwise.
     */
    public static isPixelPerfectColliding(
        playerBox: IBoundingBox,
        tileBox: IBoundingBox,
        tileMaskData: ImageData
    ): boolean {
        // Calculate the overlapping area in world coordinates
        const overlapX = Math.max(playerBox.x, tileBox.x);
        const overlapY = Math.max(playerBox.y, tileBox.y);
        const overlapWidth = Math.min(playerBox.x + playerBox.width, tileBox.x + tileBox.width) - overlapX;
        const overlapHeight = Math.min(playerBox.y + playerBox.height, tileBox.y + tileBox.height) - overlapY;

        // If there's no overlap, return early.
        if (overlapWidth <= 0 || overlapHeight <= 0) {
            return false;
        }

        // Loop through the overlapping area pixel by pixel
        for (let y = 0; y < overlapHeight; y++) {
            for (let x = 0; x < overlapWidth; x++) {
                // Calculate the position in world coordinates for the current pixel
                const pixelWorldX = overlapX + x;
                const pixelWorldY = overlapY + y;

                // Calculate the position of the current pixel in the tile's mask's local coordinates.
                const maskLocalX = pixelWorldX - tileBox.x;
                const maskLocalY = pixelWorldY - tileBox.y;

                // Get the index of the pixel's alpha value in the mask data array.
                // The index is (y * width + x) * 4 for RGBA data.
                const maskIndex = (maskLocalY * tileMaskData.width + maskLocalX) * 4 + 3; // +3 for the alpha channel

                // Check if the pixel in the tile mask is opaque (alpha > 0)
                if (tileMaskData.data[maskIndex] > 0) {
                    // Collision detected!
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Performs a pixel-perfect collision check between a circular player and a tile with an alpha mask.
     * @param playerCircle The player's bounding circle.
     * @param tileBox The tile's bounding box in world coordinates.
     * @param tileMaskData The ImageData of the tile's collision mask (binary alpha channel).
     * @returns True if a collision is detected, false otherwise.
     */
    public static isCirclePixelColliding(
        playerCircle: IBoundingCircle,
        tileBox: IBoundingBox,
        tileMaskData: ImageData
    ): boolean {
        // Iterate through all pixels in the tile's mask
        for (let y = 0; y < tileMaskData.height; y++) {
            for (let x = 0; x < tileMaskData.width; x++) {
                // Get the index of the pixel's alpha value in the mask data array.
                const maskIndex = (y * tileMaskData.width + x) * 4 + 3;

                // Check if the pixel is solid.
                if (tileMaskData.data[maskIndex] > 0) {
                    // Calculate the world coordinates of the current pixel.
                    const pixelWorldX = tileBox.x + x;
                    const pixelWorldY = tileBox.y + y;

                    // Calculate the distance between the pixel and the center of the player circle.
                    const dx = pixelWorldX - playerCircle.x;
                    const dy = pixelWorldY - playerCircle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If the distance is less than the player's radius, a collision has occurred.
                    if (distance <= playerCircle.radius) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
