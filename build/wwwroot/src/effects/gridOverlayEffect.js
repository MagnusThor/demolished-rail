"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gridOverlayEffect = void 0;
const gridOverlayEffect = (ts, ctx, propertybag, sequence) => {
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
exports.gridOverlayEffect = gridOverlayEffect;
