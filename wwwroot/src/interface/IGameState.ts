
/**
 * Defines the shape of the game state object.
 * This is the central repository for all game-wide data.
 */

import { IEntity, InputHelper } from "../../../src";
import { IBulletProps } from "./IBulletProps";

import { IGameEntity } from "./IGameEntity";
import { IDynamicEntity } from "./IDynamicEntity";
import { IViewport } from "./IViewport";
import { IPlayerProps } from "./IPlayerProps";

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

    // An array to hold all the game entities, like the player, tiles, and enemies.
    // This allows for a generic update and draw loop.
    entities: IGameEntity<any>[];
    dynamicEntities: IDynamicEntity<any>[]; // New dedicated list for bullets
    removeDynamicEntity: (entity: IDynamicEntity<any>) => void; // Method to remove a dynamic entity by its UUID
    findEntities(key: string): IGameEntity<any>[]; // A method to find entities by their key or name
    removeEntityByUUID: (uuid:string) => void; // Optional method to remove an entity by its UUID
}
