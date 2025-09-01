import { IIndexedTile } from "./IIndexedTile";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity } from "./IGameEntity";
import { ITexture } from "./ITexture";
import { IPositioned } from "./IPositioned";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";



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
    isSolid: boolean
    creator?: (levelProps:ILevelProps,tile:IPoint2D) => IGameEntity<any> ;

    
}