import { Sequence } from "../../../src/Engine/sequence";

export interface IGridOverlayEffectProps {
    rows: number;
    cols: number;
    cellColor: string;
    activeCells: Set<number>; // Using a Set to store active cell indices
  }
  
  export const gridOverlayEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IGridOverlayEffectProps,
    sequence: Sequence
  ) => {
    const { rows, cols, cellColor, activeCells } = propertybag;
  
    const cellWidth = ctx.canvas.width / cols;
    const cellHeight = ctx.canvas.height / rows;
  
    // Toggle cell activity based on beat
    if (sequence.currentBeat > activeCells.size) {
      let randomCellIndex;
      do {
        randomCellIndex = Math.floor(Math.random() * (rows * cols));
      } while (activeCells.has(randomCellIndex));
      activeCells.add(randomCellIndex);
    }
  
    ctx.fillStyle = cellColor;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellIndex = row * cols + col;
        if (activeCells.has(cellIndex)) {
          const x = col * cellWidth;
          const y = row * cellHeight;
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
      }
    }
  };