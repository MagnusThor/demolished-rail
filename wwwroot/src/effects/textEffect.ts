import { Sequence } from "../../../src/Engine/Sequence";

export interface ITextEffectProps {
    x: number;
    y: number;
    text: string;
    font: string;
    size: number;
    duration: number; // Duration of the effect in seconds
  }
  

  
  export const textEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: ITextEffectProps,
    sequence: Sequence // Pass the Sequence instance
  ) => {
    const { x, y, text, font, size, duration } = propertybag;
  
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";
  
    const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
    const elapsed = duration - sceneRemainingTime / 1000; // Time elapsed in seconds
  
    let alpha = 1;
    if (elapsed < 1) {
      alpha = elapsed; // Fade in over 1 second
    }
  
    if (sceneRemainingTime / 1000 < 1) {
      alpha = sceneRemainingTime / 1000; // Fade out over 1 second
    }
  
    ctx.globalAlpha = alpha;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  };