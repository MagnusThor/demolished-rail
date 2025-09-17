import { IGameEntityBase } from "./IGameEntity";
import { IPositioned } from "./IPositioned";
import { ISpriteAnimation } from "./ISpriteAnimation";


export interface ICollectibleProps extends IGameEntityBase {
    positioned: IPositioned; 
    collitionRadius: number;    
    animation: ISpriteAnimation
}


