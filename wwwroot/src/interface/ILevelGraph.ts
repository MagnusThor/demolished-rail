import { ILevelData, ILevelMetadata } from "../designer/DesignerApp";
import { ITileSettings } from "./ITileSettings";



export interface ILevelGraph {

    name: string;
    tiles: number[][];
    settings: ITileSettings[];
    metadata: ILevelMetadata
  
}
