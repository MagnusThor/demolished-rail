import { Sequence } from "../../src/Engine/sequence";
import { Scene } from "../../src/Engine/scene";
import { Entity, IEntity } from "../../src/Engine/entity";
import { IShaderProperties, ShaderEntity } from "../../src/Engine/shaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { fractalOne } from "../assets/shaders/fractalOne";
import { ITypeWriterEffectProps, typeWriterEffect } from "./effects/typeWriterEffet";
import { IRandomSquareEffectProps, randomSquareEffect } from "./effects/ranndomSquareByTickEffect";
import { expandingCircleEffect, IExpandingCircleEffectProps } from "./effects/expandingCircleEffect";
import { IStarburstProps, starburstEffect } from "./effects/starBurstEffct";
import { ITextEffectProps, textEffect } from "./effects/textEffect";
import { IImageOverlayEffectProps, imageOverlayEffect } from "./effects/imageOverlayEffect";


import { textArrayDisplayEffect, ITextArrayDisplayProps } from './effects/textArrayDisplayEffect'

import { AssetsHelper } from "../../src/Engine/Helpers/assetsHelper";
import { audioVisualizerEffect, IAudioVisualizerProps } from "./effects/fftAnalyzerEffect";
import { IStrobeEffectProps, strobeEffect } from "./effects/strobeEffect";
import { createBlurPostProcessor } from "../../src/Engine/Helpers/postProcessors";
import { createBeatShakePostProcessor } from "./postprocessors/createBeatShakePostProcessor";
import { fractalTwo } from "../assets/shaders/fractalTwo";
import { gridOverlayEffect, IGridOverlayEffectProps } from "./effects/gridOverlayEffect";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";




