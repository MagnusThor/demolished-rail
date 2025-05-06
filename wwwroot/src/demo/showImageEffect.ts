

export interface IShowImageEffectProps {
    x: number;
    y: number;
    scaleFactor: number;
    image: HTMLImageElement; // Assuming this is the image URL
}


export const showImageEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IShowImageEffectProps
) => {
    // propertybag.scaleFactor = 0.5 * (Math.floor(ts / 1000) % 2); // Example scaling logic

    ctx.save(); // Save the current state
    
    // Apply scaling
    ctx.scale(propertybag.scaleFactor, propertybag.scaleFactor);

    // Calculate the scaled dimensions
    const scaledWidth = propertybag.image.width * propertybag.scaleFactor;
    const scaledHeight = propertybag.image.height * propertybag.scaleFactor;

    // Calculate the centered position based on scaled dimensions
    const centerX = (ctx.canvas.width / 2) - (scaledWidth / 2);
    const centerY = (ctx.canvas.height / 2) - (scaledHeight / 2);

    // Draw the image centered
    ctx.drawImage(propertybag.image, centerX, centerY);

    ctx.restore(); // Restore to the original state


};
