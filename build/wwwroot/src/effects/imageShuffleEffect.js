"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageBeatEffect = void 0;
const imageBeatEffect = (ts, ctx, propertybag, sequence) => {
    const { x, y, image, slices, lastBeat } = propertybag;
    if (sequence.currentBeat !== lastBeat) {
        propertybag.lastBeat = sequence.currentBeat;
        const sliceWidth = image.width / slices;
        // Shuffle the slices of the image
        const sliceOrder = Array.from({ length: slices }, (_, i) => i);
        for (let i = sliceOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sliceOrder[i], sliceOrder[j]] = [sliceOrder[j], sliceOrder[i]];
        }
        // Draw the shuffled slices
        for (let i = 0; i < slices; i++) {
            const sx = sliceOrder[i] * sliceWidth;
            ctx.drawImage(image, sx, 0, sliceWidth, image.height, x + i * sliceWidth, y, sliceWidth, image.height);
        }
    }
    else {
        // If not a new beat, just draw the image normally
        ctx.drawImage(image, x, y);
    }
};
exports.imageBeatEffect = imageBeatEffect;
// const imageBeatProps: IImageBeatEffectProps = {
//     x: 100,
//     y: 50,
//     image: image, // Assuming you have the image loaded
//     slices: 10,
//     lastBeat: -1,
//   };
//   export const imageBeatEntity: IEntity = new Entity<IImageBeatEffectProps>(
//     "ImageBeatEffect",
//     1280,
//     720,
//     imageBeatProps,
//     (ts, ctx, props, sequence) => imageBeatEffect(ts, ctx, props, sequence)
//   );
