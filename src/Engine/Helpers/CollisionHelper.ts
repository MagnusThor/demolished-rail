export class CollisionHelper {
    /**
     * Checks for circular collision between two objects.
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
     * Checks for rectangular collision between two objects.
     * @param a - The first object with properties x, y, w (width), and h (height).
     * @param b - The second object with properties x, y, w (width), and h (height).
     * @returns True if the objects are colliding, false otherwise.
     */
    static rectangularDetection(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
      return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.h + a.y > b.y
      );
    }
  }