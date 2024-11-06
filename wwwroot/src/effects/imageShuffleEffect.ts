import { Sequence } from "../../../src/Engine/Sequence";


export interface IImageBeatEffectProps {
  x: number;
  y: number;
  image: HTMLImageElement;
  slices: number; // Number of slices for the effect
  lastBeat: number;
}

export const imageBeatEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IImageBeatEffectProps,
  sequence: Sequence
) => {
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
  } else {
    // If not a new beat, just draw the image normally
    ctx.drawImage(image, x, y);
  }
};



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