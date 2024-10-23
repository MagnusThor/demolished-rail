import { Entity } from "../../../src/Engine/entity";


export interface IParallaxLayerProps {
    image: HTMLImageElement;
    x: number;
    y: number;
    depth: number; // Depth value (higher = further away)
    speed: number; // Movement speed
}

const parallaxLayerEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IParallaxLayerProps
) => {
    const { image, x, y, depth, speed } = propertybag;

    // Calculate movement based on time and speed
    const movement = (ts / 1000) * speed * depth;

    // Draw the image with repeating pattern
    const pattern = ctx.createPattern(image, "repeat")!;
    ctx.fillStyle = pattern;
    ctx.fillRect(x - movement, y, ctx.canvas.width, ctx.canvas.height);
};

export class ParallaxEntity extends Entity<IParallaxLayerProps> {
    constructor(
        key: string,
        w: number,
        h: number,
        props: IParallaxLayerProps
    ) {
        super(key, w, h, props, (ts, ctx, props) => parallaxLayerEffect(ts, ctx, props));
    }
}


