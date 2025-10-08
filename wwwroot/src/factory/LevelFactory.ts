import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { LadderEntity } from "../entities/ladderEntity";
import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { LevelEntityRenderer  } from "../entities/level/LevelEntityRenderer";
import { IGameEntity } from "../interface/IGameEntity";
import { ILevelProps } from "../interface/ILevelProps";
import { Positioned } from "../interface/IPosition2D";
import { getTilesByType, getTileXY } from "../utils/tileEntityHelpers";
import { TileDefinitions } from "./TileDefinitions";


export function createLevelEntities(levelProps: ILevelProps): IGameEntity<any>[] {
    const entities: IGameEntity<any>[] = [];

    // Create the main tile entity
    const tileEntity = new LevelEntityRenderer (levelProps);
    tileEntity.onInit!(tileEntity);
    entities.push(tileEntity);


    Object.keys(TileDefinitions).forEach(key => {
        const definition = TileDefinitions[parseInt(key)];
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
