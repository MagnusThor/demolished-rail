// helpers/CollisionHelper.ts

import { IBoundingBox } from "../../../wwwroot/src/interface/IBoundingBox";

/**
 * A helper class for performing various collision detection checks.
 */
export class CollisionHelper {
    /**
     * Checks for a circular collision between two objects.
     * @param a - The first object with properties x, y, and r (radius).
     * @param b - The second object with properties x, y, and r (radius).
     * @returns True if the objects are colliding, false otherwise.
     */
    static circularDetection(a: { x: number; y: number; r: number }, b: { x: number; y: number; r: number }): boolean {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distanceSquared = dx * dx + dy * dy;
      const radiiSquared = (a.r + b.r) * (a.r + b.r);
      return distanceSquared <= radiiSquared;
    }

    /**
     * Checks for a rectangular collision between two objects using Axis-Aligned Bounding Boxes (AABB).
     * @param x1 - The x-coordinate of the first rectangle.
     * @param y1 - The y-coordinate of the first rectangle.
     * @param w1 - The width of the first rectangle.
     * @param h1 - The height of the first rectangle.
     * @param x2 - The x-coordinate of the second rectangle.
     * @param y2 - The y-coordinate of the second rectangle.
     * @param w2 - The width of the second rectangle.
     * @param h2 - The height of the second rectangle.
     * @returns True if the rectangles are colliding, false otherwise.
     */
    static isRectRectColliding(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
        // The collision occurs if there is an overlap on both the x and y axes.
        return (
            x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2
        );
    
    }

    /**
     * Checks for a rectangular collision between two objects using IBoundingBox objects.
     * @param a - The first object, an IBoundingBox.
     * @param b - The second object, an IBoundingBox.
     * @returns True if the objects are colliding, false otherwise.
     */
    static AABBColliding(a: IBoundingBox, b: IBoundingBox): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }


}
