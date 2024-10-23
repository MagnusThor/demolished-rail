"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strobeEffect = void 0;
const strobeEffect = (ts, ctx, propertybag, sequence) => {
    const { color, isOn, lastBeat } = propertybag;
    if (sequence.currentBeat !== lastBeat) {
        propertybag.isOn = !isOn; // Toggle the strobe on/off on each beat
        propertybag.lastBeat = sequence.currentBeat;
    }
    if (isOn) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Fill the canvas
    }
};
exports.strobeEffect = strobeEffect;
