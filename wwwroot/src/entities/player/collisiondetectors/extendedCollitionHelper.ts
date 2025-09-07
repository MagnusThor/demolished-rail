import { IBoundingCircle, IBoundingBox } from "../../../interface/IBoundingBox";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { Point2D } from "../../../../../src";
import { IIndexedTile } from "../../../interface/IIndexedTile";
import { getTileProperties } from "../../../utils/tileBlockHelpers";



/**
 * A helper to perform more advanced, pixel-perfect collision checks.
 */
export class ExtendedCollisionHelper {

    
    /**
     * Checks for a pixel-perfect collision between a circle and a tile's texture.
     * @param playerCircle The player's bounding circle.
     * @param tileBox The tile's bounding box.
     * @param tileImageData The pixel data of the tile's texture.
     * @returns An ICollisionResult with the axis and a collision normal vector, or null if no collision.
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
                        // We have a pixel collision!
                        const overlapMagnitude = playerCircle.radius - distance;
                        let collisionAxis: CollisionAxis;
                        let collisionNormal: Point2D;

                        // Determine the primary collision axis and create a proper normal vector.
                        // The previous implementation was creating an erratic normal based on the single pixel,
                        // which caused the bug. This is a much more robust approach.
                        if (Math.abs(dx) > Math.abs(dy)) {
                            collisionAxis = CollisionAxis.X;
                            // Normal is a simple vector pointing left or right.
                            collisionNormal = new Point2D(Math.sign(dx), 0);
                        } else {
                            collisionAxis = CollisionAxis.Y;
                            // Normal is a simple vector pointing up or down.
                            collisionNormal = new Point2D(0, Math.sign(dy));
                        }

                        // The collisionNormal now just provides direction. We multiply it by the overlap
                        // magnitude to provide the full push vector, which matches your existing setup.
                        return {
                            x: tileBox.x,
                            y: tileBox.y,
                            width: tileBox.width,
                            height: tileBox.height,
                            axis: collisionAxis,
                            collisionNormal: new Point2D(collisionNormal.x * overlapMagnitude, collisionNormal.y * overlapMagnitude)
                        };
                    }
                }
            }
        }

        return null;
    }

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
            let axis: CollisionAxis;
            let normal = { x: 0, y: 0 };

            if (overlapX < overlapY) {
                axis = CollisionAxis.X;
                // Determine the direction of the normal based on player position relative to the tile
                normal.x = (x1 + w1 / 2 < x2 + w2 / 2) ? -1 : 1;
            } else {
                axis = CollisionAxis.Y;
                // Determine the direction of the normal based on player position relative to the tile
                normal.y = (y1 + h1 / 2 < y2 + h2 / 2) ? -1 : 1;
            }

            return {
                x: x2, y: y2, width: w2, height: h2, axis: axis, collisionNormal: normal
            };
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
