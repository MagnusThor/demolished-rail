import { IGameAsset, ISpriteSheetAsset } from "../utils/GameAssets";
import { IGameEntity } from "./IGameEntity";
import { Positioned } from "./IPositioned";



// MODIFIED: This now only contains data specific to one animation sequence
export interface ISpriteAnimation {
    name: string;
    // An array of frame numbers that make up this animation
    frames: number[]; 
    frameRate:number
    currentFrameIndex: number; // Renamed for clarity
    lastFrameChangeTime:number
    spriteSheet: ISpriteSheetAsset
}

// MODIFIED: The sprite sheet data now lives here, as a single source of truth
export interface IGameSpriteProps {
     animations: { [key: string]: ISpriteAnimation }; 
    currentAnimation: ISpriteAnimation;
}