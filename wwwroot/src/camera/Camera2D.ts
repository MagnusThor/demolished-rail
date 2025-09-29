import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IGameEntity } from "../interface/IGameEntity";
import { ICamera2D, IActiveCameraEffect, SHAKE_DECAY_RATE } from "./ICamera2D";
import { cameraEffects } from "./cameraEffectBlueprints";

const TARGET_FRAME_TIME = 1000 / 60;

export class Camera2D implements ICamera2D {

    followTarget?: IGameEntity<any>;
    position: IPoint2D; 

    offsetX: number = 0;
    offsetY: number = 0;
    
    // 1. ADD THE SCALE PROPERTY
    zoom: number = 1.0; // Default scale is 1.0

    activeEffects: { [name: string]: IActiveCameraEffect } = {};
    
    constructor(x: number = 0, y: number = 0) {
        this.position = new Point2D(x, y);
    }

    /**
     * Updates the camera state, including target position and effect decay/calculation.
     * @param delta Time elapsed since the last frame (in milliseconds).
     */
    update(delta: number): void {
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 2. INITIALIZE SCALE TRACKER
        let calculatedScale = 1.0; 

        if (this.followTarget) {
            const targetPos = this.followTarget.props.positioned;
            this.position.x = targetPos.x + targetPos.width / 2;
            this.position.y = targetPos.y + targetPos.height / 2;
        }

        const effectNames = Object.keys(this.activeEffects);
        const nextEffects: { [name: string]: IActiveCameraEffect } = {};

        for (const name of effectNames) {
            const activeEffect = this.activeEffects[name];
            const blueprint = cameraEffects[name];

            if (!blueprint) continue;

            // Run the effect action, which calculates positional offset OR scale change
            const offset = blueprint.action(activeEffect, delta);
            this.offsetX += offset.x;
            this.offsetY += offset.y;
            
            // 3. APPLY ZOOM EFFECT RESULT
            if (name === 'zoom') {
                calculatedScale = activeEffect.currentIntensity;
            }

            let keepEffect = true;

            if (name === 'shake') {
                const decayFactor = Math.pow(SHAKE_DECAY_RATE, delta / TARGET_FRAME_TIME);
                activeEffect.currentIntensity *= decayFactor;
                
                if (activeEffect.currentIntensity < 0.1) {
                    keepEffect = false;
                }
            } else {
                activeEffect.elapsedTime += delta;
                if (activeEffect.elapsedTime >= blueprint.duration) { // Use blueprint.duration for final check
                    keepEffect = false;
                }
            }
            
            // 4. RESET SCALE IF ZOOM EFFECT ENDS
            if (!keepEffect && name === 'zoom') {
                 // Even though the action calculates scale back to 1.0, 
                 // we ensure the next frame starts correctly by resetting here.
                 calculatedScale = 1.0; 
            }

            if (keepEffect) {
                nextEffects[name] = activeEffect;
            }
        }

        this.activeEffects = nextEffects;
        
        // 5. FINALLY, APPLY THE CALCULATED SCALE
        this.zoom = calculatedScale;

        if(this.zoom > 1)
        console.log(this.zoom);
    }

    /**
     * Set the entity for the camera to follow.
     * @param target The entity to follow.
     */
    follow(target: IGameEntity<any>): void {
        this.followTarget = target;
    }
    /**
     * Runs a camera effect by name. Use intensity for effects like 'shake' or 'zoom'.
     * @param name The name of the effect (e.g., 'shake' or 'zoom').
     * @param intensity The magnitude (e.g., shake magnitude or target scale multiplier).
     */
    runEffect(name: string, intensity: number = 5.0): void {
        const blueprint = cameraEffects[name];

        if (!blueprint) {
            console.warn(`Camera effect blueprint '${name}' not found.`);
            return;
        }

        const currentEffect = this.activeEffects[name];

        // Ensure currentIntensity is set correctly on merge or start
        if (currentEffect) {
            
            if (blueprint.duration === 0) {
                // Decay-based (Shake): Merge intensity
                currentEffect.currentIntensity = Math.max(currentEffect.currentIntensity, intensity);
            } else {
                // Duration-based (Zoom): Restart and set target intensity
                currentEffect.elapsedTime = 0;
                currentEffect.initialIntensity = intensity;
                currentEffect.currentIntensity = 1.0; // Start the scale from 1.0
            }
        } else {
            this.activeEffects[name] = {
                name: name,
                duration: blueprint.duration,
                elapsedTime: 0,
                // Initial intensity stores the target scale multiplier (e.g., 1.5)
                initialIntensity: intensity, 
                // Current intensity starts at 1.0 (default scale)
                currentIntensity: name === 'shake' ? intensity : 1.0,
            } as IActiveCameraEffect;
        }
    }
}
