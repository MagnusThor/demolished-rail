import { Sequence } from "../Sequence";

export const createBlurPostProcessor = (blurAmount: number = 5): (ctx: CanvasRenderingContext2D,sequence:Sequence) => void => {
    return (ctx: CanvasRenderingContext2D) => {
        ctx.filter = `blur(${blurAmount}px)`; // Apply blur filter
        ctx.drawImage(ctx.canvas, 0, 0); // Redraw the canvas with the filter
        ctx.filter = "none"; // Reset the filter
    };
};

export const createGrayscalePostProcessor = (): (ctx: CanvasRenderingContext2D,sequence:Sequence) => void => {
    return (ctx: CanvasRenderingContext2D) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // Red
            data[i + 1] = avg; // Green
            data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData,
            0, 0);

    };
};

export const createInvertPostProcessor = (): (ctx: CanvasRenderingContext2D) => void => {
    return (ctx: CanvasRenderingContext2D) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]; // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
        }
        ctx.putImageData(imageData,
            0, 0);
    };
};

