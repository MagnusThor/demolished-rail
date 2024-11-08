import {
  AssetsHelper,
  IAudioLoader,
  Sequence,
} from '../../src';

export class SetupDemo {
    sequence: Sequence;
    targetCanvas: HTMLCanvasElement;
    audioProperties: any;
    font: string;
   
    constructor(audioLoader:IAudioLoader) {
        this.audioProperties = {
            bpm: 110,
            ticks: 4,
            beat: 0,
            tick: 0,
            bar: 0,
            avgFreq: 0
        };
        this.font = "Big Shoulders Stencil Text";
        this.sequence = new Sequence(
            this.targetCanvas = document.querySelector("canvas") as HTMLCanvasElement,
            110, 4, 4,audioLoader);
    } 
    async addAssets(...urls: string[]) {
        await AssetsHelper.loadImages(urls);
        return this;
    }
}
