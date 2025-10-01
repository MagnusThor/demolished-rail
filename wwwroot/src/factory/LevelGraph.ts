import { ITileSettings } from "../interface/ILevelProps";
import { bridgeCreator } from "../creators/bridgeCreator";
import { doorTogglerCreator } from "../creators/doorTogglerCreator";
import { textCreatorSettings } from "../creators/textCreatorS";

export const DEFAULT_TILE_WIDTH = 32;
export const DEFULT_TILE_HEIGHT = 32;


    export interface ILevelGraph{

        name:string;
        tiles: number[][];
        settings:ITileSettings[];
    
    }



    export class Level implements ILevelGraph {


        name: string;
        tiles: number[][];
        settings: ITileSettings[]
        constructor(level:ILevelGraph){
            this.name = level.name;
            this.tiles = level.tiles;
            this.settings =level.settings;
        }

        getSettigsBag(x: number, y: number):{x:number,y:number} | undefined {
        return this.settings.find(pre => pre.x === x && pre.y === y);
        }
    }



export function getSettigsBag(settings:ITileSettings[],x: number, y: number): ITileSettings | undefined {
    return settings.find(pre => pre.x === x && pre.y === y);
 }




