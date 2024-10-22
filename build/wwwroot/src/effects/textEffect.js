"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textEffect = void 0;
const textEffect = (ts, ctx, propertybag, sequence // Pass the Sequence instance
) => {
    const { x, y, text, font, size, duration } = propertybag;
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";
    const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
    const elapsed = duration - sceneRemainingTime / 1000; // Time elapsed in seconds
    let alpha = 1;
    if (elapsed < 1) {
        alpha = elapsed; // Fade in over 1 second
    }
    if (sceneRemainingTime / 1000 < 1) {
        alpha = sceneRemainingTime / 1000; // Fade out over 1 second
    }
    ctx.globalAlpha = alpha;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
};
exports.textEffect = textEffect;
