import { ICollisionResult } from "./ICollisionResult";



export interface ICollisionDetector {
  targetName: string;
  detectorFn: (a: any, b: any) => boolean | ICollisionResult | ICollisionResult[];
  onCollision: (a: any, collisionData: ICollisionResult) => void;
}
