export class Point2D {
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
     * Calculates the length of the vector represented by the point.
     * @returns The length of the vector.
     */
    length(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  }
  
