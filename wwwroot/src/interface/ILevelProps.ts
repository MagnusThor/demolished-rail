import { IIndexedTile } from "./IIndexedTile";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity, IGameEntityBase } from "./IGameEntity";
import { IGameTexture } from "./ITexture";
import { IPositioned } from "./IPositioned";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";



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


    

}


export interface ITileSettings {
    tileIndex:number
    x?: number
    y?:number
    bag: {
        [key:string] : any
    }
}

export interface ITileProps {
    width: number
    height: number
    texture?: string
    isSolid: boolean
    useLevelCreator: boolean
    offset?: {
        x:number,
        y: number
    }
    zIndex: number
    creator?: (levelProps:ILevelProps,tile:IPoint2D) => IGameEntity<any> ;
}

