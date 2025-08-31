import { ICollisionResult } from "./ICollisionResult";
import { IGameEntity } from "./IGameEntity";



export interface ICollisionDetector {
  targetName: string;
  detectorFn: (a: any, b: any) => boolean | ICollisionResult | ICollisionResult[];
  onCollision: (a: any, collisionData: ICollisionResult,targetEntity?:any) => void;
}
