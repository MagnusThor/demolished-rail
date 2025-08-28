import { IIndexedTile } from "../utils/tileBlockHelpers";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity } from "./IGameEntity";
import { ITexture } from "./ITexture";



export interface ILevelProps {
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    platforms: IGameEntity<any>[];
    collectibles: IGameEntity<ICollectibleProps>[];
    textures:ITexture[]
    indexedTiles: IIndexedTile[],
     isInitialized: boolean;
     
}


export interface ITileProps{
    width: number
    height: number
    texture?:string
}