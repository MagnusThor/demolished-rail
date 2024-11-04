export interface IWgslTexture {
    key: string
    source: string |MediaStream
    sampler?: any
    type: WgslTextureType
  
}

export enum WgslTextureType{
    IMAGE = 0,
    VIDEO = 1,
    CANVAS = 2,
    MEDIASTREAM = 3
}