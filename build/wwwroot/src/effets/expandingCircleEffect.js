"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandingCircleEffect = void 0;
const expandingCircleEffect = (ts, ctx, propertybag, sequence) => {
    ctx.fillStyle = "white";
    propertybag.radius =
        propertybag.maxRadius *
            (1 - sequence.getSceneRemainingTime(ts) / (propertybag.duration * 1000));
    // Draw the circle
    ctx.beginPath();
    ctx.arc(propertybag.x, propertybag.y, propertybag.radius, 0, 2 * Math.PI);
    ctx.fill();
};
exports.expandingCircleEffect = expandingCircleEffect;
