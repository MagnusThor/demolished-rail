import { IGameEntity } from "./IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";



export interface ICollisionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  axis: CollisionAxis;
  targetEntity?: IGameEntity<any>; // Optional reference to the target entity
  overlap?:ICollisionResult
}
