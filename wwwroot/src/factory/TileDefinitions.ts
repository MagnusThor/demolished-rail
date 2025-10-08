import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { BeamEntity } from "../entities/beams/beamEntity";
import { CollectibleEntity } from "../entities/collectible/CollectibleEntity";
import { ILadderProps, LadderEntity } from "../entities/ladderEntity";

import { PlatformEntity } from "../entities/platform/PlatformEntity";
import { RopeEntity } from "../entities/platform/RopeEntity";
import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";

import { IGameEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ITileProps";
import { ITileSettings } from "../interface/ITileSettings";
import { Positioned } from "../interface/IPosition2D";
import { GameState } from "../global/GameState";
import { getUnderlayingtileSettings, getTileRowCol, getTileXY } from "../utils/tileEntityHelpers";
import { bridgeCreator } from "../creators/bridgeCreator";
import { doorTogglerCreator } from "../creators/doorTogglerCreator";
import { LavaTileEntity } from "../entities/lava/LavaTileEntity";
import { EnemyChasingBehavior } from "../entities/enemy/behavior/EnemyChasingBehavior";
import { InteractableEntity } from "../entities/triggerzone/InteractableEntity";



// We extend ITileProps with optional name and color for use in the Level Designer.
// Note: Object keys are numbers, but defined in hex format for clarity.
export const TileDefinitions: { [key: number]: ITileProps  } = {
    // Empty space, no collision (Used for erasing)
    0x00: {
        id:0,
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator: false,
        zIndex: 1,
        name: "Empty (Erase)", // Name for designer
        color: '#e5e7eb' // Light gray for empty space
    },


    0x01: {
        id:1,
        width: 32,
        height: 32,
        texture: "solid-1",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Grass Block 1",
        color: '#8BC34A' // Green
    },


    0x02: {
        id:2,
        width: 32,
        height: 16,
        isSolid: false,
        texture: "bush-1",
        offset: {
            x: 0,
            y: 0
        },
        useLevelCreator: true,
        zIndex: 100,
        name: "Small Bush",
        color: '#228B22' // Forest Green
    },

    0x03: {
        id:3,
        width: 32,
        height: 32,
        isSolid: true,
        texture: "solid-3",
        useLevelCreator: true,
        zIndex: 1,
        name: "Dirt Block",
        color: '#A1887F' // Brown/Path
    },

    0x04: {
        id:4,
        width: 32,
        height: 32,
        isSolid: true,
        texture: "solid-4",
        useLevelCreator: true,
        zIndex: 1,
        name: "Stone Wall",
        color: '#424242' // Dark Gray
    },

    0x05: {
        id:5,
        width: 63,
        height: 28,
        isSolid: false,
        texture: "bush-2",
        offset: {
            x: 0,
            y: 0
        },

        useLevelCreator: true,
        zIndex: 2,
        name: "Large Bush",
        color: '#388E3C' // Darker Green
    },
        0x06:{
        id:6,
        width: 32,
        height: 32,
        isSolid: false,
        offset: {
            x: 0,
            y: 0
        },
        useLevelCreator: false,
        texture:"lava-texture-1",
        creator: (levelProps, tile) => {

          const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)

                return new LavaTileEntity({
                        isCollidable:false,
                        isInitialized:true,
                        position: new Positioned(x,y,32,32),
                        states: {},
                        zIndex:4
                })
        },
        zIndex: 2,
        name: "Lava",
        color: '#d14027ff'   
        },

    // platform

    0x30: {
        id:0x30,
        width: 32,
        height: 16,
        texture: "platform-1",
        isSolid: false,
        creator: (levelProps, tile) => {
            return new PlatformEntity(tile, levelProps, levelProps.textures!["platform-1"]);
        },
        useLevelCreator: false,
        zIndex: 1,
        name: "Moving Platform",
        color: '#BDBDBD' // Light gray/metal
    },

    0x50: {
        id:0x50,
        width: 16,
        height: 64,
        texture: "pilar-1",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Pillar",
        color: '#795548' // Brown
    },

    0x51: {
        id:0x51,
        width: 64,
        height: 64,
        isSolid: true,
        texture: "bigblock-1",
        useLevelCreator: true,
        zIndex: 1,
        name: "Big Block",
        color: '#607D8B' // Blue Gray
    },


    0x61: {
        id:0x61,
        width: 16,
        height: 16,
        texture: "stone-1",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Stone Tile 1",
        color: '#9E9E9E' // Gray
    },
    0x62: {
        id:0x62,
        width: 16,
        height: 16,
        texture: "stone-2",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Stone Tile 2",
        color: '#757575' // Darker Gray
    },
    0x63: {
        id:0x63,
        width: 16,
        height: 16,
        texture: "stone-3",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Stone Tile 3",
        color: '#616161' // Even Darker Gray
    },

    0x64: {
        id:0x64,
        width: 16,
        height: 16,
        texture: "stone-4",
        isSolid: true,
        useLevelCreator: true,
        zIndex: 1,
        name: "Stone Tile 4",
        color: '#424242' // Near Black
    },


    // Ladder
    0x42: {
        id:0x42,
        width: 15,
        height: 15,
        texture: "ladder-1",
        isSolid: true,
        creator: (levelProps, tile: IPoint2D) => {
            const texture = levelProps.textures!["ladder-1"];
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)
            return new LadderEntity({
                ...levelProps,
                width: 32,
                height: 32,
                position: new Positioned(x, y, 32, 32),
                isInitialized: false,
                texture: texture,
                zIndex: 1,
                states: {}
            });

        },
        useLevelCreator: false, 
        zIndex: 1,
        name: "Ladder",
        color: '#D2B48C' // Tan/Wood
    },
    0x43: {
        id:0x43,
        width: 16,
        height: 16,
        texture: "rope",
        isSolid: false,
        creator: (levelProps, tile: IPoint2D) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x)
            return new RopeEntity(x, y, 100, 80);
        },
        useLevelCreator: false,
        zIndex: 1,
        name: "Rope",
        color: '#8B4513' // Saddle Brown
    },


    0x70: {
        id:0x70,
        width: 32,
        height: 32,
        isSolid: false,
        creator: (levelProps, tile) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
                
                return new CollectibleEntity(x,y);

        },
        useLevelCreator: false,
        zIndex: 1,
        name: "Collectible",
        color: '#FFD700' // Gold
    },

    0xa1: {
        id:0xa1,
        width: 32,
        height: 32,
        isSolid: false,
        creator: (levelProps, tile) => {

            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
            return new BeamEntity(x, y + 16, -1);
        },
        useLevelCreator: false,
        zIndex: 1,
        name: "Beam (Projectile)",
        color: '#FF00FF' // Magenta
    },

    0x80: {
        id:0x80,
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator: false,
        creator: (levelProps, tile) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);

            const tileSettings = getUnderlayingtileSettings(levelProps.level.settings,x, y);


          
            return new TriggerZoneEntity({
                ...levelProps,
                position: new Positioned(x, y, 32, 32),
                isInitialized: false,
                onTrigger: (triggerZone,tileSettings:ITileSettings) => {

                    if (tileSettings?.activate)
                        tileSettings.activate(triggerZone, GameState.getInstance().player!,tileSettings.bag)

                },
                onLeave: (triggerZone) => {
                    if (tileSettings?.deactivate)
                        tileSettings.deactivate(triggerZone,GameState.getInstance().player!,tileSettings.bag);
                },
                states: {},
                settings: tileSettings


            });
        },
        zIndex: 1,
        name: "Trigger Zone",
        color: '#2196F3' // Blue/Water
    },

    0x90: {
        id:0x90,
        width: 32,
        height: 32,
        isSolid: false,
        useLevelCreator: false,
        zIndex: 1,
        creator: (levelProps, tile) => {
            const { x, y } = getTileXY(levelProps.tileMap, tile.y, tile.x);
            return new InteractableEntity({
                position: new Positioned(x, y, 32, 32),
                zIndex: 10,
                isInitialized: true,
                states: {},
                isCollidable: false,
                gravity: 0.5,
                velY: 0,
                velX: 0,
                rotation: 0,
                rotationSpeed: 10

            });
        }
    },


    // Player spawn point
    0xff: {
        id:0xff,
        width: 32,
        height: 32,
        texture: "player",
        isSolid: false,
        useLevelCreator: false,
        zIndex: 10,
        name: "Player Spawn",
        color: '#FF5722' // Orange/Player
    }
};
