import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IHealthProps } from "./IHealthProps";
import { IGameEntityBase } from "../interface/IGameEntity";

import { IPositioned } from "./IPositioned";



export interface IBulletProps extends IGameEntityBase {

    positioned: IPositioned; // The position of the bullet in the game world
    velX: number;
    velY: number;
    isAlive: boolean;
    lifeTime: number; // Time in frames before the bullet disappears

    health: IHealthProps // Health properties for the bullet, if applicable
    
    isInitialized: boolean;
    isCollidable: boolean;

}
