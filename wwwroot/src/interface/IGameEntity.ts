import { IEntity, ICompositeEntity } from "../../../src";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "./IBoundingBox";
import { ICollisionDetector } from "./ICollisionDetector";


export interface IGameEntityBase  {
  isInitialized: boolean
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
  onUpdate?: (self: IGameEntity<P>, timeStamp: number) => void // Optional update function
  onDraw?: (self: IGameEntity<P>, helper: CanvasHelper) => void; // Optional draw function
  name: string; // Optional name for the entity
  key: string; // Unique key for the entity
  getBoundingBox?: (self: IGameEntity<P>) => IBoundingBox;
}

