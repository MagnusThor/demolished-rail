import { IPositioned } from "./IPositioned";


export interface IGameTexture extends IPositioned {
    texture: any;
    key: string;
    imageData: ImageData | undefined

}
