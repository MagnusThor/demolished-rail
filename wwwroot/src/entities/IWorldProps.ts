import { IGameEntityBase } from '../interface/IGameEntity';

/**
 * Interface for the properties of a WorldEntity.
 */


export interface IWorldProps extends IGameEntityBase {
    worldWidth: number;
    worldHeight: number;
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;

}
