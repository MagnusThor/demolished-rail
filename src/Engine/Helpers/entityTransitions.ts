export const createFadeInTransition = (duration: number = 1000): (ctx: CanvasRenderingContext2D, progress: number) => void =>
  (ctx: CanvasRenderingContext2D, progress: number) => {
    ctx.globalAlpha = Math.min(1, progress * duration / 1000);
  };

export const createFadeOutTransition = (duration: number = 1000): (ctx: CanvasRenderingContext2D, progress: number) => void =>
  (ctx: CanvasRenderingContext2D, progress: number) => {
    ctx.globalAlpha = Math.max(0, 1 - (progress * duration / 1000));
  };