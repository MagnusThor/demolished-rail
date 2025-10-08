import { ICamera2D } from "../camera/ICamera2D";
import { LevelEntityRenderer } from "../entities/level/LevelEntityRenderer";
import { PlayerEntity } from "../entities/player/playerEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IGameEntity } from "../interface/IGameEntity";
import { IGameState } from "../interface/IGameState";
import { IPlayerProps } from "../interface/IPlayerProps";
import { IViewportState } from "../interface/IViewportState";


export class GameState implements IGameState {
    private static _instance: GameState;


   
    private constructor() {
        // Initialize default properties here
    }
    worldToViewport(bbox: IBoundingBox): IBoundingBox {
        const viewport = GameState.getInstance().viewport;
        return {
            x: bbox.x - viewport.x,
            y: bbox.y - viewport.y,
            width: bbox.width,
            height: bbox.height
        };
    }

    public static getInstance(): GameState {
        if (!GameState._instance) {
            GameState._instance = new GameState();
        }
        return GameState._instance;
    }

    // --- Public State Properties (Implementing IGameState) ---

    public sequence: any = undefined;
    public ctx: CanvasRenderingContext2D | undefined = undefined;
    public gameCanvas?: HTMLCanvasElement | undefined;
    public input: any = undefined;
    public player: PlayerEntity | IGameEntity<IPlayerProps> | undefined

    public camera: ICamera2D | undefined;


    public viewport: IViewportState = {
        x: 0,
        y: 0,
        viewportWidth: 0,
        viewportHeight: 0,
    };
    public worldWidth: number = 0;
    public worldHeight: number = 0;
    public entities: IGameEntity<any>[] = [];
    public particles: any[] = [];

    


    public removeEntityByUUID(uuid: string): void {
        const index = this.entities.findIndex(e => e.uuid === uuid);
        if (index !== -1) {
            this.entities.splice(index, 1);
            console.log(`Entity ${uuid} removed.`);
        }
    }

    public findEntities(name: string): IGameEntity<any>[] {
        const foundEntities = this.entities.filter(entity => entity.name === name);
        return foundEntities;
    }

    public addEntity(entity: IGameEntity<any>): void {
        this.entities.push(entity);
    }
    
    
    public get currentLevel(): LevelEntityRenderer {
        const level = this.entities.find(pre => pre instanceof LevelEntityRenderer);
            if (!level) {
            throw new Error("Cannot find a LevelEntity instance in the entities list.");
        }
        return level;
    }
}


// export const GameState: IGameState = {
//     sequence: undefined,

//     ctx: undefined,
//     input: undefined,
//     viewport: {
//         x: 0,
//         y: 0,
//         viewportWidth: 0,
//         viewportHeight: 0,
//     },
//     worldWidth: 0,
//     worldHeight: 0,
//     entities: [],
//     player: undefined,
//     removeEntityByUUID: (uuid: string) => {
//         const index = GameState.entities.findIndex(e => e.uuid === uuid);
//         if (index !== -1) {
//             GameState.entities.splice(index, 1);

//         }
//     },

//     findEntities: (name: string): IGameEntity<any>[] => {
//         const foundEntities = GameState.entities.filter(entity => entity.name === name);
//         return foundEntities;
//     },

//     get currentLevel() {
//         const level = this.entities.find(pre => pre instanceof LevelEntityRenderer);
//         if (!level) throw "Cannot find a LevelEntity instance";
//         return level;
//     },

//     particles: [],

//     addEntity(entity: IGameEntity<any>): void {
//         this.entities.push(entity);
//     }
// };
