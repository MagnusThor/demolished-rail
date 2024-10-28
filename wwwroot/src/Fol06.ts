import { IEntity } from "../../src/Engine/entity";
import { ShaderEntity } from "../../src/Engine/shaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";
import { SetupDemo } from "./SetupDemo";
import { earthShader } from "../assets/shaders/earthShader";
import { Sequence } from "../../src/Engine/sequence";


const demo = new SetupDemo();



/**
 * The darkness at the end of time
 * a Fruit of the Loom demo
 * Released 2024
 * @class Fol06
 */
class Fol06 {
    constructor(public sequence: Sequence, public width: number, public height: number) {

    }

    introScene(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();

        

        return mapEntities;
    }

    /**
     * Create entities for Earth Scene
     *
     * @return {*}  {Map<string,IEntity>}
     * @memberof Fol06
     */
    earthScene(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const cameraPositions = [
            [0.0, 1.2, 0.7],
            [0.5, 1.0, 0.9],
            [1.0, 0.8, 1.1],
        ];
        let cameraPos = cameraPositions[0];
        const shader = new ShaderEntity("earthShader",
            {

                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: earthShader,
                        vertex: mainVertex,
                        textures: [],
                        customUniforms: {
                            "cameraPos": (uniformLoction: Map<string, WebGLUniformLocation>, gl: WebGLRenderingContext) => {
                                if (uniformLoction) { // uniform cameraPos vec3 
                                    gl.uniform3fv(uniformLoction!,
                                        cameraPos)
                                };
                            }
                        }
                    }
                ]
            }, () => {
            }, this.width, this.height);
        shader.onBar((ts: number, count: number) => {
            const positionIndex = (count) % cameraPositions.length;
            cameraPos = cameraPositions[positionIndex];
        });
        mapEntities.push(shader);
        return mapEntities
    }
}

enum SCENE {
    INTRO = 0,
    EARTH = 1
}

demo.addAssets("assets/images/silhouette.png").then((demo: SetupDemo) => {
    // Create the Scenes
    // Music length = 139200 ms;
    const fol06 = new Fol06(demo.sequence, 800, 450);

    const sceneBuilder = new SceneBuilder(139200);

    sceneBuilder
        .addScene("intro", 10000).
        durationUntilEndInMs("earth");

    const scenes = sceneBuilder.getScenes();

    scenes[SCENE.EARTH].addEntities(...fol06.earthScene())


    demo.sequence.addSceneArray(scenes)



});

demo.sequence.onReady = () => {

    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        demo.sequence.play();
    });
}



