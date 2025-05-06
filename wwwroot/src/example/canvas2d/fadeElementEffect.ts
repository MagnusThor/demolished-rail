import {
  Canvas2DEntity,
  Sequence,
} from '../../../../src';
import { TextAlignment } from './fadeInOutTextEffect';

interface IFadeTextElement {
  type: 'text';
  id: number;
  data: string;
  font: string;
  size: number;
}

interface IFadeImageElement {
  type: 'image';
  id: number;
  data: HTMLImageElement; // Assuming you're working with HTMLImageElement
}

export type IFadeElementType = IFadeTextElement | IFadeImageElement;

export interface IFadeElementEffectProps {
  x?: number;
  y: number;
  elements: IFadeElementType[];
  element: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  duration: number;
  alignment?: TextAlignment;
  margin?: number;
  textIndex?: number; // Optional index for text elements
}

export const fadeElementEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IFadeElementEffectProps,
  sequence: Sequence,
  entity?: Canvas2DEntity<IFadeElementEffectProps> // Add entity parameter
) => {
  const { x, y, elements, element: elementIndex,
      fadeInDuration, fadeOutDuration, duration: elementDuration, alignment, margin } = propertybag;

  const currentElement = elements[elementIndex];

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
  } else if (elapsed > elementDuration - fadeOutDuration) {
      alpha = (elementDuration - elapsed) / fadeOutDuration; // Fade out
  }

  ctx.globalAlpha = alpha;

  if (currentElement.type === 'text') {
      const fontToUse = currentElement.font || 'sans-serif';
      const sizeToUse = currentElement.size || 16;
      ctx.font = `${sizeToUse}px ${fontToUse}`;
      ctx.fillStyle = "white";
      ctx.fillText(currentElement.data, x || drawX, y);
  } else if (currentElement.type === 'image') {
      ctx.drawImage(currentElement.data, x || 0, y); // You might need to adjust the x, y for image positioning
  }

  ctx.globalAlpha = 1;
};