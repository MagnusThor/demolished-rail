import { ICameraEffect } from "./ICamera2D";
import { cameraShakeAction } from "./cameraShakeAction";
import { cameraZoomAction } from "./cameraZoomAction";



export const cameraEffects: { [key: string]: ICameraEffect; } = {
    "shake": {
        duration: 0,
        action: cameraShakeAction
    },
    "zoom": {
        duration: 1000,
        action: cameraZoomAction,
    }
};



