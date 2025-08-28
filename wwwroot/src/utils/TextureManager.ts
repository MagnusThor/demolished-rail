    import { ITexture } from "../interface/ITexture";
    import { GameAssetsManager } from "./GameAssets";
import { ISpriteSheetAsset } from "./ISpriteSheetAsset";

/**
 * Creates an ITexture object by extracting a sub-image from a texture atlas.
 *
 * @param {string} assetKey The key to retrieve the texture atlas from the GameAssetsManager.
 * @param {number} srcX The x-coordinate on the source image (atlas).
 * @param {number} srcY The y-coordinate on the source image (atlas).
 * @param {number} srcWidth The width of the texture to extract.
 * @param {number} srcHeight The height of the texture to extract.
 * @param {GameAssetsManager} gameAssetsManager The manager that holds all game assets.
 * @returns {ITexture | undefined} The created ITexture object, or undefined if the asset is not found.
 */
export function createTexture(
    assetKey: string,
    srcX: number,
    srcY: number,
    srcWidth: number,
    srcHeight: number,
    gameAssetsManager: GameAssetsManager
): ITexture | undefined {
    // 1. Get the full image (the tileset) from the asset manager.
    const asset = gameAssetsManager.getAsset(assetKey);

    // 2. Check if the asset was found. If not, return undefined.
    if (!asset) {
        console.error(`Asset with key "${assetKey}" not found.`);
        return undefined;
    }

    // 3. Create a unique key for the specific texture.
    const textureKey = `${assetKey}_${srcX}_${srcY}_${srcWidth}_${srcHeight}`;

    // 4. Return the new ITexture object, conforming to the interface.
    return {
        texture: asset,
        key: textureKey,
        x: srcX,
        y: srcY,
        width: srcWidth,
        height: srcHeight,
    };
}
