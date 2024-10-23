"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBeatShakePostProcessor = void 0;
const createBeatShakePostProcessor = (intensity = 10) => {
    return (ctx, sequence) => {
        const offsetX = (Math.random() - 0.5) * intensity * sequence.currentBeat;
        const offsetY = (Math.random() - 0.5) * intensity * sequence.currentBeat;
        ctx.drawImage(ctx.canvas, offsetX, offsetY);
    };
};
exports.createBeatShakePostProcessor = createBeatShakePostProcessor;
