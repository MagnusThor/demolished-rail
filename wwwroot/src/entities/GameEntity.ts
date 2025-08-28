import { IGameEntity } from "../../../src/Engine/Entity/CompositeEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { ICollisionDetector } from "../interface/ICollisionDetector";




export class GameEntity<T extends { isInitialized?: boolean | undefined; }> implements IGameEntity<T> {
    collisionDetectors?: ICollisionDetector[] | undefined;


    key: string;
    getBoundingBox?: ((self: IGameEntity<T>) => IBoundingBox) | undefined;

    uuid: string;

    constructor(public name: string, public props: T) {
        this.uuid = crypto.randomUUID();
        this.key = name;

    }

     public getDetectorForTarget<T extends { isInitialized?: boolean | undefined; }>(entity: IGameEntity<T>, targetName: string): ICollisionDetector | undefined {
        return entity.collisionDetectors?.find(d => d.targetName === targetName);
    }

}
