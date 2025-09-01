import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityBase, IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSpriteProps";
import { IEntityState } from "./IEntityState";



export interface IPlayerProps extends IGameSpriteProps, IGameEntityBase {
    positioned: IPositioned;
    velX: number;
    velY: number;
    gravity: number;
    isInitialized: boolean;
    health: IHealthProps;
  
}



