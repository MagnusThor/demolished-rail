import { IPositioned } from "./IPositioned";


export interface ICollectibleProps {
    position: IPositioned; // Use IPositioned for position details
    radius: number;
    color: string;
    uuid: string; // Unique identifier for the collectible
}


