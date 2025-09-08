import { IBoundingBox, IBoundingCircle } from "../../../interface/IBoundingBox";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { CollisionAxis } from "../../../enums/CollisionAxis";

// A basic 2D point/vector class required for the pixel collision logic.
class Point2D {
    constructor(public x: number, public y: number) { }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

export class ExtendedCollisionHelper {
    /**
     * Checks for a collision between two rectangles and returns detailed collision data.
     */
    static isRectRectColliding(
        rect1X: number,
        rect1Y: number,
        rect1W: number,
        rect1H: number,
        rect2X: number,
        rect2Y: number,
        rect2W: number,
        rect2H: number
    ): ICollisionResult | null {
        // Check for intersection
        const isColliding =
            rect1X < rect2X + rect2W &&
            rect1X + rect1W > rect2X &&
            rect1Y < rect2Y + rect2H &&
            rect1Y + rect1H > rect2Y;

        if (!isColliding) {
            return null;
        }

        // Calculate overlap on both axes
        const overlapX = Math.min(rect1X + rect1W, rect2X + rect2W) - Math.max(rect1X, rect2X);
        const overlapY = Math.min(rect1Y + rect1H, rect2Y + rect2H) - Math.max(rect1Y, rect2Y);

        // Determine the axis of least penetration
        const collisionAxis = overlapX < overlapY ? CollisionAxis.X : CollisionAxis.Y;
        const overlapMagnitude = Math.min(overlapX, overlapY);

        // Determine the direction of the normal based on positions
        let normalX = 0;
        let normalY = 0;

        if (collisionAxis === CollisionAxis.X) {
            normalX = rect1X + rect1W / 2 < rect2X + rect2W / 2 ? -1 : 1;
        } else {
            normalY = rect1Y + rect1H / 2 < rect2Y + rect2H / 2 ? -1 : 1;
        }

        return {
            x: rect2X,
            y: rect2Y,
            width: rect2W,
            height: rect2H,
            axis: collisionAxis,
            collisionNormal: new Point2D(normalX, normalY),
            overlapMagnitude: overlapMagnitude,
        };
    }

    /**
     * Performs a pixel-perfect collision check between a circle and a tile's image data.
     * This is an expensive operation and should be used as a final check after a broad-phase collision.
     *
     * @param playerCircle The player's bounding circle.
     * @param tileBox The bounding box of the tile.
     * @param tileImageData The raw ImageData of the tile.
     * @returns A detailed collision result or null if no collision is detected.
     */
    static isCirclePixelColliding(
        playerCircle: IBoundingCircle,
        tileBox: IBoundingBox,
        tileImageData: ImageData
    ): ICollisionResult | null {
        const tileWidth = tileBox.width;
        const tileHeight = tileBox.height;

        // Iterate over a rectangular area that is the intersection of the circle's bounding box and the tile.
        const startX = Math.max(0, Math.floor(playerCircle.x - playerCircle.radius - tileBox.x));
        const endX = Math.min(tileWidth, Math.ceil(playerCircle.x + playerCircle.radius - tileBox.x));
        const startY = Math.max(0, Math.floor(playerCircle.y - playerCircle.radius - tileBox.y));
        const endY = Math.min(tileHeight, Math.ceil(playerCircle.y + playerCircle.radius - tileBox.y));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Get the pixel's world coordinates
                const worldX = tileBox.x + x;
                const worldY = tileBox.y + y;

                // Check if the pixel is inside the player's circle
                const dx = worldX - playerCircle.x;
                const dy = worldY - playerCircle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= playerCircle.radius) {
                    // Check if the tile's pixel is solid (alpha > 0)
                    const pixelIndex = (y * tileWidth + x) * 4 + 3; // +3 for the alpha channel
                    if (tileImageData.data[pixelIndex] > 0) {
                        // We have a pixel collision! Now we calculate the true collision normal.
                        const overlapMagnitude = playerCircle.radius - distance;

                        // The collision normal is the vector from the solid pixel to the circle's center.
                        // We normalize it to get a unit vector for the direction.
                        const collisionNormal = new Point2D(dx, dy);
                        const normalLength = collisionNormal.length();
                        const normalizedNormal = normalLength > 0 ?
                            new Point2D(collisionNormal.x / normalLength, collisionNormal.y / normalLength) :
                            new Point2D(0, 0); // Handle the zero-length case

                        // Determine the primary collision axis based on the normalized normal vector.
                        const collisionAxis = Math.abs(normalizedNormal.x) > Math.abs(normalizedNormal.y) ?
                            CollisionAxis.X : CollisionAxis.Y;

                        return {
                            // Return the tile's coordinates and dimensions
                            x: tileBox.x,
                            y: tileBox.y,
                            width: tileBox.width,
                            height: tileBox.height,
                            // Return the calculated collision data
                            axis: collisionAxis,
                            collisionNormal: normalizedNormal,
                            overlapMagnitude: overlapMagnitude
                        };
                    }
                }
            }
        }
        return null;
    }
}
