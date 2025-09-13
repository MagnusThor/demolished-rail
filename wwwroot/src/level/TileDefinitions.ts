import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { ILadderProps, LadderEntity } from "../entities/ladderEntity";
import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { RopeEntity } from "../entities/platform/RopeEntity";
import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ILevelProps";
import { Positioned } from "../interface/IPositioned";
import { getTileXY } from "../utils/tileBlockHelpers";





export const TileDefinitions: { [key: string]: ITileProps; } = {
    // Empty space, no collision
    0x00: {
        width: 32,
        height: 32,
        isSolid: false,
      
    },

    // Solid wall or block, collidable
    0x01: {
        width: 32,
        height: 32,
        texture: "solid-4",
        isSolid: true,        
    },



    0x02: {
        width: 32,
        height: 32,
        isSolid: true,
        texture:"solid-1"
    },

    0x03: {
        width: 32,
        height: 32,
        isSolid: true,
        texture:"solid-2"
    },

     0x04: {
        width: 32,
        height: 32,
        isSolid: true,
        texture:"solid-3"
    },
    
    // platform

    0x30: {
        width: 32,
        height: 16,
        texture: "platform-1",
        isSolid: false,
        creator: (levelProps,tile) => {
               return new PlatformEntity(tile, levelProps, levelProps.textures!["platform-1"]);
        }
    },

    0x50: {
        width: 16,
        height: 64,
        texture: "pilar-1",
        isSolid: true,
        
    },

    0x51: {
        width: 64,
        height: 64,
        isSolid:true,
        texture:"bigblock-1"
    },


    0x61:{
        width:16,
        height:16,
        texture:"stone-1",
        isSolid:true
    },
    0x62:{
        width:16,
        height:16,
        texture:"stone-2",
        isSolid:true
    },
    0x63:{
        width:16,
        height:16,
        texture:"stone-3",
        isSolid:true
    },

    0x64:{
        width:16,
        height:16,
        texture:"stone-4",
        isSolid:true
    },

       
    // Ladder
    0x42: {
        width: 15,
        height: 15,
        texture: "ladder-1",
        isSolid: true,
        creator: (levelProps,tile:IPoint2D) => {
                const texture = levelProps.textures!["ladder-1"];
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
    0x43: {
        width: 16,
        height: 16,
        texture: "rope",
        isSolid: false,
        creator: (levelProps,tile:IPoint2D) => {
                 const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)
                 return new RopeEntity(x, y, 100, Math.PI / 3,30);
        }
    },

  
    0x70: {
        width: 32,
        height: 32,
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
   
    // Player spawn point
    0xff: {
        width: 32,
        height: 32,
        texture: "player",
        isSolid: false
    }
};
