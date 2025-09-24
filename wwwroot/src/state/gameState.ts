import { IEntity, ICompositeEntity, InputHelper } from "../../../src";
import { IGameEntity } from "../interface/IGameEntity";
import { IGameState } from "../interface/IGameState";
import { GameAssetsManager } from "../utils/GameAssets";

/**
 * The global game state object.
 * All game components can access and modify this object to share data.
 */

export const gameState: IGameState = {
    showImageDataOverlay:true,
    ctx: undefined,
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

    findEntities: (name: string): IGameEntity<any>[] => {
        const foundEntities = gameState.entities.filter(entity => entity.name === name);
        return foundEntities;
    },

    particles: [],
    
    addEntity(entity:IGameEntity<any>):void {
        this.entities.push(entity);
    }


};

// const debrisParticles: typeof DebrisHelper.DebrisParticle[] = [];
export const gameAssets = new GameAssetsManager();
