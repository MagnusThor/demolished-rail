// helpers/CollisionHelper.ts
import { IBoundingBox } from "../../../wwwroot/src/interface/IBoundingBox";
import { CollisionAxis } from "../../../wwwroot/src/enums/CollisionAxis";
import { ICollisionResult } from "../../../wwwroot/src/interface/ICollisionResult";
import { getTileProperties, IIndexedTile } from "../../../wwwroot/src/utils/tileBlockHelpers";

export class CollisionHelper {
    /**
     * Checks for a circular collision between two objects.
     */
    static circularDetection(a: { x: number; y: number; r: number }, b: { x: number; y: number; r: number }): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSquared = dx * dx + dy * dy;
        const radiiSquared = (a.r + b.r) * (a.r + b.r);
        return distanceSquared <= radiiSquared;
    }

    /**
     * Checks for a rectangular collision and returns the axis of the collision.
     * This is a more robust version for player-tile collision.
     */
    static isRectRectColliding(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): ICollisionResult | null {
        // Calculate the overlap on each axis
        const overlapX = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
        const overlapY = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));

        if (overlapX > 0 && overlapY > 0) {
            // Determine the axis of the smallest overlap to resolve collision
            if (overlapX < overlapY) {
                return {
                    x: x2, y: y2, width: w2, height: h2, axis: CollisionAxis.X,
                };
            } else {
                return {
                    x: x2, y: y2, width: w2, height: h2, axis: CollisionAxis.Y,
                };
            }
        }
        return null;
    }

    /**
     * Checks for a rectangular collision between two objects using IBoundingBox objects.
     */
    static AABBColliding(a: IBoundingBox, b: IBoundingBox): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

  
    static isPixelPerfectColliding(
        boundigBox: IBoundingBox,
        tile: IIndexedTile,
        textureData: ImageData
    ): boolean {
        const tileProperties = getTileProperties(tile.type);
        if (!tileProperties) return false;

        // Define points to check on the player's bounding box
        const checkPoints = [
            { x: boundigBox.x, y: boundigBox.y + boundigBox.height }, // Bottom-left
            { x: boundigBox.x + boundigBox.width, y: boundigBox.y + boundigBox.height }, // Bottom-right
        ];

        for (const point of checkPoints) {
            // Calculate the point's position relative to the tile's top-left corner
            const relativeX = point.x - tile.x;
            const relativeY = point.y - tile.y;

            // Ensure the point is within the tile's texture bounds
            if (relativeX >= 0 && relativeX < tileProperties.width && relativeY >= 0 && relativeY < tileProperties.height) {
                // Get the pixel index in the texture data array
                const pixelIndex = (Math.floor(relativeY) * tileProperties.width + Math.floor(relativeX)) * 4;
                const alpha = textureData.data[pixelIndex + 3];

                // If the pixel is not transparent, a collision is found
                if (alpha > 0) {
                    return true;
                }
            }
        }
        return false;
    }
}