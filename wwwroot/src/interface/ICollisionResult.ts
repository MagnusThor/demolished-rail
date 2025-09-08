import { IGameEntity } from "./IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";



export interface ICollisionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  axis: CollisionAxis;
  targetEntity?: IGameEntity<any>; // Optional reference to the target entity
  collisionNormal?: IPoint2D
  type?:string
  overlapMagnitude?: number 

}
