import { IGameAsset } from "../interface/IGameAsset";


export interface IGameAssetResouce {
        key: string,
        url: string,
        kind?: string
}

export const GameAssetsToPreload = [
    { key: "player_idle", url: "/wwwroot/assets/images/sprites/player_idle_10f.png" },
  
    { key: "player_walk", url: "/wwwroot/assets/images/sprites/player_run_10f.png" },
    { key: "player_jump", url: "/wwwroot/assets/images/sprites/player_jump_10f.png" },
    { key: "player_climb", url: "/wwwroot/assets/images/sprites/player_climb_10f.png" },
    
    { key: "player_attack", url: "/wwwroot/assets/images/sprites/player_attack_10f.png" },
    { key: "player_jump-attack", url: "/wwwroot/assets/images/sprites/player_jump-attack_10f.png" },
    
 
    
    { key: "enemy-1-idle", url: "/wwwroot/assets/images/sprites/enemy-1/Idle.png" },
    { key: "enemy-1-walk", url: "/wwwroot/assets/images/sprites/enemy-1/Walk.png" },   
    { key: "enemy-1-attack", url: "/wwwroot/assets/images/sprites/enemy-1/Attack.png" },
   
    { key: "tileset_1", url: "/wwwroot/assets/images/tilesets/Inca_front_by_Kronbits-extended.png" },

    { key: "dev_tiles", url: "/wwwroot/assets/images/tilesets/dev_tile.png" },
    { key: "bush-1", url: "/wwwroot/assets/images/tilesets/bush-1.png" },
    { key: "bush-2", url: "/wwwroot/assets/images/tilesets/bush-2.png" },
    { key: "coin", url: "/wwwroot/assets/images/sprites/spritesheet_coin.png" },
   
    { key: "backgroundlayer_1", url: "/wwwroot/assets/images/backgrounds/1.png" },

    { key: "backgroundlayer_2", url: "/wwwroot/assets/images/backgrounds/2.png" },

    { key: "backgroundlayer_3", url: "/wwwroot/assets/images/backgrounds/3.png" }

];
