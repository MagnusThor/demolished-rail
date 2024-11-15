import { MathHelper } from '../../../src';

export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface IBackgroundProps {
    rectangles: IRectangle[];
}


export const worldBackgroundEffect = (ts: number, ctx: CanvasRenderingContext2D, propertybag: IBackgroundProps) => {
    const { rectangles } = propertybag;
    const { width, height } = ctx.canvas;
  
    if (rectangles.length === 0) {
      const gap = 100;
      const minWidth = 50;
      const maxWidth = 200;
      const minHeight = 30;
      const maxHeight = 80;
  
      let currentX = 0;
      while (currentX < width) {
        const rectWidth = MathHelper.randomInt(minWidth, maxWidth);
        const rectHeight = MathHelper.randomInt(minHeight, maxHeight);
        const x = currentX + Math.random() * gap;
        const y = Math.random() * (height - rectHeight);
        const color = `hsl(${Math.random() * 360}, 100%, 50%)`;  
        rectangles.push({ x, y, width: rectWidth, height: rectHeight, color });
        currentX += rectWidth + gap;
      }
    }  
    rectangles.forEach(rect => {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
  };



