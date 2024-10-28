import { Sequence } from "../../../src/Engine/sequence";


export interface ICredit {
    role: string;
    name: string;
    x: number;
    y: number;
    targetY: number;
    alpha: number;
    steps: number;
    currentStep: number;
}

export interface IIntroCreditsProps {
    credits: ICredit[];
    font: string;
    spacing: number;
    fadeInDuration: number;
    fadeOutDuration: number;
}

export const introCreditsEffect = (
    ts: number,
    ctx: CanvasRenderingContext2D,
    propertybag: IIntroCreditsProps,
    sequence: Sequence
) => {
    const { credits, font, spacing, fadeInDuration, fadeOutDuration } = propertybag;
    const { width, height } = ctx.canvas;

    ctx.textAlign = "center";
    ctx.fillStyle = "white";

    const sceneDuration = sequence.currentScene!.durationInMs / 1000;

    credits.forEach((credit, index) => {
        // Calculate elapsed time for the role (headline) based on bars
        const elapsed = (sequence.currentBar - 1) * (60 / sequence.bpm) - index * fadeInDuration;

        // Fade in and fade out logic
        if (elapsed < fadeInDuration) {
            credit.alpha = Math.min(1, elapsed / fadeInDuration);
        } else if (elapsed > sceneDuration - fadeOutDuration) {
            credit.alpha = Math.max(0, (sceneDuration - elapsed) / fadeOutDuration);
        } else {
            credit.alpha = 1;
        }

        const roleY = height / 2 + index * spacing * 2;

        // Draw the role (headline)
        ctx.font = `30px ${font}`;
        ctx.globalAlpha = credit.alpha;
        ctx.fillText(credit.role, width / 2, roleY);

        // Calculate elapsed time for the name based on timestamp
        const nameElapsed = ts / 1000 - index * fadeInDuration;

        // Calculate the y position of the name, moving in steps towards the target
        const stepSize = (roleY - spacing - credit.targetY) / credit.steps;
        credit.y = Math.max(credit.targetY, credit.y - stepSize * (nameElapsed / fadeInDuration)); // Use nameElapsed for smooth movement

        // Draw the name
        ctx.font = `20px ${font}`;
        ctx.fillText(credit.name, width / 2, credit.y);
    });
};

