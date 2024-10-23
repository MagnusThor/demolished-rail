"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textArrayDisplayEffect = void 0;
const textArrayDisplayEffect = (ts, ctx, propertybag, sequence // Pass the Sequence instance
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
exports.textArrayDisplayEffect = textArrayDisplayEffect;
