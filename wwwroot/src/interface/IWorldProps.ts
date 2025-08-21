
import { IBulletProps } from "./IBulletProps";
import { IGameEntity } from "./IGameEntity";

export interface IWorldProps {
    worldWidth: number;
    worldHeight: number;
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
    blocks: IGameEntity<any>[]; // For static entities like tiles and the player
    bullets: IGameEntity<IBulletProps>[]; // New dedicated list for bullets
}


