import { IGameAsset } from "./IGameAsset";
import { IGameEntity } from "./IGameEntity";
import { Positioned } from "./IPosition2D";
import { ISpriteAnimation } from "./ISpriteAnimation";



// MODIFIED: The sprite sheet data now lives here, as a single source of truth
export interface IGameSpriteProps {
    animations: { [key: string]: ISpriteAnimation }; 
    currentAnimation?: ISpriteAnimation;
}