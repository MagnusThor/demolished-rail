import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IHealthProps } from "./IHealthProps";
import { IBoundingBox } from "./IBoundingBox";

import { IPositioned, Positioned } from "./IPositioned";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { IGameEntity, IGameEntityBase, IGameEntityBehavior } from "./IGameEntity";
import { ISpriteAnimation } from "./ISpriteAnimation";

// export interface IEnemyBehavior {
//     name: string;
//     onUpdate?: (enemy: IGameEntity<IEnemyProps>) => void;
//     onDraw?: (enemy: IGameEntity<IEnemyProps>, helper: CanvasHelper) => void;
// }

export interface IEnemyProps extends IGameEntityBase{
    positioned: Positioned;
    health: IHealthProps;
    velX: number; 
    velY: number;
    gravity: number; 
    isGrounded: boolean;
    direction: number; 
    animations: { [key: string]: ISpriteAnimation; }
    currentAnimationKey: string;
    flippedX: boolean;
    currentBehavior:IGameEntityBehavior

}

export class EnemyHealth  implements IHealthProps
{
    constructor(public health:number,public damage:number ){
    }

    isAlive(): boolean{
        return this.health > this.damage;
    }
   
    
}