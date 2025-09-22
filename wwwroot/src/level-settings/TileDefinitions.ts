import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { BeamEntity } from "../entities/beams/beamEntity";
import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { ILadderProps, LadderEntity } from "../entities/ladderEntity";
import { TextOverlayManager } from "../entities/overlaytext/TextOverManager";

import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { RopeEntity } from "../entities/platform/RopeEntity";
import { InteractableEntity } from "../entities/triggerzone/InteractableEntity";
import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";

import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps, ITileSettings } from "../interface/ILevelProps";
import { Positioned } from "../interface/IPositioned";
import { getTileXY } from "../utils/tileBlockHelpers";
import { LEVEL_SAMPLE } from "./LEVEL_SAMPLE";


export function findPosition(level: string | any[], target: any) {
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x] === target) {
        return { x, y };
      }
    }
  }
  return null; // not found
}

export function findAllPositions(level: string | any[], target: number) {
  const results = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x] === target) {
        results.push({ x, y });
      }
    }
  }
  return results;
}



const firstTileOfType0xa1 = findPosition(LEVEL_SAMPLE,0xa1)!;


export const TileSettingBags:ITileSettings[]  =  [
    {
        tileIndex:66,
        x: firstTileOfType0xa1.x,
        y: firstTileOfType0xa1.y,
        bag: {
            textId:"welcome_message"
        }

    }
]

export function getSettigsBag(tileIndex: number, x: number, y: number) {
    return TileSettingBags.find(pre => pre.tileIndex === tileIndex );
    // && pre.x === x && pre.y === y
}



export const TileDefinitions: { [key: string]: ITileProps; } = {
    // Empty space, no collision
    0x00: {
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator:false,
        zIndex:1
      
    },

   
    0x01: {
        width: 32,
        height: 32,
        texture: "solid-1",
        isSolid: true,      
        useLevelCreator:true,  
        zIndex:1  
    },



    0x02: {
        width: 32,
        height: 16,
        isSolid: false,
        texture:"bush-1",
        offset: {
            x:0,
            y:0
        },

        useLevelCreator:true,
        zIndex:100
    },

    0x03: {
        width: 32,
        height: 32,
        isSolid: true,
        texture:"solid-3",
        useLevelCreator:true,
        zIndex:1
        
    },

     0x04: {
        width: 32,
        height: 32,
        isSolid: true,
        texture:"solid-4",
        useLevelCreator:true,
        zIndex:1
    },

    0x05: {
        width: 63,
        height: 28,
        isSolid: false,
        texture:"bush-2",
        offset: {
            x:0,
            y:0
        },

        useLevelCreator:true,
        zIndex:2
    },
    
    // platform

    0x30: {
        width: 32,
        height: 16,
        texture: "platform-1",
        isSolid: false,
        creator: (levelProps,tile) => {
               return new PlatformEntity(tile, levelProps, levelProps.textures!["platform-1"]);
        },
        useLevelCreator:false,
        zIndex:1
    },

    0x50: {
        width: 16,
        height: 64,
        texture: "pilar-1",
        isSolid: true,
        useLevelCreator:true,
        zIndex:1
        
    },

    0x51: {
        width: 64,
        height: 64,
        isSolid:true,
        texture:"bigblock-1",
        useLevelCreator:true,
        zIndex:1
    },


    0x61:{
        width:16,
        height:16,
        texture:"stone-1",
        isSolid:true,
        useLevelCreator:true,
        zIndex:1
    },
    0x62:{
        width:16,
        height:16,
        texture:"stone-2",
        isSolid:true,
        useLevelCreator:true,
        zIndex:1
    },
    0x63:{
        width:16,
        height:16,
        texture:"stone-3",
        isSolid:true,
        useLevelCreator:true,
        zIndex:1
    },

    0x64:{
        width:16,
        height:16,
        texture:"stone-4",
        isSolid:true,
        useLevelCreator:true,
        zIndex:1
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

        },
        useLevelCreator:false,
        zIndex:1
    },
    0x43: {
        width: 16,
        height: 16,
        texture: "rope",
        isSolid: false,
        creator: (levelProps,tile:IPoint2D) => {
                 const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)
                 return new RopeEntity(x, y, 100, 80);
        },
        useLevelCreator:false,
        zIndex:1
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
        },
        useLevelCreator:false,
        zIndex:1
    },  

    0xa1: {
            width:32,
            height:32,
            isSolid: false,
             creator: (levelProps, tile )=> {

              const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
                    return new BeamEntity(x,y+16,-1);
        },
        useLevelCreator:false,
        zIndex:1
    },

   0x80: {
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator: false,
        creator: (levelProps, tile) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
            const tileSettings = getSettigsBag(66,tile.x,tile.y);

            console.log("tileSettings",tileSettings)

            const textId = tileSettings?.bag["textId"];

            return new TriggerZoneEntity({
                ...levelProps,
                positioned: new Positioned(x, y, 32, 32),
                isInitialized: false,
                onTrigger: () => {
                    // Trigger the TextOverlayManager to show the text
                    if (textId) {
                        TextOverlayManager.getInstance().showText(textId);
                    }
                },
                onLeave: () => {
                    // Trigger the TextOverlayManager to hide the text
                    TextOverlayManager.getInstance().hideText();
                },
                states: {},
                settings: tileSettings

                
            });
        },
        zIndex: 1
    },

    0x90: {
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator: false,
        zIndex: 1,
        creator: (levelProps, tile) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
            return new InteractableEntity({
                positioned: new Positioned(x, y, 32, 32),
                zIndex:10,
                isInitialized: true,
                states: {},
                isCollidable:false,
                gravity:0.5,
                velY:0,
                velX:0,
                rotation:0,
                rotationSpeed:10

            });
        }
    },


    // Player spawn point
    0xff: {
        width: 32,
        height: 32,
        texture: "player",
        isSolid: false,
        useLevelCreator: false,
        zIndex:10
    }
};
