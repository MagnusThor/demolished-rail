"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioVisualizerEffect = void 0;
const audioVisualizerEffect = (ts, ctx, propertybag, sequence) => {
    const { x, y, width, height, barWidth, barSpacing, numBars, color } = propertybag;
    const frequencyData = sequence.fftData; // Access FFT data from the sequence
    if (!frequencyData) {
        return; // No data available
    }
    const barCount = Math.min(numBars, frequencyData.length);
    const barMaxHeight = height;
    ctx.fillStyle = color;
    for (let i = 0; i < barCount; i++) {
        const barHeight = (frequencyData[i] / 255) * barMaxHeight; // Scale bar height
        const barX = x + i * (barWidth + barSpacing);
        const barY = y + height - barHeight;
        ctx.fillRect(barX, barY, barWidth, barHeight);
    }
};
exports.audioVisualizerEffect = audioVisualizerEffect;
