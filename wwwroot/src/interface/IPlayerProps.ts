import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityBase, IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned, Positioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSpriteProps";
import { IEntityState } from "./IEntityState";


export interface IPlayerGadget {
    [key: string]: boolean | string | number | {};
}

export interface IPlayerProps extends IGameSpriteProps, IGameEntityBase {
    positioned: Positioned;
    velX: number;
    velY: number;
    gravity: number;
    isInitialized: boolean;
    health: IHealthProps;
    gadgets: IPlayerGadget
  
}



