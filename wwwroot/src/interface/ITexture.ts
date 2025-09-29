import { IPositioned } from "./IPositioned";


export interface IGameTexture extends IPositioned {
    texture: any;
    generatedTexture:any
    key: string;
    imageData: ImageData | undefined
    

}
