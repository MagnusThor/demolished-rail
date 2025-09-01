import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { LadderEntity } from "../entities/ladderEntity";
import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { TileEntity } from "../entities/tiles/tileEntity";
import { IGameEntity } from "../interface/IGameEntity";
import { ILevelProps } from "../interface/ILevelProps";
import { Positioned } from "../interface/IPositioned";
import { getTilesByType, getTileXY } from "../utils/tileBlockHelpers";
import { TileDefinitions } from "./TileDefinitions";


export function createLevelEntities(levelProps: ILevelProps): IGameEntity<any>[] {
    const entities: IGameEntity<any>[] = [];

    // Create the main tile entity
    const tileEntity = new TileEntity(levelProps);
    tileEntity.onInit!(tileEntity);
    entities.push(tileEntity);


    Object.keys(TileDefinitions).forEach(key => {
        const definition = TileDefinitions[key];
        const tilesOfType = getTilesByType(levelProps.tileMap, parseInt(key));

        if (definition && definition.creator) {
            const result = tilesOfType.map(tile => {
                return definition.creator!(levelProps, tile);
            });
            entities.push(...result);
        }
    });

    return entities;
}
