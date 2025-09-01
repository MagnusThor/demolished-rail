import { ICompositeEntity } from "../../../src";
import { IGameEntity } from "./IGameEntity";
import { IDynamicProps } from "./IDynamicProps";


export interface IDynamicEntity<P extends IDynamicProps> extends IGameEntity<P> {
  uuid: string; // Unique identifier for the entity
  onCreated?: (self: IDynamicEntity<P>) => void; // A hook for when the entity is created
  onDestroy?: (self: IDynamicEntity<P>) => void; // A hook for when the entity is destroyed
  processCollisions?: (self: IGameEntity<P>, entities: IGameEntity<any>[]) => void; // Optional method to process collisions

}
