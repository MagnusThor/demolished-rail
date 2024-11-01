"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageOverlayEffect = exports.ImagePosition = void 0;
var ImagePosition;
(function (ImagePosition) {
    ImagePosition[ImagePosition["FILL"] = 0] = "FILL";
    ImagePosition[ImagePosition["LEFT"] = 1] = "LEFT";
    ImagePosition[ImagePosition["RIGHT"] = 2] = "RIGHT";
    ImagePosition[ImagePosition["TOP"] = 3] = "TOP";
    ImagePosition[ImagePosition["BOTTOM"] = 4] = "BOTTOM";
    ImagePosition[ImagePosition["BOTTOM_LEFT"] = 5] = "BOTTOM_LEFT";
    ImagePosition[ImagePosition["BOTTOM_RIGHT"] = 6] = "BOTTOM_RIGHT";
    ImagePosition[ImagePosition["TOP_LEFT"] = 7] = "TOP_LEFT";
    ImagePosition[ImagePosition["TOP_RIGHT"] = 8] = "TOP_RIGHT";
})(ImagePosition || (exports.ImagePosition = ImagePosition = {}));
const imageOverlayEffect = (ts, ctx, propertybag, sequence) => {
    let { width, height, image, opacity, fadeIn, fadeOut, duration, position } = propertybag;
    let x = 0;
    let y = 0;
    // Calculate x and y coordinates based on the specified position
    switch (position) {
        case ImagePosition.FILL:
            x = 0;
            y = 0;
            width = ctx.canvas.width;
            height = ctx.canvas.height;
            break;
        case ImagePosition.LEFT:
            x = 0;
            y = (ctx.canvas.height - height) / 2;
            break;
        case ImagePosition.RIGHT:
            x = ctx.canvas.width - width;
            y = (ctx.canvas.height - height) / 2;
            break;
        case ImagePosition.TOP:
            x = (ctx.canvas.width - width) / 2;
            y = 0;
            break;
        case ImagePosition.BOTTOM:
            x = (ctx.canvas.width - width) / 2;
            y = ctx.canvas.height - height;
            break;
        case ImagePosition.BOTTOM_LEFT:
            x = 0;
            y = ctx.canvas.height - height;
            break;
        case ImagePosition.BOTTOM_RIGHT:
            x = ctx.canvas.width - width;
            y = ctx.canvas.height - height;
            break;
        case ImagePosition.TOP_LEFT:
            x = 0;
            y = 0;
            break;
        case ImagePosition.TOP_RIGHT:
            x = ctx.canvas.width - width;
            y = 0;
            break;
    }
    // Calculate the remaining time in the scene
    const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
    const elapsed = duration - sceneRemainingTime / 1000;
    // Calculate opacity based on fade-in/fade-out properties
    let alpha = opacity;
    if (fadeIn && elapsed < 1) {
        alpha = opacity * elapsed;
    }
    if (fadeOut && sceneRemainingTime / 1000 < 1) {
        alpha = opacity * (sceneRemainingTime / 1000);
    }
    // Draw the image with the calculated opacity
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, width, height);
    ctx.globalAlpha = 1; // Reset global alpha
};
exports.imageOverlayEffect = imageOverlayEffect;
