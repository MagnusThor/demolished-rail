"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditsScrollerEffect = void 0;
const creditsScrollerEffect = (ts, ctx, propertybag, sequence) => {
    const { lines, lineHeight, scrollSpeed, fadeInDuration, fadeOutDuration } = propertybag;
    const { width, height } = ctx.canvas;
    ctx.font = propertybag.font; // Set your desired font
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    // Calculate the total duration of the animation
    const totalDuration = sequence.durationMs / 1000;
    // Update and draw each line
    lines.forEach((line, index) => {
        const sceneStartTime = sequence.currentScene.startTimeinMs / 1000; // Get the scene's start time in seconds
        const elapsed = ts / 1000 - sceneStartTime - (index * lineHeight) / scrollSpeed;
        // Fade in and fade out logic
        if (elapsed < fadeInDuration) {
            line.alpha = Math.min(1, elapsed / fadeInDuration);
        }
        else if (elapsed > totalDuration - fadeOutDuration) {
            line.alpha = Math.max(0, (totalDuration - elapsed) / fadeOutDuration);
        }
        else {
            line.alpha = 1;
        }
        // Update the y position to scroll upwards
        line.y = height - elapsed * scrollSpeed;
        // Draw the text
        ctx.globalAlpha = line.alpha;
        ctx.fillText(line.text, width / 2, line.y);
    });
};
exports.creditsScrollerEffect = creditsScrollerEffect;
