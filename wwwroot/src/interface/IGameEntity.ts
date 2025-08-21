import { IEntity, ICompositeEntity } from "../../../src";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "./IBoundingBox";



export interface IDynamicProps extends IGameEntityProp {
    isAlive: boolean; // Indicates if the entity should be removed from the game loop
    lifeTime: number; // The remaining life of the entity in milliseconds
}

export interface IDynamicEntity<P extends IDynamicProps> extends IGameEntity<P> {
    onCreated?: (self: IDynamicEntity<P>) => void; // A hook for when the entity is created
    onDestroy?: (self: IDynamicEntity<P>) => void; // A hook for when the entity is destroyed
}



export interface ICollisionResult {
    x: number;
    y: number;
    width: number;
    height: number;
    axis: CollisionAxis
    targetEntity?: IGameEntity<any>; // Optional reference to the target entity
}



export enum CollisionAxis {
    X = "x",
    Y = "y",
    XY = "xy",
    YX = "yx",
    NONE = "none",
} 

export interface ICollisionDetector {
    targetName: string;
    detectorFn: (a: any, b: any) => boolean | ICollisionResult | ICollisionResult[];
    onCollision: (a: any , collisionData: ICollisionResult) => void;
}


export interface IGameEntityProp {
  isAlive?: boolean; // Optional property to indicate if the entity is alive
}


/**
 * A GameEntity is a composite entity with the added functionality of
 * collision detection. It can define its own collision detectors
 * which the WorldEntity will check on every frame.
 */
export interface IGameEntity<P> extends ICompositeEntity<P> {
  collisionDetectors?: ICollisionDetector[];
  onInit?: (self: IGameEntity<P>) => void; // Optional initialization function
  onUpdate?: (self: IGameEntity<P>, timeStamp: number) => void; // Optional update function
  onDraw?: (self: IGameEntity<P>, helper: CanvasHelper) => void; // Optional draw function
  name: string; // Optional name for the entity
  key: string; // Unique key for the entity
   getBoundingBox?: (self: IGameEntity<P>) => IBoundingBox;
}

