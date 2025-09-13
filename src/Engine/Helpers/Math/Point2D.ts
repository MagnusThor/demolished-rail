/**
 * An interface representing a simple 2D point with x and y coordinates.
 * This can be used for any object that just needs to hold coordinate data.
 */
export interface IPoint2D {
    x: number;
    y: number;
}

/**
 * A class representing a 2D point or a 2D vector with methods for common
 * mathematical operations.
 */
export class Point2D implements IPoint2D {
    /**
     * Creates a new Point2D instance.
     * @param x The x-coordinate of the point.
     * @param y The y-coordinate of the point.
     */
    constructor(public x: number, public y: number) {}

    /**
     * Calculates the distance between this point and another point.
     * @param other - The other point.
     * @returns The distance between the two points.
     */
    distanceTo(other: Point2D): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculates the angle between this point (as a vector) and another point.
     * This uses the dot product to find the angle in radians.
     * @param other - The other point.
     * @returns The angle between the two vectors in radians.
     */
    angleTo(other: Point2D): number {
        const dot = this.dot(other);
        const mag1 = this.length();
        const mag2 = other.length();
        return Math.acos(dot / (mag1 * mag2));
    }

    /**
     * Calculates the dot product of this point (as a vector) and another point.
     * @param other - The other point.
     * @returns The dot product.
     */
    dot(other: Point2D): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Calculates the length (or magnitude) of the vector represented by the point.
     * @returns The length of the vector.
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
