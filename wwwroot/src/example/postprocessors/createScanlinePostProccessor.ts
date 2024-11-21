
/**
 * Creates a post-processing function that simulates a CRT TV scanline effect.
 * @param lineHeight - The height of the scanlines.
 * @param lineColor - The color of the scanlines.
 * @returns A post-processing function that can be added to a Sequence or Entity.
 */
export const createScanlinePostProcessor = (lineHeight: number = 4, lineColor: string = "rgba(0, 0, 0, 0.5)"): (ctx: CanvasRenderingContext2D) => void => {
    return (ctx: CanvasRenderingContext2D) => {
        const { width, height } = ctx.canvas;
        ctx.beginPath();
        for (let y = 0; y < height; y += lineHeight) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.strokeStyle = lineColor;
        ctx.stroke();
    };
};