import { IGameEntity } from "./IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";



/**
 * Represents the result of a collision detection between entities.
 *
 * @property x - The x-coordinate of the collision area.
 * @property y - The y-coordinate of the collision area.
 * @property width - The width of the collision area.
 * @property height - The height of the collision area.
 * @property axis - The axis along which the collision occurred.
 * @property targetEntity - Optional reference to the entity being collided with.
 * @property sourceEntity - Optional reference to the entity initiating the collision.
 * @property collisionNormal - Optional normal vector at the collision point.
 * @property overlapMagnitude - Optional magnitude of the overlap between entities.
 * @property type - Optional string describing the type of collision.
 * @property snapTo - Optional tile data for snapping entities after collision.
 * @property distance - Optional distance to the collision point.
 */
export interface ICollisionResult {
  
  x: number;
  y: number;
  width: number;
  height: number;
  axis: CollisionAxis;  
  targetEntity?: IGameEntity<any>; // Optional reference to the target entity
  sourceEntity?: IGameEntity<any>; // Optional reference to the source entity 
  collisionNormal?: IPoint2D
  overlapMagnitude?: number 
  type?:string
  snapTo?: { x: number; y: number; width: number; height: number; }; // Optional tile data for snapping
  distance?: number; // Optional distance to the collision point  
}
