import { Scene } from "../../../src/Engine/scene";
import { Sequence } from "../../../src/Engine/sequence";

export interface IExpandingCircleEffectProps {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    growthRate: number; // Radius increase per tick
    duration: number
  }
  
  export const expandingCircleEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IExpandingCircleEffectProps,
    sequence: Sequence
  ) => {
    ctx.fillStyle = "white";
  
    propertybag.radius =
    propertybag.maxRadius *
    (1 - sequence.getSceneRemainingTime(ts) / (propertybag.duration * 1000));

  // Draw the circle
  ctx.beginPath();
  ctx.arc(propertybag.x, propertybag.y, propertybag.radius, 0, 2 * Math.PI);
  ctx.fill();
  };