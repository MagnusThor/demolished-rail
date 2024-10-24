"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandingCircleEffect = void 0;
const expandingCircleEffect = (ts, ctx, propertybag, sequence) => {
    ctx.fillStyle = "white";
    // Calculate the current radius based on remaining time
    const remainingTime = sequence.getSceneRemainingTime(ts);
    const progress = Math.max(0, 1 - remainingTime / (propertybag.duration * 1000)); // Ensure progress is not negative
    propertybag.radius = propertybag.maxRadius * progress;
    // Draw the circle
    ctx.beginPath();
    ctx.arc(propertybag.x, propertybag.y, propertybag.radius, 0, 2 * Math.PI);
    ctx.fill();
};
exports.expandingCircleEffect = expandingCircleEffect;
