
/**
 * Creates a post-processing function that applies a lens effect using a provided image.
 * @returns A post-processing function that can be added to a Sequence or Entity.
 */
export const createLensPostProcessor = (lensImage: HTMLImageElement): (ctx: CanvasRenderingContext2D) => void => {
    return (ctx: CanvasRenderingContext2D) => {

        const { width, height } = ctx.canvas;

        // Create a temporary canvas to draw the blended image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d')!;

        // Draw the original image onto the temporary canvas
        tempCtx.drawImage(ctx.canvas, 0, 0);

        // Draw the lens image on top with "multiply" blend mode
        tempCtx.globalCompositeOperation = "multiply";
        tempCtx.drawImage(lensImage, 0, 0, width, height);

        // Draw the blended image back onto the original canvas
        ctx.drawImage(tempCanvas, 0, 0);
    };
};