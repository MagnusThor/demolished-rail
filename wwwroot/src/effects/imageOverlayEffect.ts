import { Entity, IEntity } from "../../../src/Engine/Entity";
import { Sequence } from "../../../src/Engine/Sequence";


export enum ImagePosition {
  FILL,
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
  TOP_LEFT,
  TOP_RIGHT
}

export interface IImageOverlayEffectProps {
  width: number;
  height: number;
  image: HTMLImageElement;
  opacity: number;
  fadeIn: boolean;
  fadeOut: boolean;
  duration: number;
  position: ImagePosition;
}

export const imageOverlayEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IImageOverlayEffectProps,
  sequence: Sequence
) => {
  let { width, height, image, opacity, fadeIn, fadeOut, duration, position } = propertybag;

  let x = 0;
  let y = 0;

  // Calculate x and y coordinates based on the specified position
  switch (position) {
    case ImagePosition.FILL:
      x = 0;
      y = 0;
      width = ctx.canvas.width;
      height = ctx.canvas.height;
      break;
    case ImagePosition.LEFT:
      x = 0;
      y = (ctx.canvas.height - height) / 2;
      break;
    case ImagePosition.RIGHT:
      x = ctx.canvas.width - width;
      y = (ctx.canvas.height - height) / 2;
      break;
    case ImagePosition.TOP:
      x = (ctx.canvas.width - width) / 2;
      y = 0;
      break;
    case ImagePosition.BOTTOM:
      x = (ctx.canvas.width - width) / 2;
      y = ctx.canvas.height - height;
      break;
    case ImagePosition.BOTTOM_LEFT:
      x = 0;
      y = ctx.canvas.height - height;
      break;
    case ImagePosition.BOTTOM_RIGHT:
      x = ctx.canvas.width - width;
      y = ctx.canvas.height - height;
      break;
    case ImagePosition.TOP_LEFT:
      x = 0;
      y = 0;
      break;
    case ImagePosition.TOP_RIGHT:
      x = ctx.canvas.width - width;
      y = 0;
      break;
  }

  // Calculate the remaining time in the scene
  const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
  const elapsed = duration - sceneRemainingTime / 1000;

  // Calculate opacity based on fade-in/fade-out properties
  let alpha = opacity;
  if (fadeIn && elapsed < 1) {
    alpha = opacity * elapsed;
  }
  if (fadeOut && sceneRemainingTime / 1000 < 1) {
    alpha = opacity * (sceneRemainingTime / 1000);
  }

  // Draw the image with the calculated opacity
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, x, y, width, height);
  ctx.globalAlpha = 1; // Reset global alpha
};

