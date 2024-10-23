"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvertPostProcessor = exports.createGrayscalePostProcessor = exports.createBlurPostProcessor = void 0;
const createBlurPostProcessor = (blurAmount = 5) => {
    return (ctx) => {
        ctx.filter = `blur(${blurAmount}px)`; // Apply blur filter
        ctx.drawImage(ctx.canvas, 0, 0); // Redraw the canvas with the filter
        ctx.filter = "none"; // Reset the filter
    };
};
exports.createBlurPostProcessor = createBlurPostProcessor;
const createGrayscalePostProcessor = () => {
    return (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // Red
            data[i + 1] = avg; // Green
            data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
    };
};
exports.createGrayscalePostProcessor = createGrayscalePostProcessor;
const createInvertPostProcessor = () => {
    return (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]; // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
    };
};
exports.createInvertPostProcessor = createInvertPostProcessor;
