"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kineticTypographyEffect = void 0;
const kineticTypographyEffect = (ts, ctx, propertybag, sequence) => {
    const { words, maxWords, font } = propertybag;
    // Add a new word on each beat
    if (sequence.currentBeat > words.length && words.length < maxWords) {
        const text = "Kinetic"; // Replace with your desired word or get it from an array
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        const size = 20 + Math.random() * 50;
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        const rotation = Math.random() * 360 * (Math.PI / 180);
        words.push({ text, x, y, size, color, rotation });
    }
    // Animate and draw each word
    words.forEach((word) => {
        ctx.font = `${word.size}px ${font}`;
        ctx.fillStyle = word.color;
        ctx.save(); // Save the canvas state
        ctx.translate(word.x, word.y); // Move to the word's position
        ctx.rotate(word.rotation); // Apply rotation
        ctx.fillText(word.text, 0, 0); // Draw the word
        ctx.restore(); // Restore the canvas state
        // Update word properties (example: move upwards)
        word.y -= 2;
        word.rotation += 0.05; // Example rotation animation
    });
};
exports.kineticTypographyEffect = kineticTypographyEffect;
