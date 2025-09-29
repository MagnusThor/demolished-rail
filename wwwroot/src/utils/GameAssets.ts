
import { GameAssets } from "../global/GameAssets";
import { IGameAsset } from "../interface/IGameAsset";
import { IGameTexture } from "../interface/ITexture";
import { ISpriteSheetAsset } from "../interface/ISpriteSheetAsset";

import { IBoundingBox } from "../interface/IBoundingBox";

/**
 * Manages loading, storing, and retrieving game assets such as images and sprite sheets.
 *
 * The `GameAssetsManager` class provides methods to asynchronously load images,
 * store them with unique keys, and retrieve them for use in a game. It also supports
 * creating and managing sprite sheet assets by specifying frame dimensions and layout.
 *
 * @example
 * ```typescript
 * const manager = new GameAssetsManager();
 * await manager.loadImage('player', '/assets/player.png');
 * const playerImage = manager.getAsset('player');
 * ```
 *
 * @remarks
 * - Assets are stored in a `Map` using string keys.
 * - Sprite sheets are created from loaded images and stored as specialized assets.
 *
 * @public
 */
export class GameAssetsManager {

    public assets = new Map<string, IGameAsset>();

    /**
     * Retrieves a game asset by its key.
     *
     * @param key - The unique identifier for the asset to retrieve.
     * @returns The game asset associated with the given key, or `undefined` if no asset is found.
     */
    public getAsset(key: string): IGameAsset | undefined {
        return this.assets.get(key);
    }

    /**
     * Asynchronously loads an image from the specified URL and stores it in the asset cache.
     *
     * If the image has already been loaded (determined by its filename), returns the cached image.
     * Otherwise, creates a new `HTMLImageElement`, loads it from the URL, and caches it using the provided key.
     *
     * @param key - The unique key to associate with the loaded image in the asset cache.
     * @param url - The URL from which to load the image.
     * @returns A promise that resolves to the loaded `HTMLImageElement`.
     * @throws Will reject the promise if the image fails to load.
     */
    async loadImage(key: string, url: string): Promise<HTMLImageElement> {

        const filename = url.split("/").pop()!;
        if (this.assets.has(filename)) {
            return this.assets.get(filename)!.src;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                this.assets.set(key, { src: img, key: key });

                resolve(img);
            };

            img.onerror = (error) => {
                reject(error);
            };
        });
    }

    async loadImages(urls: { url: string, key: string }[]): Promise<HTMLImageElement[]> {
        const imagePromises = urls.map(({ key, url }) => this.loadImage(key, url));
        return Promise.all(imagePromises);
    }


    createTexture(
        assetKey: string,
        srcX: number,
        srcY: number,
        srcWidth: number,
        srcHeight: number, createImageData: boolean
    ): IGameTexture | undefined {
        const asset = this.getAsset(assetKey);

        if (!asset) {
            console.error(`Asset with key "${assetKey}" not found.`);
            return undefined;
        }

        const textureKey = `${assetKey}_${srcX}_${srcY}_${srcWidth}_${srcHeight}`;

        const properties: IGameTexture = {
            texture: asset,
            key: textureKey,
            imageData:
                createImageData ?
                    this.getTileCollisionMaskFromArt(this.getImageData(asset.src, srcX, srcY, srcWidth, srcHeight)) : undefined,
            x: srcX,
            y: srcY,
            width: srcWidth,
            height: srcHeight,
            getBoundingBox: function (): IBoundingBox {
                throw new Error("Function not implemented.");
            },
            toPoint2D() {
                throw "Not implemented"
            },
            updatePriorPosition() {
                throw "Not implemented"
            },
        };
        return properties;
    }

    getTileCollisionMaskFromArt(tileTexture: ImageData, threshold = 128): ImageData {
        const canvas = document.createElement("canvas");
        canvas.width = tileTexture.width;
        canvas.height = tileTexture.height;
        const ctx = canvas.getContext("2d")!;
        const imageData = ctx.createImageData(tileTexture.width, tileTexture.height);

        const src = tileTexture.data;
        const dst = imageData.data;

        for (let i = 0; i < src.length; i += 4) {
            const alpha = src[i + 3];
            if (alpha > threshold) {
                dst[i] = 255;     // white
                dst[i + 1] = 255;
                dst[i + 2] = 255;
                dst[i + 3] = 255; // solid
            } else {
                dst[i + 3] = 0;   // transparent
            }
        }
        return imageData;
    }


    public getImageData(image: any, x: number, y: number, w: number, h: number) {

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;

        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(
            image,
            x,
            y,
            w,
            h,
            0, 0, w, h
        );

        return tempCtx.getImageData(0, 0, w, h)

    }

    public getSpriteSheet(
        key: string,
        frameWidth: number,
        frameHeight: number,
        columns: number,
        rows: number
    ): ISpriteSheetAsset | undefined {
        const asset = this.assets.get(key);
        if (!asset) {
            console.error(`Asset with key "${key}" not found. Did you forget to load the image first?`);
            return undefined;
        }
        // Calculate the total number of frames based on columns and rows
        const frameCount = columns * rows;
        // Create the sprite sheet asset object
        const spriteSheetAsset: ISpriteSheetAsset = {
            src: asset.src, // Use the already loaded image
            key: key,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            columns: columns,
            rows: rows,
            frameCount: frameCount
        };


        this.assets.set(key, spriteSheetAsset);


        return spriteSheetAsset;
    }
}




