import { IGameEntityBase } from "../../interface/IGameEntity";
import { TriggerZoneEntity } from "./triggerZoneEntity";

/**
 * Interface for the properties of a TriggerZone.
 *
 * @prop {() => void} onTrigger - The function to call when the zone is entered.
 * @prop {boolean} isOneShot - If true, the trigger will only fire once.
 */



export interface ITriggerZoneProps extends IGameEntityBase {
    onTrigger: (self: TriggerZoneEntity) => void;
    onLeave?: (self: any) => void;

}
