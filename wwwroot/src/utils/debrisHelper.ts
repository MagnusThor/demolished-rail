/**
 * debrisHelper.ts
 *
 * This module contains the DebrisHelper class and its inner DebrisParticle class.
 * It has been updated to correctly apply physics for a more realistic
 * "explosion" effect, ensuring particles move up and out before falling.
 */

import { DebrisParticle } from "../entities/particles/DebrisParticle";

import { PhysicsHelper } from "./physicsHelper";

/**
 * A helper class for procedurally generating debris sprites from a source image.
 * This class uses the HTML Canvas API to perform all operations locally,
 * without any network requests.
 */
export class DebrisHelper {
    static GRAVITY = 0.5;
    static DAMPING = 0.8;

    static physics = new PhysicsHelper();

    /**
     * Generates debris particles with an initial upward and outward velocity.
     * @param sourceImage The image to generate debris from.
     * @param count The number of particles to generate.
     * @param centerX The x-coordinate of the explosion center.
     * @param centerY The y-coordinate of the explosion center.
     * @param spreadWidth The desired total horizontal spread of the debris (e.g., enemy.width * 4).
     * @param scale The uniform scale factor for the debris particles.
     */
    static generateDebris(sourceImage: HTMLImageElement, count: number, centerX: number, centerY: number, spreadWidth: number,
        scale: number) {
        const particles = [];
        const sourceWidth = sourceImage.width;
        const sourceHeight = sourceImage.height;
        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = sourceWidth;
        hiddenCanvas.height = sourceHeight;
        const hiddenCtx = hiddenCanvas.getContext('2d')!;
        hiddenCtx.drawImage(sourceImage, 0, 0);

        for (let i = 0; i < count; i++) {
            const spriteCanvas = document.createElement('canvas');
            const spriteSize = Math.min(sourceWidth, sourceHeight) / 5 + Math.random() * (Math.min(sourceWidth, sourceHeight) / 4);
            spriteCanvas.width = spriteSize;
            spriteCanvas.height = spriteSize;
            const spriteCtx = spriteCanvas.getContext('2d')!;
            const sourceX = Math.random() * (sourceWidth - spriteSize);
            const sourceY = Math.random() * (sourceHeight - spriteSize);
            const path = new Path2D();
            const numPoints = Math.floor(Math.random() * 4) + 3;
            path.moveTo(Math.random() * spriteSize, Math.random() * spriteSize);
            for (let j = 0; j < numPoints; j++) {
                path.lineTo(Math.random() * spriteSize, Math.random() * spriteSize);
            }
            path.closePath();
            spriteCtx.save();
            spriteCtx.clip(path);
            spriteCtx.drawImage(hiddenCanvas, sourceX, sourceY, spriteSize, spriteSize, 0, 0, spriteSize, spriteSize);
            spriteCtx.restore();

            const startX = centerX;
            const startY = centerY;
            // The horizontal velocity is now controlled by the `spreadWidth` parameter.
            const vx = (Math.random() - 0.5) * spreadWidth;
            // The vertical velocity is always negative for an initial upward push,
            // and its magnitude is also scaled relative to the desired spread.
            const vy = -(Math.random() * (0.5 * spreadWidth) + 5); 

            particles.push(new DebrisParticle(spriteCanvas, startX - spriteCanvas.width / 2, startY - spriteCanvas.height / 2, vx, vy, scale));
        }
        return particles;
    }
}
