
/**
 * Represents a game asset with its associated image source and unique key.
 *
 * @property src - The HTMLImageElement representing the visual asset.
 * @property key - A unique string identifier for the asset.
 */
export interface IGameAsset {
    src: HTMLImageElement;
    key: string;
}

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




