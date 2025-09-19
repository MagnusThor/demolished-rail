import { ISpriteSheetAsset } from "./ISpriteSheetAsset";

// MODIFIED: This now only contains data specific to one animation sequence



export interface ISpriteAnimation {
    name: string;
 
    frames: number[];
    frameRate: number;
    currentFrameIndex: number; // Renamed for clarity
    lastFrameChangeTime: number;
    spriteSheet: ISpriteSheetAsset;
    flippedX?: boolean
    flippedY?: boolean; 
}
