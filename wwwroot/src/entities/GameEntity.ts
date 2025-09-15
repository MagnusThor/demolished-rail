import { IGameEntity } from "../../../src/Engine/Entity/CompositeEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { ICollisionDetector } from "../interface/ICollisionDetector";
import { IGameEntityBase } from "../interface/IGameEntity";
import { StateHelper } from "./StateHelper";




export class GameEntity<T extends IGameEntityBase> implements IGameEntity<T> {
    collisionDetectors: ICollisionDetector[]; 
    key: string;
    uuid: string
    public stateHelper: StateHelper<T>;

    public lifeTime:number;

    constructor(public name: string, public props: T,lifeTimeInMillieconds: number = Infinity) {
        this.uuid = crypto.randomUUID();
        this.key = name;
        this.lifeTime = lifeTimeInMillieconds;
        this.stateHelper = new StateHelper(props)
        this.collisionDetectors = new Array<ICollisionDetector>();
    }

    //  public getDetectorForTarget<T extends { isInitialized?: boolean | undefined; }>(entity: IGameEntity<T>, targetName: string): ICollisionDetector | undefined {
    //     return entity.collisionDetectors?.find(d => d.targetName === targetName);
    // }
    
}
