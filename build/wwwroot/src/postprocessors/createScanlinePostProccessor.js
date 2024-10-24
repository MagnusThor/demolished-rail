"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScanlinePostProcessor = void 0;
/**
 * Creates a post-processing function that simulates a CRT TV scanline effect.
 * @param lineHeight - The height of the scanlines.
 * @param lineColor - The color of the scanlines.
 * @returns A post-processing function that can be added to a Sequence or Entity.
 */
const createScanlinePostProcessor = (lineHeight = 4, lineColor = "rgba(0, 0, 0, 0.5)") => {
    return (ctx) => {
        const { width, height } = ctx.canvas;
        ctx.beginPath();
        for (let y = 0; y < height; y += lineHeight) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.strokeStyle = lineColor;
        ctx.stroke();
    };
};
exports.createScanlinePostProcessor = createScanlinePostProcessor;
