import { IEntity, ICompositeEntity } from "../../src";
import { IGameEntity } from "./interface/IGameEntity";
import { IGameState } from "./interface/IGameState";

/**
 * The global game state object.
 * All game components can access and modify this object to share data.
 */

export const gameState: IGameState = {
    viewport: {
        x: 0,
        y: 0,
        viewportWidth: 0,
        viewportHeight: 0,
    },
    // The entities array is initialized here
    entities: [],
    dynamicEntities: [], // New dedicated list for bullets

    findEntities: (name: string): IGameEntity<any>[] => {
        const find = (entities: IGameEntity<any>[], targetKey: string): IGameEntity<any>[] => {
            let found: IGameEntity<any>[] = [];
            for (const entity of entities) {
                if (entity.name === targetKey) {
                    found.push(entity);
                }
                if ((entity as unknown as ICompositeEntity<any>).props.blocks) {
                    found = found.concat(find((entity as unknown as IGameEntity<any>).props.blocks, targetKey));
                }
            }
            return found;
        };
        return find(gameState.entities, name);
    }
};
