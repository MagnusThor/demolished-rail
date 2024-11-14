import { Point2D } from './Point2D';

export class Point3D extends Point2D {
    constructor(x: number, y: number, public z: number, public u: number, public v: number) {
        super(x, y); // Call the superclass constructor
    }

    /**
* Rotates the point around the X-axis by the given angle.
* @param angle - The angle in degrees.
* @returns A new Point3D representing the rotated point.
*/
    rotateX(angle: number): Point3D {
        const rad = angle * Math.PI / 180;
        const cosa = Math.cos(rad);
        const sina = Math.sin(rad);
        const y = this.y * cosa - this.z * sina;
        const z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y,
            z, this.u, this.v);
    }

    /**
     * Rotates the point around the Y-axis by the given angle.
     * @param angle - The angle in degrees.
     * @returns A new Point3D representing the rotated point.
     */
    rotateY(angle: number): Point3D {
        const rad = angle * Math.PI / 180;
        const cosa = Math.cos(rad);
        const sina = Math.sin(rad);
        const z = this.z * cosa - this.x * sina;
        const x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y,
            z, this.u, this.v);
    }

    /**
     * Rotates the point around the Z-axis by the given angle.
     * @param angle - The angle in degrees.
     * @returns A new Point3D representing the rotated point.
     */
    rotateZ(angle: number): Point3D {
        const rad = angle * Math.PI / 180;
        const cosa = Math.cos(rad);
        const sina = Math.sin(rad);
        const x = this.x * cosa - this.y * sina;
        const y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z,
            this.u, this.v);
    }

    /**
     * Calculates the length of the vector represented by the point.
     * @returns The length of the vector.
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Scales the point's coordinates by the given scale factor.
     * @param scale - The scale factor.
     */
    scale(scale: number): void {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    }

    /**
     * Normalizes the point, making it a unit vector with length 1.
     * @returns True if the normalization was successful, false otherwise (if the length is 0).
     */
    normalize(): boolean {
        const length = this.length();
        if (length !== 0) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Calculates the angle between this point (as a vector) and another point.
     * @param bvector - The other point.
     * @returns The angle between the two vectors in radians.
     */
    angle(bvector: Point3D): number {
        const anorm = new Point3D(this.x, this.y, this.z, this.u, this.v);
        anorm.normalize();
        const bnorm = new Point3D(bvector.x, bvector.y, bvector.z, this.u, this.v);
        bnorm.normalize();
        const dotval = anorm.dot(bnorm);
        return Math.acos(dotval);
    }

    /**
     * Calculates the cross product of this point (as a vector) and another point.
     * @param vectorB - The other point.
     */
    cross(vectorB: Point3D): void {
        const tempvec = new Point3D(this.x, this.y, this.z, this.u, this.v);
        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
        tempvec.z = (this.x * vectorB.y) - (this.y
            * vectorB.x);
        this.x = tempvec.x;
        this.y = tempvec.y;
        this.z = tempvec.z;

    }

    /**
     * Calculates the dot product of this point (as a vector) and another point.
     * @param vectorB - The other point.
     * @returns The dot product.
     */
    dot(vectorB: Point3D): number {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    }

    /**
     * Projects the point onto a 2D plane given the view parameters.
     * @param viewWidth - The width of the view.
     * @param viewHeight - The height of the view.
     * @param fov - The field of view.
     * @param viewDistance - The view distance.
     * @returns A new Point3D representing the projected point.
     */
    project(viewWidth: number, viewHeight: number, fov: number, viewDistance: number): Point3D {
        const factor = fov / (viewDistance + this.z);
        const x = this.x * factor + viewWidth / 2;
        const y = this.y * factor + viewHeight / 2;
        return new Point3D(x, y, this.z,
            this.u, this.v);
    }
}