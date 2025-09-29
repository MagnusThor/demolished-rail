import { IActiveCameraEffect } from "./ICamera2D";

/**
 * Action function for the screen shake effect.
 * Note: Shake randomness is not dependent on delta time. Decay is handled separately in Camera2D.update.
 * @param effect The active effect state.
 * @param delta The time since the last frame (required by ICameraEffectBlueprint, but unused here).
 * @returns The calculated X and Y offset for the current frame.
 */

export const cameraShakeAction = (effect: IActiveCameraEffect, delta: number): { x: number; y: number; } => {
    const intensity = effect.currentIntensity;

    if (intensity < 0.1) return { x: 0, y: 0 };

    const randomFactor = 2; // Multiplier controls the maximum displacement
    const offsetX = (Math.random() - 0.5) * randomFactor * intensity;
    const offsetY = (Math.random() - 0.5) * randomFactor * intensity;

    return { x: offsetX, y: offsetY };
};
