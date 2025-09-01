import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityBase, IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSpriteProps";



export interface IPlayerProps extends IGameSpriteProps, IGameEntityBase {   
    positioned: IPositioned;
    velX: number;
    velY: number;
    gravity: number;
    isJumping: boolean;
    onLadder: boolean
    isGrounded: boolean;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    lastDirection: "left" | "right";
    isInitialized: boolean;
    health: IHealthProps;
    oldY: number
    
}
