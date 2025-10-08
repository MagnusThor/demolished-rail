import { IGameEntity, IGameEntityBase } from "./IGameEntity";
import { IPosition2D } from "./IPosition2D";
/**
 * Represents the properties of a platform object.
 *
 * @property position - The current position of the platform, represented by an `IPositioned` object.
 * @property velY - The vertical velocity of the platform.
 * @property minY - The minimum Y position the platform can reach.
 * @property maxY - The maximum Y position the platform can reach.
 * @property oldY - The previous Y position of the platform.
 * @property color - The color of the platform, as a string.
 */
export interface IPlatformProps extends IGameEntityBase {
    position: IPosition2D
    velY: number;
    minY: number;
    maxY: number;
    oldY: number;
   
    
}
