
export interface IWGSLTextureData {
    type: number
    data: GPUTexture | HTMLVideoElement | HTMLImageElement
    key: string
}

export interface IWGSLTexture {
    key: string
    source: string | MediaStream
    sampler?: any
    type: WGSLTextureType
}

export enum WGSLTextureType {
    IMAGE = 0,
    VIDEO = 1,
    CANVAS = 2,
    MEDIASTREAM = 3
}


/**
 * A helper class for loading and creating textures for WebGPU.
 */
export class WGSLTextureLoader {

    /**
     * Loads an array of textures and returns an array of ITextureData.
     * @param device - The GPUDevice to use for creating textures.
     * @param textures - An array of ITexture objects.
     * @returns A Promise that resolves to an array of ITextureData.
     */
    static async loadAll(device: GPUDevice, ...textures: IWGSLTexture[]): Promise<IWGSLTextureData[]> {
        return Promise.all(textures.map(async texture => {
            if (texture.type === 0) {
                return {                 
                    type: WGSLTextureType.IMAGE, data: await this.createImageTexture(device, texture),key: texture.key };
            } else {
                return { type: WGSLTextureType.VIDEO, data: await this.createVideoTexture(device, texture),key:texture.key };
            }
        }));
    }

    /**
     * Creates a GPUTexture from an image.
     * @param device - The GPUDevice to use for creating the texture.
     * @param texture - The ITexture object containing the image source.
     * @returns A Promise that resolves to the created GPUTexture.
     */
    static async createImageTexture(device: GPUDevice, texture: IWGSLTexture): Promise<GPUTexture> {
        const image = new Image();
        image.src = texture.source as string;
        await image.decode();

        const imageBitmap = await createImageBitmap(image);
        const textureSize = { width: image.width, height: image.height };

        const gpuTexture = device.createTexture({
            label: texture.key,
            size: textureSize,
            dimension: '2d',
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: gpuTexture, mipLevel: 0 },
            textureSize
        );

        return gpuTexture;
    }

    /**
     * Creates a HTMLVideoElement for video textures.
     * @param device - The GPUDevice.
     * @param texture - The ITexture object containing the video source.
     * @returns A Promise that resolves to the HTMLVideoElement.
     */
    static async createVideoTexture(device: GPUDevice, texture: IWGSLTexture): Promise<HTMLVideoElement> {
        const video = document.createElement("video") as HTMLVideoElement;
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        if (texture.source instanceof MediaStream) {
            video.srcObject = texture.source;
        } else {
            video.src = texture.source as string;
        }
        await video.play();
        return video;
    }
}