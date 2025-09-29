import { IActiveCameraEffect } from "./ICamera2D";

/**
 * Camera Zoom Action: Calculates the current scale multiplier based on elapsed time.
 * This function reads time but DOES NOT increment activeEffect.elapsedTime.
 * @param effect The active IActiveCameraEffect object.
 * @param delta The delta time (not used for calculation, but part of signature).
 * @returns Positional offset (always {x: 0, y: 0} for zoom).
 */
export const cameraZoomAction = (effect: IActiveCameraEffect, delta: number): { x: number; y: number; } => {
    
    // The target scale is stored in initialIntensity (e.g., 10.0 in your case)
    const targetScale = effect.initialIntensity;
    const baseScale = 1.0;
    const totalDuration = effect.duration;
    
    // Elapsed time is handled by the Camera2D.update loop
    const time = effect.elapsedTime;

    // Split the duration into Zoom-In and Zoom-Out phases
    const halfDuration = totalDuration / 2;
    
    let scale: number;
    
    if (time <= halfDuration) {
        // Phase 1: Zoom In (from 1.0 to targetScale)
        const progress = time / halfDuration;
        // Using a smooth power-of-2 easing for a more natural feel
        const easedProgress = progress * progress; 
        scale = baseScale + (targetScale - baseScale) * easedProgress;
        
    } else if (time <= totalDuration) {
        // Phase 2: Zoom Out (from targetScale back to 1.0)
        const zoomOutTime = time - halfDuration;
        const progress = zoomOutTime / halfDuration;
        
        // Eased inverse progress
        const easedProgress = progress * progress;
        scale = targetScale - (targetScale - baseScale) * easedProgress;
        
    } else {
        // Effect Complete (although Camera2D.update should remove it next frame)
        scale = baseScale; 
    }

    // THIS IS THE CRITICAL STEP: Store the calculated scale multiplier
    effect.currentIntensity = scale; 
    
    return { x: 0, y: 0 }; 
};
