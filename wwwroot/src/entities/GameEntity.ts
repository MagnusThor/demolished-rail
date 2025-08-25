import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollisionDetector } from "../../interface/ICollisionDetector";
import { IGameEntity } from "../../interface/IGameEntity";




export class GameEntity<T> implements IGameEntity<T> {
    collisionDetectors?: ICollisionDetector[] | undefined;

    key: string;
    getBoundingBox?: ((self: IGameEntity<T>) => IBoundingBox) | undefined;

    uuid: string;

    constructor(public name: string, public props: T) {
        this.uuid = crypto.randomUUID();
        this.key = name;

    }

}
