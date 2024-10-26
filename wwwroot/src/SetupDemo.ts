import { Entity } from "../../src/Engine/entity";
import { AssetsHelper } from "../../src/Engine/Helpers/assetsHelper";
import { Scene } from "../../src/Engine/scene";
import { Sequence } from "../../src/Engine/sequence";
import { ShaderEntity } from "../../src/Engine/shaderEntity";



export class SetupDemo {
    sequence: Sequence;
    scenes: Scene[] = [];
    settings = {
        width: 800,
        height: 450,
        audioProperties: {
            bpm: 110,
            ticks: 8,
            beat: 0,
            tick: 0,
            bar: 0,
            avgFreq: 0
        },
        font: "Big Shoulders Stencil Text"
    };
    constructor() {
        this.sequence = new Sequence(
            document.querySelector("canvas") as HTMLCanvasElement,
            100, 4, 4, [], "/wwwroot/assets/music/music.mp3");

    }
    async addAssets(...urls: string[]) {
        await AssetsHelper.loadImages(urls);
        return this;
    }
    addScene(scene: Scene) {
        this.sequence.addScene(scene);
    }
    addEntity<T>(key: string, entity: Entity<T> | ShaderEntity) {
        const scene = this.scenes.find(pre => {
            return pre.name === key;
        });
        if (scene) {
            scene.addEntity(entity);
        } else throw Error("No such scene");
    }

}