"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCRTJitterPostProcessor = void 0;
/**
 * Creates a post-processing function that simulates CRT TV jump/roll-up distortion.
 * @param jumpChance - The probability of a jump occurring on a frame (0-1).
 * @param maxJumpHeight - The maximum height of the jump in pixels.
 * @param rollupSpeed - The speed of the roll-up effect in pixels per second.
 * @returns A post-processing function.
 */
const createCRTJitterPostProcessor = (jumpChance = 0.05, maxJumpHeight = 10, rollupSpeed = 20) => {
    let jumpOffset = 0;
    let rollupOffset = 0;
    return (ctx, sequence) => {
        const { width, height } = ctx.canvas;
        // Random jump effect
        if (Math.random() < jumpChance) {
            jumpOffset = (Math.random() - 0.5) * maxJumpHeight;
        }
        // Rolling up effect (synced with beat)
        rollupOffset += rollupSpeed / 60 * sequence.currentBeat; // Adjust speed based on beat
        if (rollupOffset > height) {
            rollupOffset = 0;
        }
        // Create a temporary canvas to draw the distorted image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        // Draw the original image onto the temporary canvas with offsets
        tempCtx.drawImage(ctx.canvas, 0, jumpOffset);
        // Draw the rolled-up portion
        const rollupHeight = Math.min(rollupOffset, height);
        if (rollupHeight > 0) {
            tempCtx.drawImage(ctx.canvas, 0, 0, width, rollupHeight, 0, height - rollupHeight, width, rollupHeight);
        }
        // Draw the temporary canvas onto the original canvas
        ctx.drawImage(tempCanvas, 0, 0);
    };
};
exports.createCRTJitterPostProcessor = createCRTJitterPostProcessor;
