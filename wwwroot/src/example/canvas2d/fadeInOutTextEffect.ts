import { Sequence } from '../../../../src';

export enum TextAlignment {
  LEFT,
  CENTER,
  RIGHT
}

export interface ITextFadeInOut {
  x?: number;
  y: number;
  alignment?: TextAlignment; // Add alignment property
  margin?: number; // Add margin property
  texts: string[];
  font: string;
  size: number;
  fadeInDuration: number; // Duration of the fade-in in seconds
  fadeOutDuration: number; // Duration of the fade-out in seconds
  textDuration: number,
  loop: boolean;
}

export const textFadeInOut = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: ITextFadeInOut,
  sequence: Sequence
) => {
  const { x, y, texts, font, size, fadeInDuration, fadeOutDuration, textDuration, loop } = propertybag;

  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  const sceneStartTime = sequence.currentScene!.startTimeinMs / 1000;
  let elapsed = ts / 1000 - sceneStartTime; // Time elapsed since the start of the scene

  // If looping, take the modulus to keep elapsed within the total duration
  if (loop) {
    const totalDuration = texts.length * textDuration ;
    elapsed = elapsed % totalDuration;
  }
  
  // Calculate the index of the current text element
  let textIndex = Math.floor(elapsed / textDuration);

  // If looping, take the modulus to keep the index within bounds
  if (loop) {
    textIndex = textIndex % texts.length;
  } else if (textIndex >= texts.length) { // Stop if not looping and reached the end
    return;
  }

  const text = texts[textIndex];
  const textElapsed = elapsed % textDuration;

  let alpha = 1;
  if (textElapsed < fadeInDuration) {
    alpha = textElapsed / fadeInDuration; // Fade in
  } else if (textElapsed > textDuration - fadeOutDuration) {
    alpha = (textDuration - textElapsed) / fadeOutDuration; // Fade out
  }

  // Calculate x-coordinate based on alignment and margin
  let drawX: number;
  switch (propertybag.alignment) {
    case TextAlignment.LEFT:
      drawX = propertybag.margin || 0;
      ctx.textAlign = "left";
      break;
    case TextAlignment.RIGHT:
      drawX = ctx.canvas.width - (propertybag.margin || 0);
      ctx.textAlign = "right";
      break;
    case TextAlignment.CENTER:
    default:
      drawX = ctx.canvas.width / 2;
      ctx.textAlign = "center";
      break;
  }

  ctx.globalAlpha = alpha;
  ctx.fillText(text, propertybag.x || drawX, y); // Use provided x or calculated drawX
  ctx.globalAlpha = 1;

};
