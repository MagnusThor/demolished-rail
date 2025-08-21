import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity } from "../interface/IGameEntity";



export interface ITileProps {
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    platforms: IGameEntity<any>[];
    collectibles: IGameEntity<ICollectibleProps>[];
}
