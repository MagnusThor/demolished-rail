import { Sequence } from "../../../src/Engine/Sequence";


export interface ITextArrayDisplayProps {
    x: number;
    y: number;
    texts: string[];
    font: string;
    size: number;
    currentBeat: number;
}




export const textArrayDisplayEffect = (
  ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: ITextArrayDisplayProps,
    sequence: Sequence // Pass the Sequence instance
) => {
    const { x, y, texts, font, size } = propertybag;

    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";

    // Se till att currentBeat är inom gränserna för texts-arrayen
    const index = Math.min(sequence.currentBeat - 1, texts.length - 1);

    // Visa texten vid aktuellt index
    if (index >= 0) {
        ctx.fillText(texts[index], x, y);
    }
};
