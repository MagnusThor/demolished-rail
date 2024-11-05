import { Entity, IEntity } from "../../src/Engine/entity";
import { GLSLShaderEntity } from "../../src/Engine/GLSLShaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";
import { SetupDemo } from "./SetupDemo";
import { earthShader } from "../assets/shaders/earthShader";
import { Sequence } from "../../src/Engine/sequence";
import { ITextFadeInOut, TextAlignment, textFadeInOut } from "./effects/FoL/fadeInOutTextEffect";
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
import { DefaultAudioLoader, SonantAudioLoader } from "../../src/Engine/Audio/audioLoader";
import { sonantMusic } from "../assets/music/sonant";
import { AssetsHelper } from "../../src/Engine/Helpers/assetsHelper";
import { EngineLogger } from "../../src/Engine/EngineLogger";
import { Scene } from "../../src/Engine/scene";
import { singularityShader } from "../assets/shaders/singularityShader";
import { exoplanetShader } from "../assets/shaders/exoPlanetShader";


// new SonantAudioLoader(sonantMusic) 
const demo = new SetupDemo(new DefaultAudioLoader("/wwwroot/assets/music/we float here.mp3"));
/**
 * The darkness at the end of time
 * a Fruit of the Loom demo
 * Released 2024
 * @class Fol06
 */
