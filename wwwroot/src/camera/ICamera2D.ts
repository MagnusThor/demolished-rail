import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IGameEntity } from "../interface/IGameEntity";
import { IPosition2D } from "../interface/IPosition2D";


/**
 * Runtime state for a camera effect instance.
 */
export interface IActiveCameraEffect {
    name: string;
    duration: number; 
    elapsedTime: number;
    initialIntensity: number;
    currentIntensity: number;
}

export interface ICameraEffect {
    duration: number; // The default/max duration for the effect (0 for decay-based)
    // Action calculates the offset based on the effect's current state and delta time.
    action: (effect: IActiveCameraEffect, delta: number) => { x: number, y: number };
}

// Fixed decay rate for the screen shake effect (This is the per-frame decay multiplier at 60FPS)
export const SHAKE_DECAY_RATE = 0.85; 

export interface ICamera2D {
    followTarget?: IGameEntity<any>;
    activeEffects: { [name: string]: IActiveCameraEffect };
    
    // Total offsets accumulated by all active effects this frame
    offsetX: number; 
    offsetY: number;

    zoom: number;

    follow(target: IGameEntity<any>): void; 
    update(delta: number): void;
    runEffect(name: string, intensity?: number): void;

    position:IPoint2D
}
