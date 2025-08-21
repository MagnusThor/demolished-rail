
/**
 * Defines the shape of the game state object.
 * This is the central repository for all game-wide data.
 */

import { IEntity } from "../../../src";
import { IBulletProps } from "./IBulletProps";

import { IDynamicEntity, IGameEntity } from "./IGameEntity";
import { IViewport } from "./IViewport";

export interface IGameState {
    // The game's viewport, controlling what part of the world is visible on screen
    viewport: IViewport;

    // An array to hold all the game entities, like the player, tiles, and enemies.
    // This allows for a generic update and draw loop.
    entities: IGameEntity<any>[];
    dynamicEntities: IDynamicEntity<any>[]; // New dedicated list for bullets

    findEntities(key: string): IEntity[] | IGameEntity<any>[]; // A method to find entities by their key or name
}
