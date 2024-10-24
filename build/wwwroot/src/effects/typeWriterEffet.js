"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeWriterEffect = void 0;
const typeWriterEffect = (ts, ctx, propertybag) => {
    ctx.font = "68px Big Shoulders Stencil Text";
    ctx.fillStyle = "white";
    let elapsedTime = 0;
    if (propertybag.useBPM) {
        // Calculate characters per beat
        const charactersPerBeat = propertybag.speed / (propertybag.bpm / 60);
        // Elapsed time in beats
        elapsedTime = (ts - propertybag.lastCharacterTime) / (60000 / propertybag.bpm);
    }
    else {
        // Calculate characters per tick
        const charactersPerTick = propertybag.speed / ((propertybag.bpm * 4) / 60);
        // Elapsed time in ticks
        elapsedTime = (ts - propertybag.lastCharacterTime) / (60000 / (propertybag.bpm * propertybag.ticksPerBeat));
    }
    if (elapsedTime >= 1 / propertybag.speed) {
        propertybag.index++;
        propertybag.lastCharacterTime = ts;
    }
    // Draw the substring
    const displayText = propertybag.text.substring(0, propertybag.index);
    // Measure the full text width
    const fullTextMetrics = ctx.measureText(propertybag.text);
    const fullTextWidth = fullTextMetrics.width;
    // Calculate the centered x-coordinate
    const centeredX = (ctx.canvas.width - fullTextWidth) / 2;
    ctx.fillText(displayText, centeredX, propertybag.y / 2);
};
exports.typeWriterEffect = typeWriterEffect;
