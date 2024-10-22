"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureCacheHelper = void 0;
class TextureCacheHelper {
    static loadImage(url) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    static loadImages(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            const imagePromises = urls.map(url => this.loadImage(url));
            return Promise.all(imagePromises);
        });
    }
}
exports.TextureCacheHelper = TextureCacheHelper;
TextureCacheHelper.textureCache = new Map();
