import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntity, IGameEntityBase, IGameEntityBehavior } from "../interface/IGameEntity";
import { IPosition2D, Positioned } from "./IPosition2D";
import { IGameSpriteProps } from "./IGameSpriteProps";
import { IEntityState } from "./IEntityState";
import { PlayerEntity } from "../entities/player/playerEntity";


export interface IPlayerGadget {
    [key: string]: boolean | string | number | {};
}

export interface IPlayerBehavior extends IGameEntityBehavior {
    name: string;
    order: number;
    criteria: (player: PlayerEntity) => boolean;
    onUpdate?: (player: any ) => void;
}

export interface IPlayerProps extends IGameSpriteProps, IGameEntityBase {
    position: Positioned;
    velX: number;
    velY: number;
    gravity: number;
    isInitialized: boolean;
    health: IHealthProps;
    gadgets: IPlayerGadget
    attachedTo:IGameEntity<any> | undefined  
    
}



