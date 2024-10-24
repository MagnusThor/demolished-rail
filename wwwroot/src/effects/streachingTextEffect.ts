import { Sequence } from "../../../src/Engine/sequence";

export interface IStretchingTextProps {
    texts: string[];
    currentIndex: number;
    font: string;
    color: string;
    lastBeat: number;
}

export const stretchingTextEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IStretchingTextProps,
    sequence: Sequence
) => {
    const { texts, currentIndex, font, color, lastBeat } = propertybag;

    if (sequence.currentBeat !== lastBeat) {
        propertybag.currentIndex = (propertybag.currentIndex + 1) % texts.length; // Cycle through texts
        propertybag.lastBeat = sequence.currentBeat;
    }

    const text = texts[currentIndex];

    // Calculate the text size to fit the canvas
    let fontSize = 10;
    ctx.font = `${fontSize}px ${font}`;
    let textMetrics = ctx.measureText(text);
    let textWidth = textMetrics.width;
    let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    // Adjust font size to fit the canvas
    const scaleX = ctx.canvas.width / textWidth;
    const scaleY = ctx.canvas.height / textHeight;
    const scale = Math.min(scaleX, scaleY);
    fontSize *= scale;
    ctx.font = `${fontSize}px ${font}`;

    // Recalculate text metrics with the new font size
    textMetrics = ctx.measureText(text);
    textWidth = textMetrics.width;
    textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

    // Calculate the x and y coordinates to center the text
    const x = (ctx.canvas.width - textWidth) / 2;
    const y = (ctx.canvas.height + textHeight) / 2;

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
};