
/**
 * Defines the shape of the game state object.
 * This is the central repository for all game-wide data.
 */

import { InputHelper } from "../../../src";
import { IGameEntity } from "./IGameEntity";
import { IViewport } from "./IViewport";
import { IPlayerProps } from "./IPlayerProps";
import { IParticle } from "./IParticle";


export interface IGameState {
    showImageDataOverlay:boolean
    ctx: CanvasRenderingContext2D | undefined
    // The game's viewport, controlling what part of the world is visible on screen
    viewport: IViewport;

    input: InputHelper | undefined

    gameCanvas?: HTMLCanvasElement

    player?: IGameEntity<IPlayerProps>; // The player entity in the game
    
    worldWidth: number; // The width of the game world
    worldHeight: number; // The height of the game world

    entities: IGameEntity<any>[];

    findEntities(key: string): IGameEntity<any>[]; 
    removeEntityByUUID: (uuid:string) => void; 
    addEntity: (entity:IGameEntity<any>) => void; 
    

    

    particles:IParticle[];

}
