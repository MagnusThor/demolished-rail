"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequence_1 = require("../../src/Engine/sequence");
const scene_1 = require("../../src/Engine/scene");
const entity_1 = require("../../src/Engine/entity");
const shaderEntity_1 = require("../../src/Engine/shaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const shaderScene_1 = require("../assets/shaders/shaderScene");
const typeWriterEffet_1 = require("./effects/typeWriterEffet");
const ranndomSquareByTickEffect_1 = require("./effects/ranndomSquareByTickEffect");
const expandingCircleEffect_1 = require("./effects/expandingCircleEffect");
const starBurstEffct_1 = require("./effects/starBurstEffct");
const textEffect_1 = require("./effects/textEffect");
const imageOverlayEffect_1 = require("./effects/imageOverlayEffect");
const textArrayDisplayEffect_1 = require("./effects/textArrayDisplayEffect");
const assetsHelper_1 = require("../../src/Engine/Helpers/assetsHelper");
const fftAnalyzerEffect_1 = require("./effects/fftAnalyzerEffect");
const strobeEffect_1 = require("./effects/strobeEffect");
const createBeatShakePostProcessor_1 = require("./postprocessors/createBeatShakePostProcessor");
class SetupDemo {
    constructor() {
        this.scenes = [];
        this.MockedGraph = {
            canvasWidth: 800,
            canvasHeight: 450,
            audioProperties: {
                bpm: 125,
                ticks: 4,
                beat: 0,
                tick: 0,
                bar: 0,
                avgFreq: 0
            },
            font: "Big Shoulders Stencil Text"
        };
        this.sequence = new sequence_1.Sequence(document.querySelector("canvas"), 125, 4, 4, [], "/wwwroot/assets/music/music.mp3");
    }
    async addAsset(url) {
        await assetsHelper_1.TextureCacheHelper.loadImage(url);
        return this;
    }
    addScene(scene) {
        this.sequence.addScene(scene);
    }
    addEntity(key, entity) {
        const scene = this.scenes.find(pre => {
            return pre.name === key;
        });
        if (scene) {
            scene.addEntity(entity);
        }
        else
            throw Error("No such scene");
    }
}
const demo = new SetupDemo();
demo.addAsset("assets/images/silhouette.png").then((instance) => {
    var _a;
    // Scene 1
    const scene1 = new scene_1.Scene("Scene 1", 0, 5000);
    const imageOverlayEntity = new entity_1.Entity("ImageOverlay", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 0,
        y: 0,
        width: instance.MockedGraph.canvasWidth,
        height: instance.MockedGraph.canvasHeight,
        image: (_a = assetsHelper_1.TextureCacheHelper.textureCache.get("silhouette.png")) === null || _a === void 0 ? void 0 : _a.src,
        opacity: 0.7,
        fadeIn: true,
        fadeOut: true,
        duration: 5,
    }, (ts, ctx, props) => (0, imageOverlayEffect_1.imageOverlayEffect)(ts, ctx, props));
    const expandingCircleEntity = new entity_1.Entity("ExpandingCircle", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: instance.MockedGraph.canvasWidth / 2,
        y: instance.MockedGraph.canvasHeight / 2,
        radius: 0,
        maxRadius: 450,
        growthRate: 15,
        duration: 5 // Scene duration in seconds
    }, (ts, ctx, props) => (0, expandingCircleEffect_1.expandingCircleEffect)(ts, ctx, props, instance.sequence) // Pass the sequence instance
    );
    const starburstEntity = new entity_1.Entity("Starburst", instance.MockedGraph.canvasWidth, // Canvas width
    instance.MockedGraph.canvasWidth, // Canvas height
    {
        x: instance.MockedGraph.canvasWidth / 2, // Example x-coordinate
        y: instance.MockedGraph.canvasHeight / 2, // Example y-coordinate
        numPoints: 8, // Example number of points
        outerRadius: 50,
        innerRadius: 25,
        rotation: 0,
        rotationSpeed: 2, // Example rotation speed
        hue: 0,
        saturation: 100,
        lightness: 50
    }, starBurstEffct_1.starburstEffect);
    scene1.addEntity(expandingCircleEntity);
    scene1.addEntity(starburstEntity);
    scene1.addEntity(imageOverlayEntity);
    instance.addScene(scene1);
    // Scene 2
    const scene2 = new scene_1.Scene("Scene 2", 5000, 15000);
    const typeWriterProps = {
        x: 100,
        y: 300,
        text: "LEVEL 50 UNLOCKED - TIME TO PARTY!",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: instance.MockedGraph.audioProperties.bpm,
        ticksPerBeat: instance.MockedGraph.audioProperties.ticks
    };
    const typeWriterEntity = new entity_1.Entity("Typewriter", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, typeWriterProps, typeWriterEffet_1.typeWriterEffect);
    const randomSquareProps = {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    };
    const randomSquareEntity = new entity_1.Entity("RandomSquare", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, randomSquareProps, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, instance.sequence.tickCounter) // Pass currentBar from Sequence
    );
    const audioVisualizerEntity = new entity_1.Entity("AudioVisualizer", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 0,
        y: 150,
        width: instance.MockedGraph.canvasWidth,
        height: 300,
        barWidth: 5,
        barSpacing: 2,
        numBars: 100,
        color: "red"
    }, (ts, ctx, props, sequence) => (0, fftAnalyzerEffect_1.audioVisualizerEffect)(ts, ctx, props, instance.sequence));
    scene2.addEntity(audioVisualizerEntity);
    scene2.addEntity(randomSquareEntity);
    scene2.addEntity(imageOverlayEntity);
    scene2.addEntity(typeWriterEntity);
    instance.addScene(scene2);
    const scene3 = new scene_1.Scene("Scene 3", 20000, 20000);
    const strobeProps = {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
    };
    const strobeEntity = new entity_1.Entity("Strobe", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, strobeProps, (ts, ctx, props, sequence) => (0, strobeEffect_1.strobeEffect)(ts, ctx, props, instance.sequence));
    scene3.addEntity(strobeEntity);
    scene3.addEntity(imageOverlayEntity);
    instance.addScene(scene3);
    const shaderProps = {
        mainFragmentShader: mainFragment_1.mainFragment,
        mainShaderVertex: mainVertex_1.mainVertex,
        rendeBuffers: [
            {
                name: "MyShader",
                fragment: shaderScene_1.shaderScene,
                vertex: mainVertex_1.mainVertex,
                textures: []
            }
        ]
    };
    const fractalShaderEntity = new shaderEntity_1.ShaderEntity("ShaderEnriry", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, shaderProps, (ts, render, propertybag) => {
        // access render here, i'e set uniforms etc using propertyBag or anyting;
    });
    const textOverlayProps = {
        x: 100,
        y: 100,
        text: "Vad du kan förvänta dig....".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    };
    const textOverlay = new entity_1.Entity("TextEffect", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, textOverlayProps, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, instance.sequence) // Pass the sequence instance
    );
    const textArrayDisplayEntity = new entity_1.Entity("TextArrayDisplay", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasWidth, {
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
    }, (ts, ctx, props) => {
        (0, textArrayDisplayEffect_1.textArrayDisplayEffect)(ts, ctx, props, instance.sequence);
    });
    const scene4 = new scene_1.Scene("Scene 4", 40000, 140000);
    scene4.addEntity(fractalShaderEntity);
    scene4.addEntity(imageOverlayEntity);
    scene4.addEntity(textOverlay);
    textArrayDisplayEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    scene4.addEntity(textArrayDisplayEntity);
    instance.addScene(scene4);
    // add a postprocessor to the RenderResult; 
    //instance.sequence.addPostProcessor(createBeatShakePostProcessor(3));
});
demo.sequence.onReady = () => {
    console.log(`click to start demo`);
    document.addEventListener("click", () => {
        demo.sequence.play();
    });
};
