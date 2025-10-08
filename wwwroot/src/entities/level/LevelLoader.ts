import { tileSettingsFactory } from "../../creators/tileCreators";
import { ILevelData, ILevelMetadata } from "../../designer/DesignerApp";
import { ILevelGraph } from "../../interface/ILevelGraph";
import { ITileSettings } from "../../interface/ITileSettings";




/**
 * Handles loading and processing of level data for the game.
 *
 * The `LevelLoader` class provides methods to asynchronously load level data from a specified resource,
 * retrieve the tile map, and generate tile settings using factory functions.
 *
 * @remarks
 * - Use {@link load} to fetch and assign level data.
 * - Use {@link getTileMap} to access the level's tile map.
 * - Use {@link generateTileSettings} to create tile settings from serialized data.
 *
 * @example
 * ```typescript
 * const loader = new LevelLoader();
 * await loader.load('levels/level1.json');
 * const map = loader.getTileMap();
 * const settings = loader.generateTileSettings();
 * ```
 */
export class LevelLoader {
    levelData: ILevelData | undefined;

    constructor() {
    }

    getMetaData():ILevelMetadata {
        return this.levelData?.metadata!
    }

    getLevelGraph():ILevelGraph{
        return {
            name:this.levelData?.metadata.name!,
            tiles: this.getTileMap()!,
            settings: this.generateTileSettings(),
            metadata: this.levelData?.metadata!
        }
    } 

    /**
     * Asynchronously loads level data from the specified URL and assigns it to the instance.
     *
     * @param level - The URL or path to the level data resource.
     * @returns A promise that resolves to `true` when the level data has been successfully loaded and assigned.
     */
    async load(level: string): Promise<boolean> {

        const response = await fetch(level);
        const levelData = await response.json() as ILevelData;

        this.levelData = levelData;

        return true;

    }

    /**
     * Retrieves the tile map for the current level.
     *
     * @returns {number[][] | undefined} A two-dimensional array representing the tile map,
     * or `undefined` if the level data is not available.
     */
    getTileMap(): number[][] | undefined {
        return this.levelData?.map;
    }


    /**
     * Generates an array of `ITileSettings` objects based on the serialized settings from `levelData`.
     * 
     * Iterates over each setting in `levelData.settings`, uses the corresponding factory function from
     * `tileSettingsFactory` (based on the `action` property), and constructs the tile settings.
     * If an unknown action is encountered, a warning is logged.
     * 
     * @returns {ITileSettings[]} An array of generated tile settings.
     */
    generateTileSettings(): ITileSettings[] {
        const tileSettings: ITileSettings[] = [];

        const serializedSettings = this.levelData?.settings;
        if (!serializedSettings) return tileSettings;

        Object.values(serializedSettings).forEach(setting => {

            const fn = tileSettingsFactory[setting.action as keyof typeof tileSettingsFactory];


            if (fn) {
                // let the creator build the ITileSettings
                const tileSetting = fn(setting.props);
                tileSettings.push(tileSetting);
            } else {
                console.warn(`Unknown tile creator: ${setting.action}`);
            }
        });

        return tileSettings;
    }


}
