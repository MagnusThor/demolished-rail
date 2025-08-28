import { IGameAsset } from "../interface/IGameAsset";

/**
 * Represents a sprite sheet asset used in the game.
 * Extends the base `IGameAsset` interface with properties specific to sprite sheets.
 *
 * @property frameWidth - The width of each individual frame in the sprite sheet, in pixels.
 * @property frameHeight - The height of each individual frame in the sprite sheet, in pixels.
 * @property columns - The number of columns in the sprite sheet grid.
 * @property rows - The number of rows in the sprite sheet grid.
 * @property frameCount - The total number of frames in the sprite sheet.
 */

export interface ISpriteSheetAsset extends IGameAsset {
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
    frameCount: number;
}
