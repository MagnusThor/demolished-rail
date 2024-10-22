export interface ITypeWriterEffectProps {
    x: number;
    y: number;
    text: string;
    index: number;
    speed: number; // Characters per beat OR characters per tick (see useBPM below)
    useBPM: boolean; // Whether speed is based on BPM or ticks
    lastCharacterTime: number;
    bpm: number;
    ticksPerBeat: number;
}

export const typeWriterEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: ITypeWriterEffectProps,


) => {

    ctx.font = "30px Big Shoulders Stencil Text";
    ctx.fillStyle = "white";

    let elapsedTime = 0;
    if (propertybag.useBPM) {
        // Calculate characters per beat
        const charactersPerBeat = propertybag.speed / (propertybag.bpm / 60);
        // Elapsed time in beats
        elapsedTime = (ts - propertybag.lastCharacterTime) / (60000 / propertybag.bpm);
    } else {
        // Calculate characters per tick
        const charactersPerTick = propertybag.speed / ((propertybag.bpm * 4) / 60);
        // Elapsed time in ticks
        elapsedTime = (ts - propertybag.lastCharacterTime) / (60000 / (propertybag.bpm * propertybag.ticksPerBeat));
    }

    if (elapsedTime >= 1 / propertybag.speed) {
        propertybag.index++;
        propertybag.lastCharacterTime = ts;
    }

    // Draw the substring
    const displayText = propertybag.text.substring(0, propertybag.index);

    // Measure the full text width
    const fullTextMetrics = ctx.measureText(propertybag.text);
    const fullTextWidth = fullTextMetrics.width;


    ctx.fillText(displayText, 10, propertybag.y / 2);

};

