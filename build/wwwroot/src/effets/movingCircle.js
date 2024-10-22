"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movingCircleEffet = void 0;
const movingCircleEffet = (ts, ctx, propertybag) => {
    propertybag.x += propertybag.xSpeed;
    propertybag.y += propertybag.ySpeed;
    ctx.strokeStyle = "red";
    // Bounce off the edges of the canvas
    if (propertybag.x + 40 > ctx.canvas.width || propertybag.x - 40 < 0) {
        propertybag.xSpeed = -propertybag.xSpeed;
    }
    if (propertybag.y + 40 > ctx.canvas.height || propertybag.y - 40 < 0) {
        propertybag.ySpeed = -propertybag.ySpeed;
    }
    ctx.beginPath();
    ctx.arc(propertybag.x, propertybag.y, 40, 0, 2 * Math.PI);
    ctx.stroke();
};
exports.movingCircleEffet = movingCircleEffet;
