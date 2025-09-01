import { IGameEntityBase, IGameEntityProp } from "./IGameEntity";



export interface IDynamicProps extends IGameEntityBase {
  isAlive: boolean; // Indicates if the entity should be removed from the game loop
  lifeTime: number; // The remaining life of the entity in milliseconds
}