class SetupDemo {
    sequence: Sequence;
    scenes: Scene[] = [];
    MockedGraph = {
        canvasWidth: 800,
        canvasHeight: 450,
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
    async addAsset(url: string) {
        await AssetsHelper.loadImage(url);
        return this;
    }
    addScene(scene: Scene) {
        this.sequence.addScene(scene);
    }
    addEntity<T>(key: string, entity: Entity<T> | ShaderEntity) {
        const scene = this.scenes.find(pre => {
            return pre.name === key
        });
        if (scene) {
            scene.addEntity(entity);
        } else throw Error("No such scene")
    }

}


const demo = new SetupDemo();
demo.addAsset("assets/images/silhouette.png").then((instance: SetupDemo) => {

    // Create the Scenes
    // Music length = 139200 ms;


    const sceneBuilder = new SceneBuilder(139200);

    sceneBuilder.addScene("Scene 0", 10000).
        addScene("Scene 1", 8000).
        addScene("Scene 2", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 15000);


    const scenes = sceneBuilder.getScenes();





    // Set up all effects;

    const strobeEntity = new Entity<IStrobeEffectProps>(
        "Strobe",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            color: "white", // You can change the color
            isOn: false,
            lastBeat: -1, // Initialize to -1 to trigger on the first beat
        },
        (ts, ctx, props, sequence) => strobeEffect(ts, ctx, props, instance.sequence)
    );


    const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
        "ImageOverlay",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 0,
            y: 0,
            width: instance.MockedGraph.canvasWidth,
            height: instance.MockedGraph.canvasHeight,
            image: AssetsHelper.textureCache!.get("silhouette.png")?.src,
            opacity: 0.7,
            fadeIn: true,
            fadeOut: true,
            duration: 5,
        }
        ,
        (ts, ctx, props) => imageOverlayEffect(ts, ctx, props)
    );

    const expandingCircleEntity = new Entity<IExpandingCircleEffectProps>(
        "ExpandingCircle",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: instance.MockedGraph.canvasWidth / 2,
            y: instance.MockedGraph.canvasHeight / 2,
            radius: 0,
            maxRadius: 450,
            growthRate: 15,
            duration: 5 // Scene duration in seconds
        },
        (ts, ctx, props) => expandingCircleEffect(ts, ctx, props, instance.sequence) // Pass the sequence instance
    );

    const starburstEntity = new Entity<IStarburstProps>(
        "Starburst",
        instance.MockedGraph.canvasWidth, // Canvas width
        instance.MockedGraph.canvasWidth,  // Canvas height
        {
            x: instance.MockedGraph.canvasWidth / 2, // Example x-coordinate
            y: instance.MockedGraph.canvasHeight / 2, // Example y-coordinate
            numPoints: 8,  // Example number of points
            outerRadius: 50,
            innerRadius: 25,
            rotation: 0,
            rotationSpeed: 2, // Example rotation speed
            hue: 0,
            saturation: 100,
            lightness: 50
        },
        starburstEffect
    );

    const typeWriterEntity = new Entity<ITypeWriterEffectProps>(
        "Typewriter",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 100,
            y: 300,
            text: "THIS IS A TYPWRITER-EFFECT",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: instance.MockedGraph.audioProperties.bpm,
            ticksPerBeat: instance.MockedGraph.audioProperties.ticks
        },
        typeWriterEffect
    );

    const randomSquareEntity = new Entity<IRandomSquareEffectProps>(
        "RandomSquare",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 0,
            y: 0,
            size: 0,
            color: "red",
            lastTick: -1 // Initialize to -1 to add a square on the first bar
        },
        (ts, ctx, props) => randomSquareEffect(ts, ctx, props, instance.sequence.tickCounter) // Pass currentBar from Sequence
    );


    const gridOverlayEntity = new Entity<IGridOverlayEffectProps>(
        "GridOverlay",
        800, // Canvas width
        450, // Canvas height
        {
            rows: 5,
            cols: 8,
            cellColor: "white",
            activeCells: new Set(),
        },
        (ts, ctx, props, sequence) => gridOverlayEffect(ts, ctx, props, instance.sequence)
    );

    const audioVisualizerEntity = new Entity<IAudioVisualizerProps>(
        "AudioVisualizer",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 0,
            y: 150,
            width: instance.MockedGraph.canvasWidth,
            height: 300,
            barWidth: 5,
            barSpacing: 2,
            numBars: 100,
            color: "red"
        },
        (ts, ctx, props, sequence) => audioVisualizerEffect(ts, ctx, props, instance.sequence)
    );


    const fractalShaderEntityTwo = new ShaderEntity("ShaderEnriry",
        instance.MockedGraph.canvasWidth
        , instance.MockedGraph.canvasHeight,
        {
            mainFragmentShader: mainFragment,
            mainShaderVertex: mainVertex,
            rendeBuffers: [
                {
                    name: "MyShader",
                    fragment: fractalTwo,
                    vertex: mainVertex,
                    textures: []
                }
            ]
        }, (ts, render, propertybag) => {
        });


    const fractalShaderEntityOne = new ShaderEntity("ShaderEnriry",
        instance.MockedGraph.canvasWidth
        , instance.MockedGraph.canvasHeight,
        {
            mainFragmentShader: mainFragment,
            mainShaderVertex: mainVertex,
            rendeBuffers: [
                {
                    name: "MyShader",
                    fragment: fractalOne,
                    vertex: mainVertex,
                    textures: []
                }
            ]
        }, (ts, render, propertybag) => {
        });


    const textOverlay = new Entity<ITextEffectProps>(
        "TextEffect",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 100,
            y: 100,
            text: "Vad du kan förvänta dig....".toUpperCase(),
            font: "Big Shoulders Stencil Text",
            size: 60,
            duration: 15 // 5 seconds
        },
        (ts, ctx, props) => textEffect(ts, ctx, props, instance.sequence) // Pass the sequence instance
    );


    const textArrayDisplayEntity = new Entity<ITextArrayDisplayProps>(
        "TextArrayDisplay",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasWidth,
        {
            x: 100,
            y: 200,
            texts: [
                "HELLO".toUpperCase(),
                "WORLD".toUpperCase(),
                "KILLROY",
                "WAS HERE",
            ],
            font: instance.MockedGraph.font,
            size: 60,
            currentBeat: 0,
        },
        (ts, ctx, props) => {
            textArrayDisplayEffect(ts, ctx, props, instance.sequence);
        }
    );
    textArrayDisplayEntity.addPostProcessor(createBeatShakePostProcessor(3));


    // Add Entities to the Scens

    scenes[0].addEntities(strobeEntity);
    scenes[1].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[2].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[3].addEntities(strobeEntity, fractalShaderEntityTwo, imageOverlayEntity);
    scenes[4].addEntities(fractalShaderEntityOne, imageOverlayEntity, textOverlay, textArrayDisplayEntity);



    instance.sequence.addSceneArray(scenes)

    // add a postprocessor to the RenderResult; 
    //instance.sequence.addPostProcessor(createBeatShakePostProcessor(3));

});

demo.sequence.onReady = () => {

    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        demo.sequence.play();
    });
}


