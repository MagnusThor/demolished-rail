import { ICollisionResult } from "../interface/ICollisionResult";
import { IGameEntity } from "../interface/IGameEntity";

// Use an enum for type-safe collision topics

export interface IEntityEventDescriptor {
        action: (self: IGameEntity<any>, collisionResult?: ICollisionResult | ICollisionResult[]) => void;
        numberOfInvokes: number;
        maxNumberOfInvokes?: number;
        type: "infinity" | "once" | "many";
}
