import { ISpriteAnimation } from "./ISpriteAnimation";



export interface IAnimatedTileInstance {
    x: number;
    y: number;
    row: number;
    col: number;
    type: number;
    animation: ISpriteAnimation;
}
