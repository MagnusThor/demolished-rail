import { IGameAsset } from "./IGameAsset";
import { IGameEntity } from "./IGameEntity";
import { Positioned } from "./IPositioned";
import { ISpriteAnimation } from "./ISpriteAnimation";



// MODIFIED: The sprite sheet data now lives here, as a single source of truth
export interface IGameSpriteProps {
     animations: { [key: string]: ISpriteAnimation }; 
    currentAnimation?: ISpriteAnimation;
}