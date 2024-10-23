import { Sequence } from "../../../src/Engine/sequence";

export const createBeatShakePostProcessor = (intensity: number = 10): (ctx: CanvasRenderingContext2D, sequence: Sequence) => void => {
    return (ctx: CanvasRenderingContext2D, sequence: Sequence) => {
      const offsetX = (Math.random() - 0.5) * intensity * sequence.currentBeat;
      const offsetY = (Math.random() - 0.5) * intensity * sequence.currentBeat;
  
      ctx.drawImage(ctx.canvas, offsetX, offsetY);
    };
  };