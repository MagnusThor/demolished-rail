import { IIndexedTile } from "./IIndexedTile";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity } from "./IGameEntity";
import { ITexture } from "./ITexture";



export interface ILevelProps {
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    indexedTiles: IIndexedTile[],
    isInitialized: boolean;
    logicalCollisionMap?: boolean[][];
    textures?: {
        [key:string]: ITexture
    }

}


export interface ITileProps {
    width: number
    height: number
    texture?: string
}