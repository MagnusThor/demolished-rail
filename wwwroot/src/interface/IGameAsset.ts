/**
 * Represents a game asset with its associated image source and unique key.
 *
 * @property src - The HTMLImageElement representing the visual asset.
 * @property key - A unique string identifier for the asset.
 */
export interface IGameAsset {
    data: HTMLImageElement| null | undefined;
    key: string;
    kind?: string
}
