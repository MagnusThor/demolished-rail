
/**
 * Defines the shape of the game state object.
 * This is the central repository for all game-wide data.
 */

import { InputHelper, Sequence } from "../../../src";
import { IGameEntity } from "./IGameEntity";
import { IViewport } from "./IViewport";
import { IPlayerProps } from "./IPlayerProps";
import { IParticle } from "./IParticle";
import { LevelEntityRenderer } from "../entities/level/LevelEntityRenderer";
import { IViewportState } from "./IViewportState";
import { IBoundingBox } from "./IBoundingBox";


export interface IGameState {



    sequence?: Sequence,
    ctx: CanvasRenderingContext2D | undefined
    viewport: IViewport;
    input: InputHelper | undefined
    gameCanvas?: HTMLCanvasElement
    player?: IGameEntity<IPlayerProps>;
    worldWidth: number;
    worldHeight: number;


    entities: IGameEntity<any>[];
    particles: IParticle[];

    worldToViewport(bbox: IBoundingBox): IBoundingBox;


    findEntities(key: string): IGameEntity<any>[];
    removeEntityByUUID: (uuid: string) => void;
    addEntity: (entity: IGameEntity<any>) => void;

    get currentLevel(): LevelEntityRenderer



}
