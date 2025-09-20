import { IPositioned } from "../interface/IPositioned";


export interface IParticle {
    uuid: string;
    update?: (height: number) => boolean; // Updated to return a boolean
    draw?: (ctx: CanvasRenderingContext2D) => void;
    Positioned: IPositioned;
    data: HTMLCanvasElement | HTMLImageElement | CanvasImageSource;
    isAlive: boolean; // New property to track state
    scale: number;

    velX: number;
    velY: number;
    bounciness: number;
    gravity: number;
    friction: number;
    drag: number;
    mass: number;
    terminalVelocityY: number;


}
