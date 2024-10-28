import { Entity, IEntity } from "../../src/Engine/entity";
import { ShaderEntity } from "../../src/Engine/shaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";
import { SetupDemo } from "./SetupDemo";
import { earthShader } from "../assets/shaders/earthShader";
import { Sequence } from "../../src/Engine/sequence";
import { ITextFadeInOut, textFadeInOut } from "./effects/FoL/fadeInOutTextEffect";
import { blackholeShader } from "../assets/shaders/blackholeShader";
import { eventHorizonShader } from "../assets/shaders/eventHorizon";
import { lonlyPlanetShader } from "../assets/shaders/lonlyPlanetShader";



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


    /**
     * Create entitiesfor the intro scene
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    introScene(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const textEffectEntity = new Entity<ITextFadeInOut>("intro-text",
            {
                y: this.height / 2,
                texts: ["The darkness at the end of time".toLowerCase(), "a fruit of the loom production", "inspired by a series of books", "written by professor Ulf Danielsson"],
                font: "Montserrat",
                size: 40,
                fadeInDuration: 2,
                fadeOutDuration: 2,
                textDuration: 5
            },
            (ts, ctx, props) => textFadeInOut(ts, ctx, props, this.sequence)
        )

        mapEntities.push(textEffectEntity);

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

    /**
     * Cretate entities for the blackhole scene
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    blackhole(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();

        let zoom = 0.1;

        const shader = new ShaderEntity("earthShader",
            {

                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: blackholeShader,
                        vertex: mainVertex,
                        textures: [],
                        customUniforms: {
                            "zoom": (uniformLoction: Map<string, WebGLUniformLocation>, gl: WebGLRenderingContext) => {
                                if (uniformLoction) { // uniform cameraPos vec3 
                                    gl.uniform1f(uniformLoction!,
                                        zoom)
                                };
                            }
                        }

                    }
                ]
            }, () => {
            }, this.width, this.height);

        shader.onBar((ts: number, count) => {
            zoom *= 0.2;
        })

        mapEntities.push(shader);


        return mapEntities;
    }

    /**
     * Cretate entities for the event-horizon scene
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    eventHorizon(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();

        let zoom = 0.1;

        const shader = new ShaderEntity("eventHorizon",
            {

                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: eventHorizonShader,
                        vertex: mainVertex,
                        textures: [],
                        customUniforms: {
                        }

                    }
                ]
            }, () => {
            }, this.width, this.height);



        mapEntities.push(shader);


        return mapEntities;

    }

    /**
     * Cretate entities for the lonly planet and sun scene scene
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    lonlyPlanet(): Array<IEntity> {

        const mapEntities = new Array<IEntity>();

        let zoom = 0.1;

        const shader = new ShaderEntity("lonley-planet-shader",
            {

                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: lonlyPlanetShader,
                        vertex: mainVertex,
                        textures: [],
                        customUniforms: {
                        }

                    }
                ]
            }, () => {
            }, this.width, this.height);



        mapEntities.push(shader);


        return mapEntities;


    }

}

enum SCENE {
    INTRO = 0,
    EARTH = 1,
    LONLYPLANET = 2,
    BLACKHOLE = 3,
    EVENTHORIZON = 4
}

demo.addAssets("assets/images/silhouette.png").then((demo: SetupDemo) => {
    // Create the Scenes
    // Music length = 139200 ms;
    const fol06 = new Fol06(demo.sequence, 800, 450);

    const sceneBuilder = new SceneBuilder(139200);

    sceneBuilder
        .addScene("intro", 20000)
        .addScene("earth", 20000)
        .addScene("lonly-planet-and-the-sun", 20000)
        .addScene("blackhole", 4000).
        durationUntilEndInMs("eventhorizon");

    const scenes = sceneBuilder.getScenes();

    scenes[SCENE.INTRO].addEntities(...fol06.introScene())
    scenes[SCENE.EARTH].addEntities(...fol06.earthScene())
    scenes[SCENE.LONLYPLANET].addEntities(...fol06.lonlyPlanet())
    scenes[SCENE.BLACKHOLE].addEntities(...fol06.blackhole())
    scenes[SCENE.EVENTHORIZON].addEntities(...fol06.eventHorizon())

    demo.sequence.addSceneArray(scenes)



});

demo.sequence.onReady = () => {

    const toggleFullscreen = (elem: HTMLElement) => {
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch((err) => {
                alert(
                    `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
                );
            });
        } else {
            document.exitFullscreen();
        }
    }

    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        demo.sequence.play();
        toggleFullscreen(document.querySelector("canvas")!);
    });
}



