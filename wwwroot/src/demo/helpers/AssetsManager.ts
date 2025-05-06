// assets.ts

export class AssetsManager {
    private static _instance: AssetsManager;
    public images: HTMLImageElement[] = [];

    private constructor() {}

    public static get instance(): AssetsManager {
        if (!this._instance) {
            this._instance = new AssetsManager();
        }
        return this._instance;
    }

    public async load(textures: string[]): Promise<void> {
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = (error) => {
                    console.error("Error loading image:", src, error);
                    reject(error);
                };
            });
        };

        const fetchImages = async (urls: string[]): Promise<HTMLImageElement[]> => {
            const promises = urls.map(loadImage);
            return Promise.all(promises);
        };

        this.images = await fetchImages(textures);
        console.log("Assets loaded:", this.images);
    }
}
