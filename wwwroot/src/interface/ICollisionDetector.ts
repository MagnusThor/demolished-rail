import { ICollisionResult } from "./ICollisionResult";
import { IGameEntity, IGameEntityBase } from "./IGameEntity";



export interface ICollidable{

}



export interface ICollisionDetector {
  targetName: string;
  detectorFn: (source: any, target:any) => boolean | ICollisionResult | ICollisionResult[];
  onCollision: (souce: any, collisionData: any,target?:any) => void;
}
