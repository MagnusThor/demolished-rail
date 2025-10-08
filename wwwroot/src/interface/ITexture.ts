import { IGameAsset } from "./IGameAsset";
import { IPosition2D } from "./IPosition2D";


export interface IGameTexture extends IPosition2D {
    generatedTexture:any
    key: string;
    imageData: ImageData | undefined
    asset: IGameAsset;    
}
