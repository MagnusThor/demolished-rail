import { Point2D } from './Point2D';
import { Point3D } from './Point3D';

/**
 * A helper class for common math operations.
 */
export class MathHelper {

    /**
     * Clamps a value between a minimum and maximum value.
     * @param value - The value to clamp.
     * @param min - The minimum value.
     * @param max - The maximum value.
     * @returns The clamped value.
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * Linearly interpolates between two values.
     * @param t - The interpolation factor (between 0 and 1).
     * @param a - The first value.
     * @param b - The second value.
     * @returns The interpolated value.
     */
    static lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /**
     * Linearly interpolates between two vectors.
     * @param t - The interpolation factor (between 0 and 1).
     * @param a - The first vector.
     * @param b - The second vector.
     * @returns The interpolated vector.
     */
    static lerpVector(t: number, a: Point2D | Point3D, b: Point2D | Point3D): Point2D | Point3D {
        const x = this.lerp(t, a.x, b.x);
        const y = this.lerp(t, a.y, b.y);
        if (a instanceof Point3D && b instanceof Point3D) {
            const z = this.lerp(t, a.z, b.z);
            return new Point3D(x, y, z, a.u, a.v);
        } else {
            return new Point2D(x, y);
        }
    }

    /**
     * Calculates the smoothstep value between two edges.
     * @param edge0 - The lower edge.
     * @param edge1 - The upper edge.
     * @param x - The value to evaluate.
     * @returns The smoothstep value.
     */
    static smoothstep(edge0: number, edge1: number, x: number): number {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    }

    /**
     * Generates a random integer within a specified range.
     * @param min - The minimum value (inclusive).
     * @param max - The maximum value (exclusive).
     * @returns A random integer within the range.
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Maps a value from one range to another.
     * @param value - The value to map.
     * @param inMin - The minimum value of the input range.
     * @param inMax - The maximum value of the input range.
     * @param outMin - The minimum value of the output range.
     * @param outMax - The maximum value of the output range.
     * @returns The mapped value.
     */
    static map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    /**
       * Calculates the sine of an angle in degrees.
       * @param degrees - The angle in degrees.
       * @returns The sine of the angle.
       */
    static sinDeg(degrees: number): number {
        return Math.sin(degrees * Math.PI / 180);
    }

    /**
     * Calculates the cosine of an angle in degrees.
     * @param degrees - The angle in degrees.
     * @returns The cosine of the angle.
     */
    static cosDeg(degrees: number): number {
        return Math.cos(degrees * Math.PI / 180);
    }

    /**
     * Calculates the tangent of an angle in degrees.
     * @param degrees - The angle in degrees.
     * @returns The tangent of the angle.
     */
    static tanDeg(degrees: number): number {
        return Math.tan(degrees * Math.PI / 180);
    }

    /**
     * Calculates the arcsine (inverse sine) of a value.
     * @param value - The value.
     * @returns The arcsine of the value in degrees.
     */
    static asinDeg(value: number): number {
        return Math.asin(value) * 180 / Math.PI;
    }

    /**
     * Calculates the arccosine (inverse cosine) of a value.
     * @param value - The value.
     * @returns The arccosine of the value in degrees.
     */
    static acosDeg(value: number): number {
        return Math.acos(value) * 180 / Math.PI;
    }

    /**
     * Calculates the arctangent (inverse tangent) of a value.
     * @param value - The value.
     * @returns The arctangent of the value in degrees.
     */
    static atanDeg(value: number): number {
        return Math.atan(value) * 180 / Math.PI;
    }

