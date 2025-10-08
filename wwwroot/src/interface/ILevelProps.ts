import { IIndexedTile } from "./IIndexedTile";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntityBase } from "./IGameEntity";
import { IGameTexture } from "./ITexture";
import { IPosition2D } from "./IPosition2D";
import { ILevelGraph } from "./ILevelGraph";



export interface ILevelProps extends IGameEntityBase  {
    tileMap: number[][];
    tileWidth: number;
    tileHeight: number;
    indexedTiles: IIndexedTile[],
    isInitialized: boolean;
    logicalCollisionMap?: boolean[][];
    textures?: {
        [key:string]: IGameTexture
    },
    level: ILevelGraph


    

}



