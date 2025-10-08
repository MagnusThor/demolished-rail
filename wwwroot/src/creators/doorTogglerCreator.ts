import { TriggerZoneEntity } from "../entities/triggerzone/triggerZoneEntity";
import { ITileSettings } from "../interface/ITileSettings";
import { GameState } from "../global/GameState";
import { getTileRowCol } from "../utils/tileEntityHelpers";



const doorTimers: Map<string, NodeJS.Timeout> = new Map();



/**
 * Factory function that creates a tile settings object for toggling a door's state
 * (open/closed) in the level tile map. The returned object includes an `activate`
 * method that handles the logic for opening or closing the door at specified coordinates,
 * optionally with a timed auto-close feature.
 *
 * @param bag - An object containing configuration for the door toggler, including:
 *   - `x`, `y`: The coordinates of the toggler entity.
 *   - `doorX`, `doorY`: The coordinates of the door to be toggled.
 *   - `closedTileType`: The tile type representing a closed door.
 *   - `openTileType`: The tile type representing an open door.
 *   - `durationInSeconds` (optional): Time in seconds before the door auto-closes.
 * @returns An object implementing `ITileSettings` with an `activate` method for toggling the door.
 *
 * @remarks
 * - If the door is already in a timed state, activation is skipped.
 * - If the door is opened with a duration, it will automatically close after the specified time.
 * - Manual activation on an open door will close it and clear any auto-close timer.
 * - Logs actions and warnings to the console for debugging.
 */
export const doorTogglerCreator = (bag: any): ITileSettings => {
    return {

        bag: bag,
        x: bag.x,
        y: bag.y,
        /**
         * Toggles a door's state between open and closed based on the settings
         * provided to the factory function.
         * @param self The TriggerZoneEntity that activated this creator.
         */
        activate: (self: TriggerZoneEntity) => {
            const settings = bag;
          
            if (!settings) {
                console.error("DoorTogglerCreator: settings object not found.");
                return;
            }

            const { doorX, doorY, closedTileType, openTileType, durationInSeconds } = settings;

            // Ensure the game state and level entity are available.
            const levelEntity = GameState.getInstance().currentLevel;
            if (!levelEntity || typeof levelEntity.updateTileAt !== 'function') {
                console.error("LevelEntity not found or updateTileAt method is missing.");
                return;
            }

            const tileMap = levelEntity.props.tileMap;

            // Convert world coordinates to tile map row and column.
            const { row, col } = getTileRowCol({ x: doorX, y: doorY }, 32, 32);

            // Check if the door coordinates are valid within the map.
            if (row < 0 || row >= tileMap.length || col < 0 || col >= tileMap[0].length) {
                console.error(`Door coordinates (${col}, ${row}) are out of map bounds.`);
                return;
            }
            
            const currentDoorTile = tileMap[row][col];
            const doorKey = `${col},${row}`;

            // If a timer is already running for this door, skip the activation logic.
            if (doorTimers.has(doorKey)) {
                console.log(`Door at (${col}, ${row}) is already in a timed state. Skipping action.`);
                return;
            }

            if (currentDoorTile === closedTileType) {
                // Open the door
                levelEntity.updateTileAt(row, col, openTileType);
                console.log(`A distant door at (${col}, ${row}) has opened.`);

                // Set a new timer to close the door if a duration is specified
                if (typeof durationInSeconds === 'number' && durationInSeconds > 0) {
                    const timerId = setTimeout(() => {
                        levelEntity.updateTileAt(row, col, closedTileType);
                        console.log(`The door at (${col}, ${row}) has automatically closed.`);
                        doorTimers.delete(doorKey);
                    }, durationInSeconds * 1000);
                    doorTimers.set(doorKey, timerId);
                }
            } else if (currentDoorTile === openTileType) {
                // If the door is already open, and we activate it, we close it manually
                levelEntity.updateTileAt(row, col, closedTileType);
                console.log(`The distant door at (${col}, ${row}) has closed manually.`);
                // Clear the auto-close timer since the door was closed manually
                if (doorTimers.has(doorKey)) {
                    clearTimeout(doorTimers.get(doorKey)!);
                    doorTimers.delete(doorKey);
                }
            } else {
                console.warn(`No door to toggle at (${col}, ${row}).`);
            }
        },
    };
};