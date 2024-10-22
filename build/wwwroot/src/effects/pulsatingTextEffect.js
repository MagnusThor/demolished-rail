"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pulsatingTextEffect = void 0;
const pulsatingTextEffect = (ts, ctx, propertybag, sequence) => {
    const { x, y, text, font, size, duration, pulseBy } = propertybag;
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";
    const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
    const elapsed = duration - sceneRemainingTime / 1000;
    let alpha = 1;
    if (elapsed < 1) {
        alpha = elapsed;
    }
    if (sceneRemainingTime / 1000 < 1) {
        alpha = sceneRemainingTime / 1000;
    }
    // Pulsating effect
    let pulseFactor = 1;
    if (pulseBy === "tick") {
        pulseFactor = 0.8 + 0.2 * Math.sin((2 * Math.PI * sequence.currentTick) / sequence.ticksPerBeat);
    }
    else if (pulseBy === "bar") {
        pulseFactor = 0.8 + 0.2 * Math.sin((2 * Math.PI * sequence.currentBeat) / sequence.beatsPerBar);
    }
    ctx.globalAlpha = alpha * pulseFactor;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
};
exports.pulsatingTextEffect = pulsatingTextEffect;
