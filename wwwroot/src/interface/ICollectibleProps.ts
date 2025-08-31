import { IGameEntityBase } from "./IGameEntity";
import { IPositioned } from "./IPositioned";


export interface ICollectibleProps extends IGameEntityBase {
    positioned: IPositioned; // Use IPositioned for position details
    radius: number;
    color: string;
    uuid: string; // Unique identifier for the collectible
}


