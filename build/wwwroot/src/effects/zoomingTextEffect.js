"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoomingTextEffect = void 0;
const zoomingTextEffect = (ts, ctx, propertybag, sequence) => {
    const { words, maxWords, font, zoomSteps } = propertybag;
    // Add a new word on each beat
    if (sequence.currentBeat > words.length && words.length < maxWords) {
        const text = "ZOOM!"; // Replace with your desired word or get it from an array
        const x = ctx.canvas.width / 2;
        const y = ctx.canvas.height / 2;
        const size = 20 + Math.random() * 50;
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        const scale = 0; // Initial scale
        words.push({ text, x, y, size, color, scale });
    }
    // Animate and draw each word
    words.forEach((word, index) => {
        ctx.font = `${word.size}px ${font}`;
        ctx.fillStyle = word.color;
        // Calculate scale based on beat and zoomSteps
        const targetScale = 1 + (sequence.currentBeat - index - 1) / zoomSteps;
        word.scale = Math.min(word.scale + 0.1, targetScale);
        ctx.save();
        ctx.translate(word.x, word.y);
        ctx.scale(word.scale, word.scale);
        ctx.fillText(word.text, 0, 0);
        ctx.restore();
    });
};
exports.zoomingTextEffect = zoomingTextEffect;
