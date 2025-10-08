import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";
import { IGameEntity } from "./IGameEntity";


export interface ITileSettingsBag {
        [key: string]: any;
}

export interface ITileSettings {
    x: number;
    y: number;
    bag: ITileSettingsBag;
    activate?: (self: TriggerZoneEntity, other?: IGameEntity<any>, settingsBag?: ITileSettingsBag) => void;
    deactivate?: (self: TriggerZoneEntity, other?: IGameEntity<any>, settingsBag?: ITileSettingsBag) => void;
    maxNumberOfHits?: number;

}
