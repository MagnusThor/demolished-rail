import { ITileSettings } from "../interface/ITileSettings";
import { bridgeCreator } from "./bridgeCreator"
import { doorTogglerCreator } from "./doorTogglerCreator"
import { textCreator } from "./textCreator"
import { tunnelEntranceCreator, tunnelExitCreator } from "./tunnelEntranceCreator"

export interface ITileSettingCreator {
    [key: string]: (bag: any) => ITileSettings;
}

export const tileSettingsFactory = {
    bridgeCreator,
    textCreator,
    doorTogglerCreator,
    tunnelEntranceCreator,
    tunnelExitCreator
}

export type TileCreatorKey = keyof typeof tileSettingsFactory;

