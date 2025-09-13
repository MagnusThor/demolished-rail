import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntity, IGameEntityBase, IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned, Positioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSpriteProps";
import { IEntityState } from "./IEntityState";
import { PlayerEntity } from "../entities/player/playerEntity";


export interface IPlayerGadget {
    [key: string]: boolean | string | number | {};
}

export interface IPlayerBehavior {
    name: string;
    criteria: string; // i.e isGrounded state is true,isGrounded, 
    onUpdate?: (player: PlayerEntity) => void; 
}




export interface IPlayerProps extends IGameSpriteProps, IGameEntityBase {
    positioned: Positioned;
    velX: number;
    velY: number;
    gravity: number;
    isInitialized: boolean;
    health: IHealthProps;
    gadgets: IPlayerGadget
    attachedTo:IGameEntity<any> | undefined  
    
}



