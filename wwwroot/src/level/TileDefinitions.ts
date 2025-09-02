import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { ILadderProps, LadderEntity } from "../entities/ladderEntity";
import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ILevelProps";
import { Positioned } from "../interface/IPositioned";
import { getTileXY } from "../utils/tileBlockHelpers";





export const TileDefinitions: { [key: string]: ITileProps; } = {
    // Empty space, no collision
    0: {
        width: 32,
        height: 32,
        isSolid: false,
      
    },

    // Solid wall or block, collidable
    1: {
        width: 32,
        height: 32,
        texture: "solid",
        isSolid: true,
        
    },

    // Water tile
    2: {
        width: 32,
        height: 32,
        isSolid: false,
        texture:"solid"
    },
    // platform
    3: {
        width: 32,
        height: 16,
        texture: "platform",
        isSolid: false,
        creator: (levelProps,tile) => {
               return new PlatformEntity(tile, levelProps, levelProps.textures!["platform"]);
        }
    },
      5: {
        width: 16,
        height: 64,
        texture: "pilar",
        isSolid: true,
      
    },
    6:{
        width:16,
        height:16,
        texture:"stone",
        isSolid:true
    },
    7: {
        width: 112,
        height: 224,
        isSolid:true,
        texture:"valley"
    },
    // Ladder
    42: {
        width: 15,
        height: 15,
        texture: "ladder",
        isSolid: true,
        creator: (levelProps,tile:IPoint2D) => {
                const texture = levelProps.textures!["ladder"];
                 const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)
                  return new LadderEntity({
                    ...levelProps,
                      width:32,
                      height:32,
                      positioned: new Positioned(x,y,32,32),
                      isInitialized:false,
                      texture:texture,
                      zIndex:1,
                      states:{}
                   });

        }
    },

    // Crate tile, can be destroyed
    40: {
        width: 32,
        height: 32,
        texture: "solid",
        isSolid: false,
        creator: (levelProps, tile )=> {
              const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
                    return {
                        ...new CollectibleEntity(tile.x, tile.y),
                        props: {
                            ...new CollectibleEntity(tile.x, tile.y).props,
                            positioned: new Positioned(x, y, 16, 16)
                        }
                    };
        }
    },
  
    // Collectible item or coin
    50: {
        width: 32,
        height: 32,
        isSolid: false
    },
    // Player spawn point
    99: {
        width: 32,
        height: 32,
        texture: "player",
        isSolid: false
    }
};
