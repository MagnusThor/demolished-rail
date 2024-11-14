/**
 * Base class for texture generation, providing helper methods for vector math, noise functions, and color manipulation.
 */
export class TextureGeneratorBase {
    perm: Array<number>;
    /**
     * Creates a new TextureBase instance.
     * Initializes the permutation table for Perlin noise.
     */
    constructor() {
        this.perm = this.seed(255);
    }
    /**
     * Creates a vector (array) with the given components.
     * @param x - The x component.
     * @param y - The y component.
     * @param z - The z component.
     * @param a - The w component (optional).
     * @returns An array representing the vector.
     */
    vec(x: number, y: number, z: number, a?: number): Array<number> {
        return [x, y, z, a].filter(v => v !== undefined);
    }
    /**
     * Normalizes a vector (array).
     * @param a - The vector to normalize.
     * @returns The normalized vector.
     */
    normalize(a: Array<number>): Array<number> {
        const l = this.length(a);
        return l !== 0 ? this.func(a, (v) => v / l) : a;
    }

    /**
 * Calculates the absolute value of the product of two numbers and multiplies it by a scaling factor (default 255).
 * @param a - The first number.
 * @param b - The second number.
 * @param c - The scaling factor (optional, defaults to 255).
 * @returns The scaled absolute product.
 */
    scaledAbsProduct(a: number, b: number, c?: number): number {
        return Math.abs(a * b) * (c || 255);
    }

    /**
     * Calculates the absolute values of the components of a vector (array).
     * @param a - The vector.
     * @returns A new vector with the absolute values of the components.
     */
    abs(a: Array<number>): Array<number> {
        return a.map(v => Math.abs(v));
    }

    /**
     * Applies a function to each component of a vector (array).
     * @param a - The vector.
     * @param exp - The function to apply.
     * @returns A new vector with the function applied to each component.
     */
    func(a: Array<number>, exp: (v: number) => number): Array<number> {
        return a.map(exp);
    }

    /**
     * Scales a value from one range to another.
     * @param v - The value to scale.
     * @param w - The width of the source range.
     * @returns The scaled value.
     */
    toScale(v: number, w: number): number {
        return (v / w) * 2 - 1;
    }

    /**
     * Calculates the dot product of two vectors (arrays).
     * @param a - The first vector.
     * @param b - The second vector.
     * @returns The dot product.
     */
    dot(a: Array<number>, b: Array<number>): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    /**
     * Calculates the length of a vector (array).
     * @param a - The vector.
     * @returns The length of the vector.
     */
    length(a: Array<number>): number {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    }

    /**
     * Fade function for Perlin noise.
     * @param t - The input value.
     * @returns The faded value.
     */
    fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Clamps a value between a minimum and maximum value.
     * @param n - The value to clamp.
     * @param a - The minimum value.
     * @param b - The maximum value.
     * @returns The clamped value.
     */
    clamp(n: number, a: number, b: number): number {
        return Math.max(a, Math.min(n, b));
    }

    /**
     * Linear interpolation between two values.
     * @param t - The interpolation factor (between 0 and 1).
     * @param a - The first value.
     * @param b - The second value.
     * @returns The interpolated value.
     */
    lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /**
     * Gradient function for Perlin noise.
     * @param hash - The hash value.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @param z - The z coordinate.
     * @returns The gradient value.
     */
    grad(hash: number, x: number, y: number, z: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14) ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);

    }

    /**
     * Scales a value from -1 to 1 to 0 to 1.
     * @param n - The value to scale.
     * @returns The scaled value.
     */
    scale(n: number): number {
        return (1 + n) / 2;
    }

    /**
     * Generates a permutation table for Perlin noise.
     * @param n - The size of the permutation table.
     * @returns The permutation table as an array of numbers.
     */
    seed(n: number): Array<number> {
        const p = [];
        const a = Array.from({ length: n }, (_, i) => i); // Use Array.from for better readability
        for (let b = 0; b < n; b++) {
            const c = Math.floor(n * Math.random());
            [a[b], a[c]] = [a[c], a[b]]; // Use destructuring assignment for swapping
        }
        for (let i = 0; i < n; i++) {
            p[n + i] = p[i] = a[i];
        }
        return p;
    }


    /**
     * Calculates Perlin noise value at the given coordinates.
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @param z - The z coordinate.
     * @returns The Perlin noise value.
     */
    noise(x: number, y: number, z: number): number {
        const p = this.perm;
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const
            A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1]
                + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
        return this.scale(
            this.lerp(w, this.lerp(v, this.lerp(u, this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z)),
                this.lerp(u, this.grad(p[AB],
                    x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z))),
                this.lerp(v, this.lerp(u, this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1)),
                    this.lerp(u, this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1)))));

    }

}

export class TextureGenerator extends TextureGeneratorBase {
    ctx: CanvasRenderingContext2D
    buffer: ImageData;
    helpers: TextureGeneratorBase;
    constructor(public width: number, public height: number) {
        super();
        let c = document.createElement("canvas") as HTMLCanvasElement;
        c.width = width;
        c.height = height;
        this.ctx = c.getContext("2d")!;
        this.ctx.fillStyle = "#0";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.buffer = this.ctx.getImageData(0, 0, this.width, this.height);
        this.helpers = new TextureGeneratorBase();
    }
    static createTexture(width: number, height: number, fn: Function): TextureGenerator {
        let instance = new TextureGenerator(width, height);
        instance.render(fn);
        return instance;//.toBase64();
    }
    private frag = (pixel: Array<number>, x: number, y: number, w: number, h: number, v: Array<number>, fn: Function): Array<number> => {
        let r = pixel[0]; var g = pixel[1]; var b = pixel[2];
        let t = this.helpers;
        var res = fn.apply(
            t,
            [[r, b, g], x, y, w, h, v]);
        return res;
    };
    private render(fn: Function) {
        let buffer = this.buffer;
        let w = this.width, h = this.height;
        let s = this.helpers.toScale;
        for (var idx, x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                idx = (x + y * w) * 4;
                var r = buffer.data[idx + 0];
                var g = buffer.data[idx + 1];
                var b = buffer.data[idx + 2];
                let v = [s(x, w), s(y, w), 0];
                var pixel = this.frag([r, g, b], x, y, w, h, v, fn);
                buffer.data[idx + 0] = pixel[0];
                buffer.data[idx + 1] = pixel[1];
                buffer.data[idx + 2] = pixel[2];
            }
        }
        this.ctx.putImageData(buffer, 0, 0);
    }
    toBase64(): string {
        return this.ctx.canvas.toDataURL("image/png");
    }
    toBlob(cb: any): void {
        this.ctx.canvas.toBlob(cb, "image/png");
    }
}
export class CanvasTextureGen extends TextureGenerator {
    constructor(x: number, y: number, w: number, h: number) {
        super(w, h);
    }
    private D(fn: Function): Array<number> {
        let res = fn.apply(
            this.helpers,
            [this.ctx, 0, 0, this.width, this, this.height]);
        return res;
    }
    static createTexture(width: number, height: number, fn: Function): CanvasTextureGen {
        let instance = new CanvasTextureGen(0, 0, width, height);
        instance.D(fn);
        return instance;//.toBase64();
    }
}