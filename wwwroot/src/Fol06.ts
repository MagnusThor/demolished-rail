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
import { galaxyShader } from "../assets/shaders/galaxyShader";
import { cosmicCycleShader } from "../assets/shaders/cosmicCycleShader";
import { DebugHelper } from "../../src/Engine/Helpers/debugHelper";
import { SequenceHelper } from "../../src/Engine/Helpers/sequenceHelper";
import { Conductor, ITimelineEvent } from "../../src/Engine/conductor";
import { atomsmp3 } from "../assets/base64/atomsmp3";
import { warpSpeedShader } from "../assets/shaders/warpSpeedShader";



const demo = new SetupDemo(atomsmp3);
/**
 * The darkness at the end of time
 * a Fruit of the Loom demo
 * Released 2024
 * @class Fol06
 */
class Fol06 {
    conductor: any;
    constructor(public sequence: Sequence, public width: number, public height: number) {

        this.conductor = new Conductor();
        sequence.conductor = this.conductor;
    }
    /**
     * Create entitiesfor the intro scene
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    introScene(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();


        // Define the timeline event
        const textEvent: ITimelineEvent<ITextFadeInOut, any> = {
            barCount: 10, // Trigger on 10 bar
            action: (entity: Entity<ITextFadeInOut>) => {
                // Get the "intro-text" entity and modify its properties
                const introText = entity;
                introText.props!.size *= 1.05;

            },
            targetEntity: "intro-text", // Target the "intro-text" entity,
            // Add a criteria to check if the event has already been triggered
            criteria: () => {
                if (textEvent.props === undefined) { // Check if props is undefined
                    textEvent.props = { triggered: false }; // If undefined, initialize it
                }
                if (!textEvent.props.triggered) {
                    textEvent.props.triggered = true; // Mark the event as triggered
                    return true; // Allow the event to trigger
                } else {
                    return false; // Prevent the event from triggering again
                }
            }
        };

        this.conductor.addEvent(textEvent);


        const textEffectEntity = new Entity<ITextFadeInOut>("intro-text",
            {
                y: this.height / 2,
                texts: ["The darkness at the end of time".toLowerCase(),
                    "a fruit of the loom production",
                    "inspired by a series of books",
                    "written by professor Ulf Danielsson"],
                font: "Montserrat",
                size: 40,
                fadeInDuration: 2,
                fadeOutDuration: 2,
                textDuration: 5,
                loop: false
            },
            (ts, ctx, props) => textFadeInOut(ts, ctx, props, this.sequence)
        );
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


        const textEffectEntity = new Entity<ITextFadeInOut>("intro-text",
            {
                x: this.width - this.width / 3,
                y: 40,
                texts: ["We are a cosmic accident", "but a fortunate one.", "Swallowed by darkness, crushed by gravity."],
                font: "Montserrat",
                size: 20,
                fadeInDuration: 2,
                fadeOutDuration: 2,
                textDuration: 5,
                loop: false
            },
            (ts, ctx, props) => textFadeInOut(ts, ctx, props, this.sequence),
            5000
        );

        mapEntities.push(shader, textEffectEntity);
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
        });
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

    /**
     * Cretate entities for the galaxy scene scene
     *
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    galaxy(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const shader = new ShaderEntity("lonley-planet-shader",
            {
                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: galaxyShader,
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
     *
     *
     * @return {*}  {Array<IEntity>}
     * @memberof Fol06
     */
    expandingGalaxy(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const shader = new ShaderEntity("lonley-planet-shader",
            {
                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: cosmicCycleShader,
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

    warpSpeed(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const shader = new ShaderEntity("warp-speed-shader",
            {
                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: warpSpeedShader,
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
    GALAXY = 3,
    GALAXYEXPAND = 4,
    WARPSPEED = 5,
    BLACKHOLE = 6,
    EVENTHORIZON = 7
}

demo.addAssets().then((demo: SetupDemo) => {
    // Create the Scenes
    // Music length = 139200 ms;
    const fol06 = new Fol06(demo.sequence, 800, 450);

    const sceneBuilder = new SceneBuilder(139200);

    sceneBuilder
        .addScene("intro", SequenceHelper.getDurationForBars(123, 4, 10))
        .addScene("earth", 20000)
        .addScene("lonly-planet-and-the-sun", 20000)
        .addScene("galaxy", 15000)
        .addScene("galaxy-expand", 15000)
        .addScene("warp-speed", 15000)
        .addScene("blackhole", 4000).
        durationUntilEndInMs("eventhorizon");


    const scenes = sceneBuilder.getScenes();

    scenes[SCENE.INTRO].addEntities(...fol06.introScene())
    scenes[SCENE.EARTH].addEntities(...fol06.earthScene())
    scenes[SCENE.LONLYPLANET].addEntities(...fol06.lonlyPlanet())
    scenes[SCENE.GALAXY].addEntities(...fol06.galaxy())
    scenes[SCENE.GALAXYEXPAND].addEntities(...fol06.expandingGalaxy())
    scenes[SCENE.WARPSPEED].addEntities(...fol06.warpSpeed())
    scenes[SCENE.BLACKHOLE].addEntities(...fol06.blackhole())
    scenes[SCENE.EVENTHORIZON].addEntities(...fol06.eventHorizon())

    demo.sequence.addSceneArray(scenes)


    const jumpToScene = new URLSearchParams(location.search).get("scene") || "0"
    const debugHelper = new DebugHelper(demo.sequence, parseInt(jumpToScene!));
    //debugHelper.addControls();
    demo.sequence.onFrame(() => debugHelper.update());


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
    btn!.classList.remove("hide");
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        demo.sequence.play();
        toggleFullscreen(document.querySelector("canvas")!);
    });
}



