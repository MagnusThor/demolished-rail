import { IGameEntityBehavior, IGameEntity } from "./IGameEntity";


export interface IPushableBehavior extends IGameEntityBehavior {
  /**
   * Attempts to push the entity in a given direction.
   * @param self The entity being pushed.
   * @param direction The normalized direction vector of the push.
   * @param gameEntities All entities in the game to check for collisions.
   * @returns True if the entity was successfully moved, otherwise false.
   */
  onPush: (
    self: IGameEntity<any>,
    direction: { x: number; y: number; },
    gameEntities: IGameEntity<any>[]
  ) => boolean;
}
