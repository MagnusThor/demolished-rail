import {
  Entity,
  Sequence,
} from '../../../src';
import { TextAlignment } from './FoL/fadeInOutTextEffect';

export interface ISimpleTextEffectProps {
  x?: number;
  y: number;
  texts: string[];
  textIndex: number;
  font: string;
  size: number;
  fadeInDuration: number; // Duration of the fade-in in seconds
  fadeOutDuration: number; // Duration of the fade-out in seconds
  textDuration: number; // Duration of the text display in seconds
  alignment?: TextAlignment;
  margin?: number;
}

export const simpleTextEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: ISimpleTextEffectProps,
  sequence: Sequence,
  entity?: Entity<ISimpleTextEffectProps> // Add entity parameter
) => {
  const { x, y, texts, textIndex, font, size, fadeInDuration, fadeOutDuration, textDuration, alignment, margin } = propertybag;

  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = "white";

  // Calculate x-coordinate based on alignment and margin
  let drawX: number;
  switch (alignment) {
    case TextAlignment.LEFT:
      drawX = margin || 0;
      ctx.textAlign = "left";
      break;
    case TextAlignment.RIGHT:
      drawX = ctx.canvas.width - (margin || 0);
      ctx.textAlign = "right";
      break;
    case TextAlignment.CENTER:
    default:
      drawX = ctx.canvas.width / 2;
      ctx.textAlign = "center";
      break;
  }

  const sceneStartTime = entity!.getScene()?.startTimeinMs || 0; // Get sceneStartTime from the entity
  const elapsed = (ts - sceneStartTime - (entity!.startTimeinMs || 0)) / 1000; // Calculate elapsed time

  let alpha = 1;
  if (elapsed < fadeInDuration) {
    alpha = elapsed / fadeInDuration; // Fade in
  } else if (elapsed > textDuration - fadeOutDuration) {
    alpha = (textDuration - elapsed) / fadeOutDuration; // Fade out
  }

  ctx.globalAlpha = alpha;
  ctx.fillText(texts[textIndex], x || drawX, y);
  ctx.globalAlpha = 1;
};