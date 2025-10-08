import { IGameEntityBase } from "./IGameEntity";
import { IPosition2D } from "./IPosition2D";
import { ISpriteAnimation } from "./ISpriteAnimation";


export interface ICollectibleProps extends IGameEntityBase {
    position: IPosition2D; 
    collitionRadius: number;    
    animation: ISpriteAnimation
}


