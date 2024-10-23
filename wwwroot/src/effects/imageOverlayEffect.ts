import { Sequence } from "../../../src/Engine/sequence";


export interface IImageOverlayEffectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  image: HTMLImageElement;
  opacity: number;
  fadeIn: boolean;
  fadeOut: boolean;
  duration: number;
}

export const imageOverlayEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IImageOverlayEffectProps,

) => {
  const { x, y, width, height, image, opacity, fadeIn, fadeOut, duration } = propertybag;

 


  ctx.drawImage(image, x, y, width, height);
  ctx.globalAlpha = 1;
};



