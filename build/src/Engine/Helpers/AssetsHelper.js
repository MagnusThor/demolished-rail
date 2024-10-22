"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureCacheHelper = void 0;
class TextureCacheHelper {
    static async loadImage(url) {
        const filename = url.split("/").pop();
        if (this.textureCache.has(filename)) {
            return this.textureCache.get(filename).src;
        }
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                this.textureCache.set(filename, { src: img });
                resolve(img);
            };
            img.onerror = (error) => {
                reject(error);
            };
        });
    }
    static async loadImages(urls) {
        const imagePromises = urls.map(url => this.loadImage(url));
        return Promise.all(imagePromises);
    }
}
exports.TextureCacheHelper = TextureCacheHelper;
TextureCacheHelper.textureCache = new Map();
