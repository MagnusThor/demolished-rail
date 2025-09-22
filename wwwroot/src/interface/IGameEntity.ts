import { IEntity, ICompositeEntity } from "../../../src";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { EntityEvent } from "../entities/EntityEvent";
import { GameEntity } from "../entities/GameEntity";

import { StateHelper } from "../entities/StateHelper";
import { IBoundingBox } from "./IBoundingBox";
import { ICollisionDetector } from "./ICollisionDetector";
import { IEntityState } from "./IEntityState";
import { ITileSettings } from "./ILevelProps";
import { IPositioned } from "./IPositioned";

export interface IGameEntityBehavior {  
    name: string;
    onUpdate?: (self: any,timeStamp:number) => void;
    onDraw?: (self: any, helper: CanvasHelper) => void;
    onInit?: (self:any) => void;
    _isInitialized?:boolean
}

export interface IGameEntityBase  {
  isInitialized: boolean
  positioned: IPositioned
  zIndex: number
  states: IEntityState  
  isCollidable: boolean;
  behaviors?: { [key: string]: IGameEntityBehavior  };
  settings?: ITileSettings 
}
export interface IGameEntity<P extends IGameEntityBase>  {
  name: string; 
  collisionDetectors?: ICollisionDetector[];
  props: P;
  uuid: string; 
  stateHelper: StateHelper<P>;
  entityEvents?: EntityEvent;

  processCollisions?: (self: IGameEntity<P>, entities: IGameEntity<any>[]) => void;
  getBoundingBox?: (self: IGameEntity<P>) => IBoundingBox;

  onInit?: (self: IGameEntity<P>) => void; // Optional initialization function
  onUpdate?: (self: IGameEntity<P>, timeStamp: number) => void // Optional update function
  onDraw?: (self: IGameEntity<P>, helper: CanvasHelper) => void; // Optional draw function  
  onCreated?: ((self: IGameEntity<P>) => void);
  onDestroy?: ((self: IGameEntity<P>) => void);


}

