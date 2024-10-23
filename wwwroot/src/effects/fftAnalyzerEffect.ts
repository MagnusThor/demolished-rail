import { Sequence } from "../../../src/Engine/sequence";


export interface IAudioVisualizerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  barWidth: number;
  barSpacing: number;
  numBars: number;
  color: string;
}

export const audioVisualizerEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IAudioVisualizerProps,
  sequence: Sequence
) => {
  const { x, y, width, height, barWidth, barSpacing, numBars, color } = propertybag;

  const frequencyData = sequence.fftData; // Access FFT data from the sequence

  if (!frequencyData) {
    return; // No data available
  }

  const barCount = Math.min(numBars, frequencyData.length);
  const barMaxHeight = height;

  ctx.fillStyle = color;

  for (let i = 0; i < barCount; i++) {
    const barHeight = (frequencyData[i] / 255) * barMaxHeight; // Scale bar height
    const barX = x + i * (barWidth + barSpacing);
    const barY = y + height - barHeight;

    ctx.fillRect(barX, barY, barWidth, barHeight);
  }
};

