import { IIndexedTile } from "./IIndexedTile";
import { ICollectibleProps } from "./ICollectibleProps";
import { IGameEntity, IGameEntityBase } from "./IGameEntity";
import { IGameTexture } from "./ITexture";
import { IPositioned } from "./IPositioned";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";
import { ISpriteAnimation } from "./ISpriteAnimation";



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
   // tileIndex:number
    x: number
    y:number
    bag: {
        [key:string] : any
    }
    activate?: (self: TriggerZoneEntity, other?: IGameEntity<any>) => void;
    deactivate?: (self: TriggerZoneEntity, other?: IGameEntity<any>) => void;
    maxNumberOfHits?: number;
    
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
        tileAnimation?: ISpriteAnimation
    }

export interface IAnimatedTileInstance {
    x: number;
    y: number;
    row: number;
    col: number;
    type: number;
    animation: ISpriteAnimation;
}

