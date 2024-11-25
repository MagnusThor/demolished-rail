import { ease } from '../../../../src/Engine/Helpers/EntityHelpers';

export enum ScrollDirection {
  TOP,
  LEFT,
  BOTTOM,
  RIGHT
}

export interface ITextEntranceEffectProps {
  x: number; // Target x-coordinate
  y: number; // Target y-coordinate
  text: string;
  font: string;
  size: number;
  scrollInFrom: ScrollDirection;
  easingFunction: (t: number) => number;
  duration?: number; // Optional duration of the scroll animation in seconds
}

export const textEntranceEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: ITextEntranceEffectProps,
  entity: any//Entity<ITextEntranceEffectProps>
) => {
  const { x, y, text, font, size, scrollInFrom, easingFunction, duration } = propertybag;


  ctx.save();

  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = "white";

  // Calculate the starting position based on scrollInFrom
  let startX: number, startY: number;
  switch (scrollInFrom) {
    case ScrollDirection.TOP:
      startX = x;
      startY = -ctx.measureText(text).actualBoundingBoxAscent;
      break;
    case ScrollDirection.LEFT:
      startX = -ctx.measureText(text).width;
      startY = y;
      break;
    case ScrollDirection.BOTTOM:
      startX = x;
      startY = ctx.canvas.height;
      break;
    case ScrollDirection.RIGHT:
      startX = ctx.canvas.width;
      startY = y;
      break;
  }

  const sceneStartTime = entity.getScene()?.startTimeinMs || 0;
  const elapsed = (ts - sceneStartTime - (entity.startTimeinMs || 0)) / 1000;
  const animationDuration = duration || 5; // Default duration of 5 seconds if not specified

  // Calculate the current position using the easing function
  const progress = Math.min(1, elapsed / animationDuration);
  const easedProgress = ease(progress, easingFunction);
  const currentX = startX + (x - startX) * easedProgress;
  const currentY = startY + (y - startY) * easedProgress;

  ctx.fillText(text, currentX, currentY);
  ctx.restore();
};

