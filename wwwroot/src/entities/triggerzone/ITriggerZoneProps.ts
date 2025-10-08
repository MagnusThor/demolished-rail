import { IGameEntityBase } from "../../interface/IGameEntity";
import { ITileSettings } from "../../interface/ITileSettings";
import { TriggerZoneEntity } from "./triggerZoneEntity";

/**
 * Interface for the properties of a TriggerZone.
 *
 * @prop {() => void} onTrigger - The function to call when the zone is entered.
 * @prop {boolean} isOneShot - If true, the trigger will only fire once.
 */



export interface ITriggerZoneProps extends IGameEntityBase {
    onTrigger: (self: TriggerZoneEntity,tileSettings:ITileSettings) => void;
    onLeave?: (self: TriggerZoneEntity,tileSettings:ITileSettings) => void;

}
