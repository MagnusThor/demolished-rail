"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageOverlayEffect = void 0;
const imageOverlayEffect = (ts, ctx, propertybag) => {
    const { x, y, width, height, image, opacity, fadeIn, fadeOut, duration } = propertybag;
    ctx.drawImage(image, x, y, width, height);
    ctx.globalAlpha = 1;
};
exports.imageOverlayEffect = imageOverlayEffect;
