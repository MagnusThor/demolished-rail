import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IHealthProps } from "./IHealthProps";
import { IBoundingBox } from "./IBoundingBox";
import { IDynamicProps } from "./IDynamicProps";
import { IPositioned } from "./IPositioned";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { IGameEntity, IGameEntityBase } from "./IGameEntity";

export interface IEnemyBehavior {
    name: string;
    onUpdate?: (enemy: IGameEntity<IEnemyProps>) => void;
    onDraw?: (enemy: IGameEntity<IEnemyProps>, helper: CanvasHelper) => void;
}

export interface IEnemyProps extends IGameEntityBase{
    positioned: IPositioned;
    health: IHealthProps;
    velX: number; // Added for movement
    velY: number; // Added for movement
    gravity: number; // Added gravity
    isGrounded: boolean; // Indicates if the enemy is on a solid surface
    // tileWidth: number; // The width of a tile
    // tileHeight: number; // The height of a tile
    behavior?: IEnemyBehavior[];
    direction: number; // Added to control patrol direction
}

export class EnemyHealth  implements IHealthProps
{
    constructor(public health:number,public damage:number ){

    }

    isAlive(): boolean{
        return this.health > this.damage;
    }
   
    
}