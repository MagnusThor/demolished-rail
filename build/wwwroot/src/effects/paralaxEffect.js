"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallaxLayerEffect = void 0;
const parallaxLayerEffect = (ts, ctx, propertybag) => {
    const { image, x, y, depth, speed } = propertybag;
    // Calculate movement based on time and speed
    const movement = (ts / 1000) * speed * depth;
    // Draw the image with repeating pattern
    const pattern = ctx.createPattern(image, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(x - movement, y, ctx.canvas.width + Math.abs(movement), ctx.canvas.height);
};
exports.parallaxLayerEffect = parallaxLayerEffect;
