import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSpriteProps";



export interface IPlayerProps extends IGameSpriteProps {   
    positioned: IPositioned;
    velX: number;
    velY: number;
    gravity: number;
    isJumping: boolean;
    isGrounded: boolean;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    lastDirection: "left" | "right";
    isInitialized: boolean;
    health: IHealthProps;
    oldY: number
}