    /**
     * Creates a 4x4 identity matrix.
     * @returns A new 4x4 identity matrix as a Float32Array.
     */
    static identityMatrix4x4(): Float32Array {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    /**
     * Creates a 4x4 translation matrix.
     * @param x - The translation in the x-axis.
     * @param y - The translation in the y-axis.
     * @param z - The translation in   
   the z-axis.
     * @returns A new 4x4 translation matrix as a Float32Array.
     */
    static translationMatrix4x4(x: number, y: number, z: number): Float32Array {
        const matrix = this.identityMatrix4x4();
        matrix[12] = x;
        matrix[13] = y;
        matrix[14] = z;
        return matrix;
    }

    /**
     * Creates a 4x4 rotation matrix around the X-axis.
     * @param angle - The rotation angle in degrees.
     * @returns A new 4x4 rotation matrix as a Float32Array.
     */
    static rotationMatrix4x4X(angle: number): Float32Array {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const matrix = this.identityMatrix4x4();
        matrix[5] = c;
        matrix[6] = -s;
        matrix[9] = s;
        matrix[10] = c;
        return matrix;
    }


    /**
     * Creates a 4x4 rotation matrix around the Y-axis.
     * @param angle - The rotation angle in degrees.
     * @returns A new 4x4 rotation matrix as a Float32Array.
     */
    static rotationMatrix4x4Y(angle: number): Float32Array {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const matrix = this.identityMatrix4x4();
        matrix[0] = c;
        matrix[2] = s;
        matrix[8] = -s;
        matrix[10] = c;
        return matrix;
    }

    /**
     * Creates a 4x4 rotation matrix around the Z-axis.
     * @param angle - The rotation angle in degrees.
     * @returns A new 4x4 rotation matrix as a Float32Array.
     */
    static rotationMatrix4x4Z(angle: number): Float32Array {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const matrix = this.identityMatrix4x4();
        matrix[0] = c;
        matrix[1] = -s;
        matrix[4] = s;
        matrix[5] = c;
        return matrix;
    }



    /**
     * Multiplies two 4x4 matrices.
     * @param a - The first matrix.
     * @param b - The second matrix.
     * @returns A new 4x4 matrix representing the product of a and b.
     */
    static multiplyMatrices4x4(a: Float32Array, b: Float32Array): Float32Array {
        const result = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[i * 4 + k] * b[k * 4 + j];
                }
                result[i * 4 + j] = sum;
            }
        }
        return result;
    }

    /**
    * Creates a quaternion from an axis and an angle.
    * @param axis - The rotation axis as a Point3D.
    * @param angle - The rotation angle in degrees.
    * @returns A new quaternion as a Float32Array.
    */
    static createQuaternion(axis: Point3D, angle: number): Float32Array {
        const rad = angle * Math.PI / 180;
        const s = Math.sin(rad / 2);
        return new Float32Array([
            axis.x * s,
            axis.y * s,
            axis.z * s,
            Math.cos(rad / 2)
        ]);
    }

    /**
     * Multiplies two quaternions.
     * @param q1 - The first quaternion.
     * @param q2 - The second quaternion.
     * @returns A new quaternion representing the product of q1 and q2.
     */
    static multiplyQuaternions(q1: Float32Array, q2: Float32Array): Float32Array {
        const [x1, y1, z1, w1] = q1;
        const [x2, y2, z2, w2] = q2;

        return new Float32Array([
            w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
            w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
            w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2,
            w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
        ]);
    }

    /**
     * Normalizes a quaternion.
     * @param q - The quaternion to normalize.
     * @returns A new normalized quaternion.
     */
    static normalizeQuaternion(q: Float32Array): Float32Array {
        const [x, y, z, w] = q;
        const magnitude = Math.sqrt(x * x + y * y + z * z + w * w);
        return new Float32Array([x / magnitude, y / magnitude, z / magnitude, w / magnitude]);
    }

    /**
     * Calculates the conjugate of a quaternion.
     * @param q - The quaternion.
     * @returns A new quaternion representing the conjugate of q.
     */
    static conjugateQuaternion(q: Float32Array): Float32Array {
        const [x, y, z, w] = q;
        return new Float32Array([-x, -y, -z, w]);
    }

    /**
     * Converts a 4x4 rotation matrix to a quaternion.
     * @param m - The rotation matrix as a Float32Array.
     * @returns A new quaternion as a Float32Array.
     */
    static rotationMatrixToQuaternion(m: Float32Array): Float32Array {
        const tr = m[0] + m[5] + m[10];

        let S, x, y, z, w;

        if (tr > 0) {
            S = Math.sqrt(tr + 1.0) * 2; // S=4*qw 
            w = 0.25 * S;
            x = (m[6] - m[9]) / S;
            y = (m[8] - m[2]) / S;
            z = (m[1] - m[4]) / S;
        } else if ((m[0] > m[5]) && (m[0] > m[10])) {
            S = Math.sqrt(1.0 + m[0] - m[5] - m[10]) * 2; // S=4*qx 
            x = 0.25 * S;
            y = (m[1] + m[4]) / S;
            z = (m[8] + m[2]) / S;
            w = (m[6] - m[9]) / S;
        } else if (m[5] > m[10]) {
            S = Math.sqrt(1.0 + m[5] - m[0] - m[10]) * 2; // S=4*qy
            y = 0.25 * S;
            x = (m[1] + m[4]) / S;
            z = (m[6] + m[9]) / S;
            w = (m[8] - m[2]) / S;
        } else {
            S = Math.sqrt(1.0 + m[10] - m[0] - m[5]) * 2; // S=4*qz
            z = 0.25 * S;
            x = (m[8] + m[2]) / S;
            y = (m[6] + m[9]) / S;
            w = (m[1] - m[4]) / S;
        }

        return new Float32Array([x, y, z, w]);
    }

    /**
     * Creates a quaternion from Euler angles (in degrees).
     * @param x - The rotation angle around the X-axis in degrees.
     * @param y - The rotation angle around the Y-axis in degrees.
     * @param z - The rotation angle around the Z-axis in degrees.
     * @returns A new quaternion as a Float32Array.
     */
    static fromEulerAngles(x: number, y: number, z: number): Float32Array {
        const roll = x * Math.PI / 180;
        const pitch = y * Math.PI / 180;
        const yaw = z * Math.PI / 180;

        const cy = Math.cos(yaw * 0.5);
        const sy = Math.sin(yaw * 0.5);
        const cp = Math.cos(pitch * 0.5);
        const sp = Math.sin(pitch * 0.5);
        const cr = Math.cos(roll * 0.5);
        const sr = Math.sin(roll * 0.5);

        return new Float32Array([
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy,
            cr * cp * cy + sr * sp * sy
        ]);
    }
}
