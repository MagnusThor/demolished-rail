import { LevelEntity } from "../entities/level/levelEntity";
import { IGameEntity } from "../interface/IGameEntity";
import { IGameState } from "../interface/IGameState";

/**
 * The global game state object.
 * All game components can access and modify this object to share data.
 */

export const GameState: IGameState = {
    sequence: undefined,

    ctx: undefined,
    input: undefined,
    viewport: {
        x: 0,
        y: 0,
        viewportWidth: 0,
        viewportHeight: 0,
    },
    worldWidth: 0,
    worldHeight: 0,
    entities: [],
    player: undefined,
    removeEntityByUUID: (uuid: string) => {
        const index = GameState.entities.findIndex(e => e.uuid === uuid);
        if (index !== -1) {
            GameState.entities.splice(index, 1);

        }
    },

    findEntities: (name: string): IGameEntity<any>[] => {
        const foundEntities = GameState.entities.filter(entity => entity.name === name);
        return foundEntities;
    },

    get currentLevel() {
        const level = this.entities.find(pre => pre instanceof LevelEntity);
        if (!level) throw "Cannot find a LevelEntity instance";
        return level;
    },

    particles: [],

    addEntity(entity: IGameEntity<any>): void {
        this.entities.push(entity);
    }
};