class Fol06 {
    conductor: Conductor;
    constructor(public sequence: Sequence, public width: number, public height: number,
        public bmp: number

    ) {

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
        const textEffectEntity = new Entity<ITextFadeInOut>("intro-text",
            {
                y: this.height / 2,
                margin: 0,
                alignment: TextAlignment.CENTER,
                texts: ["The darkness at the end of time",
                    "a fruit of the loom production",
                    "inspired by a series of books",
                    "written by professor Ulf Danielsson"],
                font: "Montserrat",
                size: 40,
                fadeInDuration: SequenceHelper.getDurationForBeats(this.bmp, 4) / 1000,
                fadeOutDuration: SequenceHelper.getDurationForBeats(this.bmp, 4) / 1000,
                textDuration: SequenceHelper.getDurationForBeats(this.bmp, 8) / 1000,
                loop: false
            },
            (ts, ctx, props) => textFadeInOut(ts, ctx, props, this.sequence),
            SequenceHelper.getDurationForBeats(this.bmp, 8)
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
            [0.7, 1.3, 0.6],
            [0.2, 1.1, 1.0],
            [1.2, 0.9, 0.8],
            [0.9, 1.4, 0.5],
            [0.4, 1.0, 1.2]
        ]
        let cameraPos = cameraPositions[0];
        const shader = new GLSLShaderEntity("earthShader",
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

        const textEffectEntity = new Entity<ITextFadeInOut>("earth-text",
            {
                y: 40,
                texts: ["We are a cosmic accident,but a fortunate one.", "Swallowed by darkness, crushed by gravity."],
                font: "Montserrat",
                alignment: TextAlignment.RIGHT,
                margin: 20,
                size: 20,
                fadeInDuration: 2,
                fadeOutDuration: 2,
                textDuration: (SequenceHelper.getDurationForBeats(this.bmp, 4) / 1000) + 5,
                loop: false
            },
            (ts, ctx, props) => textFadeInOut(ts, ctx, props, this.sequence),
            SequenceHelper.getDurationForBeats(this.bmp, 4)
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
        const shader = new GLSLShaderEntity("earthShader",
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
        const shader = new GLSLShaderEntity("eventHorizon",
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
        const shader = new GLSLShaderEntity("lonley-planet-shader",
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

        const cameraPositions = [
            [0.0, 1.2],
            [0.5, 1.0],
            [1.0, 0.8],
        ];
        let cameraPos = cameraPositions[0];
        let currentPosIndex = 0;

        const shader = new GLSLShaderEntity("galaxy",
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
                            "cameraPos": (uniformLoction: WebGLUniformLocation, gl: WebGLRenderingContext,
                                program: WebGLProgram, time: number) => {
                                gl.uniform2fv(uniformLoction, cameraPos);
                            }
                        }
                    }
                ]
            }, () => {
            }, this.width, this.height);
        this.conductor.addEvent({
            action: (entity: IEntity) => {
                currentPosIndex++;
                const positionIndex = (currentPosIndex) % cameraPositions.length;
                cameraPos = cameraPositions[positionIndex];
            },
            targetEntity: "galaxy",
            criteria: () => { // Add the FFT criteria directly to the event
                const avgFrequency = this.sequence.fftData.reduce((sum, val) => sum + val, 0) /
                    this.sequence.fftData.length;
                return avgFrequency > 100; // Trigger if average frequency is greater than 100
            }
        })


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
        const shader = new GLSLShaderEntity("lonley-planet-shader",
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
                            "NUM_LAYERS": (uniformLoction: WebGLUniformLocation, gl: WebGLRenderingContext, program: WebGLProgram, time: number) => {
                                gl.uniform1f(uniformLoction!,
                                    1 * this.sequence.currentBeat)
                            }
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
        const shader = new GLSLShaderEntity("warp-speed-shader",
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

    singularity(): Array<IEntity> {
        const mapEntities = new Array<IEntity>();
        const shader = new GLSLShaderEntity("singularity-shader",
            {
                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: singularityShader,
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

    exoPlanets(): Array<IEntity>{
        const mapEntities = new Array<IEntity>();
        const shader = new GLSLShaderEntity("singularity-shader",
            {
                mainFragmentShader: mainFragment,
                mainVertexShader: mainVertex,
                renderBuffers: [
                    {
                        name: "a_buffer",
                        fragment: exoplanetShader,
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
    EXOPLANETS = 6,
    SINGULARITY = 7,
    BLACKHOLE = 8,
    EVENTHORIZON = 9
};

demo.addAssets().then((demo: SetupDemo) => {

    const bpm = 123;
    const fol06 = new Fol06(demo.sequence, 800, 450, bpm);
    const sceneBuilder = new SceneBuilder(166000); // 2.46 mins

    sceneBuilder
        .addScene("intro", SequenceHelper.getDurationForBeats(bpm, 32))
        .addScene("earth", SequenceHelper.getDurationForBars(bpm, 4, 16))
        .addScene("lonly-planet-and-the-sun", 15000)
        .addScene("galaxy", 15000)
        .addScene("galaxy-expand", 20000)
        .addScene("warp-speed", 5000)
        .addScene("explanets", 30000)
        .addScene("singularity", 25000)
        .addScene("blackhole", 5000).
        durationUntilEndInMs("eventhorizon");

    EngineLogger.log(`Total Scene duration ${sceneBuilder.totalScenesDuration}`);

    const scenes = sceneBuilder.getScenes();

    scenes[SCENE.INTRO].addEntities(...fol06.introScene())
    scenes[SCENE.EARTH].addEntities(...fol06.earthScene())
    scenes[SCENE.LONLYPLANET].addEntities(...fol06.lonlyPlanet())
    scenes[SCENE.GALAXY].addEntities(...fol06.galaxy())
    scenes[SCENE.GALAXYEXPAND].addEntities(...fol06.expandingGalaxy())
    scenes[SCENE.EXOPLANETS].addEntities(...fol06.exoPlanets())
    scenes[SCENE.WARPSPEED].addEntities(...fol06.warpSpeed())
    scenes[SCENE.SINGULARITY].addEntities(...fol06.singularity())
    scenes[SCENE.BLACKHOLE].addEntities(...fol06.blackhole())
    scenes[SCENE.EVENTHORIZON].addEntities(...fol06.eventHorizon())

    // create and add transitions to scenes

    const transitionIn = (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
        ctx.globalAlpha = progress;
    };

    const transitionOut = (ctx: CanvasRenderingContext2D, scene: Scene, progress: number) => {
        ctx.globalAlpha = 1 - progress;
    };

    scenes[SCENE.EARTH].transitionIn(
        demo.sequence,
        0, 2000, transitionIn);

    scenes[SCENE.EARTH].transitionOut(
        demo.sequence,
        scenes[SCENE.EARTH].durationInMs - 2000, 2000, transitionOut);

    demo.sequence.addSceneArray(scenes);

    const jumpToScene = new URLSearchParams(location.search).get("scene") || "0"
    const debugHelper = new DebugHelper(demo.sequence, parseInt(jumpToScene!));
    //debugHelper.addControls();
    demo.sequence.onFrame(() => debugHelper.update());


}).catch(err => {
    EngineLogger.log(err);
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
        // toggleFullscreen(document.querySelector("canvas")!);
    });
}

