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

    /**
     * Checks if a rectangle collides with a line segment.
     * This is useful for thin objects like ropes or laser beams.
     * * @param rect The bounding box of the rectangle (e.g., the player).
     * @param p1 The start point of the line segment (e.g., the rope's pivot).
     * @param p2 The end point of the line segment (e.g., the rope's current end).
     * @returns A collision result or null if no collision is detected.
     */
    static isRectLineColliding(rect: IBoundingBox, p1: Point2D, p2: Point2D): ICollisionResult | null {
        // Line-rect intersection algorithm
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;

        const p = [ -dx, dx, -dy, dy ];
        const q = [ p1.x - rect.x, rect.x + rect.width - p1.x, p1.y - rect.y, rect.y + rect.height - p1.y ];
        
        let u1 = 0.0;
        let u2 = 1.0;

        for (let i = 0; i < 4; i++) {
            if (p[i] === 0) {
                if (q[i] < 0) return null; // Parallel and outside
            } else {
                let u = q[i] / p[i];
                if (p[i] < 0) {
                    u1 = Math.max(u1, u);
                } else {
                    u2 = Math.min(u2, u);
                }
            }
        }
        
        if (u1 > u2) return null; // No collision

        // Collision detected. Return a simplified collision result for now.
        // The precise collision normal and point are more complex for this type of check,
        // but for a simple "latch on" effect, this is sufficient.
        return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            axis: CollisionAxis.NONE, // No specific axis
            collisionNormal: new Point2D(0, 0), // Default to a zero vector for simplicity
            overlapMagnitude: 0
        };
    }

       /**
     * Checks for a collision between a rectangle and a single point.
     * @param rect The rectangle bounding box.
     * @param point The point to check.
     * @returns A collision result if a collision occurs, otherwise null.
     */
    static isRectPointColliding(rect: IBoundingBox, point: Point2D): ICollisionResult | null {
        if (point.x >= rect.x && point.x <= rect.x + rect.width &&
            point.y >= rect.y && point.y <= rect.y + rect.height) {
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                axis: CollisionAxis.NONE,
                collisionNormal: new Point2D(0, 0),
                overlapMagnitude: 0
            };
        }
        return null;
    }
    
    /**
     * Checks for a collision between a rectangle and a quadratic Bézier curve.
     * This is done by sampling points along the curve and checking each for a collision.
     * @param rect The rectangle bounding box.
     * @param p1 The start point of the curve.
     * @param p2 The control point of the curve.
     * @param p3 The end point of the curve.
     * @param segments The number of points to sample along the curve.
     * @returns A collision result if a collision occurs, otherwise null.
     */
    static isRectCurveColliding(rect: IBoundingBox, p1: Point2D, p2: Point2D, p3: Point2D, segments: number = 20): ICollisionResult | null {
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Calculate a point on the curve using the Bézier formula
            const pointX = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * p2.x + t * t * p3.x;
            const pointY = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * p2.y + t * t * p3.y;

            const point = new Point2D(pointX, pointY);

            // Check if the current point on the curve collides with the rectangle
            if (this.isRectPointColliding(rect, point)) {
                return {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    axis: CollisionAxis.NONE,
                    collisionNormal: new Point2D(0, 0),
                    overlapMagnitude: 0
                };
            }
        }
        return null;
    }
}
