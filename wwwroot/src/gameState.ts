import { IEntity, ICompositeEntity, InputHelper } from "../../src";
import { IDynamicEntity } from "./interface/IDynamicEntity";
import { IGameEntity } from "./interface/IGameEntity";
import { IGameState } from "./interface/IGameState";
import { GameAssetsManager } from "./utils/GameAssets";

/**
 * The global game state object.
 * All game components can access and modify this object to share data.
 */

export const gameState: IGameState = {
    input:undefined,
    viewport: {
        x: 0,
        y: 0,
        viewportWidth: 0,
        viewportHeight: 0,
    },
    worldWidth: 0, // The width of the game world
    worldHeight: 0, // The height of the game world
    // The entities array is initialized here
    entities: [],
    dynamicEntities: [], // New dedicated list for bullets
    player : undefined,
    removeEntityByUUID: (uuid: string) => {
        const index = gameState.entities.findIndex(e => e.uuid === uuid);
        if (index !== -1) {
            gameState.entities.splice(index, 1);
            console.log(`Entity removed: ${uuid}`);
        } else {
            console.log(`Entity not removed: ${uuid}`);
        }
    },

    removeDynamicEntity: (entity: IDynamicEntity<any>) => {
        const index = gameState.dynamicEntities.findIndex(e => e.uuid === entity.uuid);
        if (index !== -1) {
            gameState.dynamicEntities.splice(index, 1);
            console.log(`Dynamic entity removed: ${entity.name} with UUID ${entity.uuid}`);
        } else {
            console.warn(`Dynamic entity with UUID ${entity.uuid} not found.`);
        }
    },
    findEntities: (name: string): IGameEntity<any>[] => {
        const foundEntities = gameState.entities.filter(entity => entity.name === name);
        const foundDynamicEntities = gameState.dynamicEntities.filter(entity => entity.name === name);
        return [...foundEntities, ...foundDynamicEntities];
    }
};
export const gameAssets = new GameAssetsManager();
