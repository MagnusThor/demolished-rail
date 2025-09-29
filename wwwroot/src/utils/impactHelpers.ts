// Define the minimum downward velocity required to consider a landing a "hard impact".
// This value is the floor for any screen shake or major impact effects.
export const MIN_IMPACT_VELOCITY_THRESHOLD = 1.0; 

// A scaling factor to convert the excess velocity (above the threshold) into camera shake intensity.
const SHAKE_INTENSITY_SCALER = 2.5; 
// Maximum safe shake intensity to prevent the screen from going completely crazy.
const MAX_SHAKE_INTENSITY = 12.0; 

/**
 * Determines if a vertical velocity (velY) indicates a hard landing impact.
 * Only checks positive velY (downward movement).
 * @param velY The vertical velocity just before collision resolution.
 * @returns true if the impact velocity is greater than the defined threshold.
 */
export function isHardImpact(velY: number): boolean {
    // We only care about landing (positive velY, moving downward)
    if (velY <= 0) {
        return false;
    }
    // Check if the downward velocity exceeds the minimum threshold
    return velY > MIN_IMPACT_VELOCITY_THRESHOLD;
}

/**
 * Calculates the intensity of a camera shake effect based on the impact velocity.
 * The intensity scales linearly with the velocity that is ABOVE the threshold.
 * @param velY The vertical velocity just before collision resolution.
 * @returns The calculated intensity value for the camera shake, or 0 if below threshold.
 */
export function calculateShakeIntensity(velY: number): number {
    if (!isHardImpact(velY)) {
        return 0;
    }
    
    // Calculate the magnitude of velocity above the threshold
    const impactMagnitude = velY - MIN_IMPACT_VELOCITY_THRESHOLD;
    
    // Scale the magnitude and cap the result
    return Math.min(impactMagnitude * SHAKE_INTENSITY_SCALER, MAX_SHAKE_INTENSITY);
}
