import { Scene } from "./scene";



export class SequencerBase {
    public durationMs: number = 0;
    public scenes: Scene[] = [];
    public currentSceneIndex: number = 0;
    public isPlaying: boolean = false;
    public requestAnimationFrameID!: number;

    constructor(scenes?: Scene[]) {
        this.scenes = scenes || [];
    }
}
