import { InputHelper } from "../../../src";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityProp } from "../interface/IGameEntity";
import { IPositioned } from "./IPositioned";
import { IGameSpriteProps } from "./IGameSprite";



export interface IPlayerProps extends IGameSpriteProps {
    // x: number;
    // y: number;
    // width: number;
    // height: number;
    
    position: IPositioned;

    velX: number;
    velY: number;
    gravity: number;
    isJumping: boolean;
    isGrounded: boolean;
    isMovingLeft: boolean;
    isMovingRight: boolean;
    lastDirection: "left" | "right";
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    isInitialized: boolean;
    health: IHealthProps;
}
