import { ITexture } from "../ShaderRenderer/shaderRenderer";

export class AssetsHelper {

  public static textureCache = new Map<string, ITexture>();

  static async loadImage(url: string): Promise<HTMLImageElement> {

    const filename = url.split("/").pop()!;
    if (this.textureCache.has(filename)) {
      return this.textureCache.get(filename)!.src;
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

  static async loadImages(urls: string[]): Promise<HTMLImageElement[]> {
    const imagePromises = urls.map(url => this.loadImage(url));
    return Promise.all(imagePromises);
  }

  static async loadAudio(audioFile: string,audioContext:AudioContext): Promise<AudioBuffer> {
   
    const response = await fetch(audioFile);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;   

  }



}