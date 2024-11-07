import { IAudioLoader } from '../../src/Engine/Audio/AudioLoader';
import { Entity } from '../../src/Engine/Entity';
import { GLSLShaderEntity } from '../../src/Engine/GLSLShaderEntity';
import { AssetsHelper } from '../../src/Engine/Helpers/AssetsHelper';
import { Scene } from '../../src/Engine/Scene';
import { Sequence } from '../../src/Engine/Sequence';

export class SetupDemo {
    sequence: Sequence;
    scenes: Scene[] = [];
    settings = {
        width: 800,
        height: 450,
        audioProperties: {
            bpm: 110,
            ticks: 4,
            beat: 0,
            tick: 0,
            bar: 0,
            avgFreq: 0
        },
        font: "Big Shoulders Stencil Text"
    };
    constructor(audioLoader:IAudioLoader) {
        this.sequence = new Sequence(
            document.querySelector("canvas") as HTMLCanvasElement,
            110, 4, 4,audioLoader);

    }

    async initialize(){
        return this.sequence.initialize();
    }    

    async addAssets(...urls: string[]) {
        await AssetsHelper.loadImages(urls);
        return this;
    }
    addScene(scene: Scene) {
        this.sequence.addScene(scene);
    }
    addEntity<T>(key: string, entity: Entity<T> | GLSLShaderEntity) {
        const scene = this.scenes.find(pre => {
            return pre.name === key;
        });
        if (scene) {
            scene.addEntity(entity);
        } else throw Error("No such scene");
    }

}
