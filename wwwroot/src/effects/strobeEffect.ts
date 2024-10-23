import { Sequence } from "../../../src/Engine/sequence";


export interface IStrobeEffectProps {
  color: string;
  isOn: boolean;
  lastBeat: number;
}

export const strobeEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IStrobeEffectProps,
  sequence: Sequence
) => {
  const { color, isOn, lastBeat } = propertybag;



  if (sequence.currentBeat !== lastBeat) {
    propertybag.isOn = !isOn; // Toggle the strobe on/off on each beat
    propertybag.lastBeat = sequence.currentBeat;
  }

  if (isOn) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Fill the canvas
  }
};

