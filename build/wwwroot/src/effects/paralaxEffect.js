"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallaxEntity = void 0;
const entity_1 = require("../../../src/Engine/entity");
const parallaxLayerEffect = (ts, ctx, propertybag) => {
    const { image, x, y, depth, speed } = propertybag;
    // Calculate movement based on time and speed
    const movement = (ts / 1000) * speed * depth;
    // Draw the image with repeating pattern
    const pattern = ctx.createPattern(image, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(x - movement, y, ctx.canvas.width, ctx.canvas.height);
};
class ParallaxEntity extends entity_1.Entity {
    constructor(key, w, h, props) {
        super(key, w, h, props, (ts, ctx, props) => parallaxLayerEffect(ts, ctx, props));
    }
}
exports.ParallaxEntity = ParallaxEntity;
