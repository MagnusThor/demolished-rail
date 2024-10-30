import { Sequence } from "../../../../src/Engine/sequence";

export interface ITextFadeInOut {
  x?:number;
  y: number; // Center y-coordinate
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
  const { x,y, texts, font, size, fadeInDuration, fadeOutDuration, textDuration, loop } = propertybag;

  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  const sceneStartTime = sequence.currentScene!.startTimeinMs / 1000;
  let elapsed = ts / 1000 - sceneStartTime; // Time elapsed since the start of the scene

  // If looping, take the modulus to keep elapsed within the total duration
  if (loop) {
    const totalDuration = texts.length * textDuration;
    elapsed = elapsed % totalDuration;
  }


  // Calculate the index of the current text element
  const textIndex = Math.floor(elapsed / textDuration) % texts.length;


  // Stop if not looping and we've reached the end
  if (!loop && textIndex >= texts.length) {
    return;
  }

  const text = texts[textIndex % texts.length]; // Use modulus for safety even when not looping
  const textElapsed = elapsed % textDuration;


  let alpha = 1;
  if (textElapsed < fadeInDuration) {
    alpha = textElapsed / fadeInDuration; // Fade in
  } else if (textElapsed > textDuration - fadeOutDuration) {
    alpha = (textDuration - textElapsed) / fadeOutDuration; // Fade out
  }

  ctx.globalAlpha = alpha;
  ctx.fillText(text, x || ctx.canvas.width / 2, y); // Draw centered text
  ctx.globalAlpha = 1;
};
