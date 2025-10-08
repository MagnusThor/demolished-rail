import { IGameEntity } from "../../../src/Engine/Entity/CompositeEntity";
import { IBoundingBox } from "../interface/IBoundingBox";
import { ICollisionDetector } from "../interface/ICollisionDetector";
import { IGameEntityBase } from "../interface/IGameEntity";
import { IGameState } from "../interface/IGameState";
import { GameState } from "../global/GameState";
import { getFilteredAndSortedEntities } from "../utils/collitionHelpers";
import { StateHelper } from "./StateHelper";




export abstract class GameEntity<T extends IGameEntityBase> implements IGameEntity<T> {
    collisionDetectors: ICollisionDetector[];
    key: string;
    uuid: string
    public stateHelper: StateHelper<T>;

    public lifeTime: number;

    constructor(public name: string, public props: T, lifeTimeInMillieconds: number = Infinity) {
        this.uuid = crypto.randomUUID();
        this.key = name;
        this.lifeTime = lifeTimeInMillieconds;
        this.stateHelper = new StateHelper(props)
        this.collisionDetectors = new Array<ICollisionDetector>();
    }



    

    runCollitionDetectors():void{
        
        const detectors = this.collisionDetectors;

        detectors.forEach(detector => {
            const targetEntities = getFilteredAndSortedEntities(GameState.getInstance(), this, detector.targetName)

            if (targetEntities && targetEntities.length > 0) {
                targetEntities.forEach((targetEntity: any) => {
                    const collisionResults = detector.detectorFn(this, targetEntity);
                    if (Array.isArray(collisionResults)) {
                        collisionResults.forEach(collisionData => {
                            detector.onCollision(this, collisionData, targetEntity);
                        });
                    }
                });
            }
        });
    }


}
