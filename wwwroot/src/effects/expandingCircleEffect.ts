import { Scene } from "../../../src/Engine/Scene";
import { Sequence } from "../../../src/Engine/Sequence";

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


  // Calculate the current radius based on remaining time
  const remainingTime = sequence.getSceneRemainingTime(ts);
  const progress = Math.max(0, 1 - remainingTime / (propertybag.duration * 1000)); // Ensure progress is not negative
  propertybag.radius = propertybag.maxRadius * progress;

  // Draw the circle
  ctx.beginPath();
  ctx.arc(propertybag.x, propertybag.y, propertybag.radius, 0, 2 * Math.PI);
  ctx.fill();
};