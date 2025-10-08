import { ITileProps } from "../interface/ITileProps";
import { ITileBlueprint } from "../interface/ITileBlueprint";

export const TILE_BLUEPRINTS: { [key: number]: ITileBlueprint  } = {
    // Empty space, no collision (Used for erasing)
    0x00: {
        id:0,
        width: 32,
        height: 32,
        zIndex: 1,
        name: "Empty (Erase)", // Name for designer
        color: '#e5e7eb' // Light gray for empty space
    },


    0x01: {
        id:1,
        width: 32,
        height: 32,
        texture: "solid-1",
  
        zIndex: 1,
        name: "Grass Block 1",
        color: '#8BC34A' // Green
    },


    0x02: {
        id:2,
        width: 32,
        height: 16,   
        texture: "bush-1",
        offset: {
            x: 0,
            y: 16
        },      
        zIndex: 100,
        name: "Small bush-1",
        color: '#228B22' // Forest Green
    },

    0x03: {
        id:3,
        width: 32,
        height: 32,

        texture: "solid-3",
        zIndex: 1,
        name: "Dirt Block",
        color: '#A1887F' // Brown/Path
    },

    0x04: {
        id:4,
        width: 32,
        height: 32,

        texture: "solid-4",

        zIndex: 1,
        name: "Stone Wall",
        color: '#424242' // Dark Gray
    },

    0x05: {
        id:5,
        width: 63,
        height: 28,

        texture: "bush-2",
        offset: {
            x: 0,
            y: 0
        },


        zIndex: 2,
        name: "Large Bush",
        color: '#388E3C' // Darker Green
    },

        0x06: {
        id:0x06,
        width: 32,
        height: 32,
        zIndex: 1,
        name: "Lava",
        color: '#d05504ff' 
    },

    // platform

    0x30: {
        id:0x30,
        width: 32,
        height: 16,
        texture: "platform-1",
      
    
        zIndex: 1,
        name: "Moving Platform",
        color: '#BDBDBD' // Light gray/metal
    },

    0x50: {
        id:0x50,
        width: 16,
        height: 64,
        texture: "pilar-1",
        zIndex: 1,
        name: "Pillar",
        color: '#795548' // Brown
    },

    0x51: {
        id:0x51,
        width: 64,
        height: 64,
        texture: "bigblock-1",
        zIndex: 1,
        name: "Big Block",
        color: '#607D8B' // Blue Gray
    },


    0x61: {
        id:0x61,
        width: 16,
        height: 16,
        texture: "stone-1",
        zIndex: 1,
        name: "Stone Tile 1",
        color: '#9E9E9E' // Gray
    },
    0x62: {
        id:0x62,
        width: 16,
        height: 16,
        texture: "stone-2",
        zIndex: 1,
        name: "Stone Tile 2",
        color: '#757575' // Darker Gray
    },
    0x63: {
        id:0x63,
        width: 16,
        height: 16,
        texture: "stone-3",
        zIndex: 1,
        name: "Stone Tile 3",
        color: '#616161' // Even Darker Gray
    },

    0x64: {
        id:0x64,
        width: 16,
        height: 16,
        texture: "stone-4",
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
        zIndex: 1,
        name: "Ladder",
        color: '#D2B48C' // Tan/Wood
    },
    0x43: {
        id:0x43,
        width: 16,
        height: 16,
        texture: "rope",
        zIndex: 1,
        name: "Rope",
        color: '#8B4513' // Saddle Brown
    },


    0x70: {
        id:0x70,
        width: 32,
        height: 32,
        zIndex: 1,
        name: "Collectible",
        color: '#FFD700' // Gold
    },

    0xa1: {
        id:0xa1,
        width: 32,
        height: 32,
        zIndex: 1,
        name: "Beam (Projectile)",
        color: '#FF00FF' // Magenta
    },

    0x80: {
        id:0x80,
        width: 32,
        height: 32,
        zIndex: 1,
        name: "Trigger Zone",
        color: '#2196F3' // Blue/Water
    },

    0x90: {
        id:0x90,
        width: 32,
        height: 32,
        zIndex: 1,
     
    },


    // Player spawn point
    0xff: {
        id:0xff,
        width: 32,
        height: 32,
        
        zIndex: 10,
        name: "Player Spawn",
        color: '#FF5722' // Orange/Player
    }
};
