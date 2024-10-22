"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSquareEffect = void 0;
const randomSquareEffect = (ts, ctx, propertybag, tick) => {
    if (tick !== propertybag.lastTick) {
        propertybag.lastTick = tick;
        ctx.globalAlpha = 0.5;
        // Generate random properties for the square
        propertybag.x = Math.random() * ctx.canvas.width;
        propertybag.y = Math.random() * ctx.canvas.height;
        propertybag.size = 20 + Math.random() * 50; // Random size between 20 and 70
        propertybag.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
    }
    // Draw the square
    ctx.fillStyle = propertybag.color;
    ctx.fillRect(propertybag.x, propertybag.y, propertybag.size, propertybag.size);
};
exports.randomSquareEffect = randomSquareEffect;
