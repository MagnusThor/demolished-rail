import { CollectibleEntity } from "./entities/collectible/CollectibleEntity";
import { PlatformEntity } from "./entities/platform/PlatformEntity";
import { TileEntity } from "./entities/tiles/tileEntity";
import { IGameEntity } from "./interface/IGameEntity";
import { ILevelProps } from "./interface/ILevelProps";
import { Positioned } from "./interface/IPositioned";
import { getTilesByType, getTileXy } from "./utils/tileBlockHelpers";


export function createLevelEntities(levelProps: ILevelProps): IGameEntity<any>[] {
    const entities: IGameEntity<any>[] = [];

    // Create the main tile entity
    const tileEntity = new TileEntity(levelProps);
    tileEntity.onInit!(tileEntity);
    entities.push(tileEntity);

    // Create collectibles and add them to the list of entities
    const collectibles = getTilesByType(levelProps.tileMap, 4).map(tile => {
        const { x, y } = getTileXy(levelProps.tileMap, tile.y, tile.x);
        return {
            ...new CollectibleEntity(tile.x, tile.y),
            props: {
                ...new CollectibleEntity(tile.x, tile.y).props,
                positioned: new Positioned(x, y, 16, 16)
            }
        };
    });
    entities.push(...collectibles);

    // Create platforms and add them to the list of entities
    const platforms = getTilesByType(levelProps.tileMap, 3).map(tile => {
        return new PlatformEntity(tile, levelProps, levelProps.textures!["platform"]);
    });
    entities.push(...platforms);

    return entities;
}
