import { Sequence } from "../../../src/Engine/sequence";

export interface IPulsatingTextEffectProps {
    x: number;
    y: number;
    text: string;
    font: string;
    size: number;
    duration: number;
    pulseBy: "tick" | "bar";
}

export const pulsatingTextEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IPulsatingTextEffectProps,
    sequence: Sequence
) => {
    const { x, y, text, font, size, duration, pulseBy } = propertybag;

    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = "white";

    const sceneRemainingTime = sequence.getSceneRemainingTime(ts);
    const elapsed = duration - sceneRemainingTime / 1000;

    let alpha = 1;
    if (elapsed < 1) {
        alpha = elapsed;
    }

    if (sceneRemainingTime / 1000 < 1) {
        alpha = sceneRemainingTime / 1000;
    }

    // Pulsating effect
    let pulseFactor = 1;
    if (pulseBy === "tick") {
        pulseFactor = 0.8 + 0.2 * Math.sin((2 * Math.PI * sequence.currentTick) / sequence.ticksPerBeat);
    } else if (pulseBy === "bar") {
        pulseFactor = 0.8 + 0.2 * Math.sin((2 * Math.PI * sequence.currentBeat) / sequence.beatsPerBar);
    }

    ctx.globalAlpha = alpha * pulseFactor;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
};

