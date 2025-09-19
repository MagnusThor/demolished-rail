/**
 * A helper class for procedurally generating debris sprites from a source image.
 * This class uses the HTML Canvas API to perform all operations locally,
 * without any network requests.
 */
export class DebrisHelper {
    /**
     * Generates a specified number of randomized debris sprites from a source image.
     * The method returns an array of HTMLCanvasElement objects, each containing
     * a unique, irregularly shaped piece of the original image.
     * * @param {HTMLImageElement} sourceImage The source image to break into debris.
     * @param {number} count The number of debris pieces to generate.
     * @returns {HTMLCanvasElement[]} An array of canvas elements, where each canvas is a debris sprite.
     */
    static generateDebris(sourceImage: CanvasImageSource, count: number) {
        if (!(sourceImage instanceof HTMLImageElement) || !sourceImage.complete) {
            console.error('DebrisHelper: sourceImage must be a valid, loaded HTMLImageElement.');
            return [];
        }

        const debrisSprites = [];
        const sourceWidth = sourceImage.width;
        const sourceHeight = sourceImage.height;

        // Create a single hidden canvas to draw the source image onto.
        // This is more efficient than creating a new one in each loop.
        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = sourceWidth;
        hiddenCanvas.height = sourceHeight;
        const hiddenCtx = hiddenCanvas.getContext('2d')!;
        hiddenCtx.drawImage(sourceImage, 0, 0);

        // Iterate 'count' times to create each debris piece.
        for (let i = 0; i < count; i++) {
            // Create a new canvas for the individual debris sprite.
            const spriteCanvas = document.createElement('canvas');
            
            // Generate a random size for the debris piece based on the source image size.
            const spriteSize = Math.min(sourceWidth, sourceHeight) / 5 + Math.random() * (Math.min(sourceWidth, sourceHeight) / 4);
            spriteCanvas.width = spriteSize;
            spriteCanvas.height = spriteSize;
            const spriteCtx = spriteCanvas.getContext('2d')!;

            // Generate a random position to "cut" the debris piece from the source.
            const sourceX = Math.random() * (sourceWidth - spriteSize);
            const sourceY = Math.random() * (sourceHeight - spriteSize);

            // Create a random polygonal shape for the clip path.
            const path = new Path2D();
            const numPoints = Math.floor(Math.random() * 4) + 3; // Polygon with 3 to 6 points
            path.moveTo(Math.random() * spriteSize, Math.random() * spriteSize);
            for (let j = 0; j < numPoints; j++) {
                path.lineTo(Math.random() * spriteSize, Math.random() * spriteSize);
            }
            path.closePath();

            // Save the canvas state before clipping
            spriteCtx.save();
            
            // Clip the drawing context to our random path. Anything drawn next
            // will only be visible within this shape.
            spriteCtx.clip(path);

            // Draw the portion of the source image onto the new sprite canvas.
            // The clipping path ensures we only get an irregular fragment.
            spriteCtx.drawImage(
                hiddenCanvas,
                sourceX, sourceY, spriteSize, spriteSize,  // Source rectangle
                0, 0, spriteSize, spriteSize               // Destination rectangle
            );

            // Restore the canvas state so subsequent draws are not clipped.
            spriteCtx.restore();

            debrisSprites.push(spriteCanvas);
        }

        return debrisSprites;
    }
}
