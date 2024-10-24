"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequence_1 = require("../../src/Engine/sequence");
const entity_1 = require("../../src/Engine/entity");
const shaderEntity_1 = require("../../src/Engine/shaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const fractalOne_1 = require("../assets/shaders/fractalOne");
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
const fractalTwo_1 = require("../assets/shaders/fractalTwo");
const gridOverlayEffect_1 = require("./effects/gridOverlayEffect");
const sceneBuilder_1 = require("../../src/Engine/Helpers/sceneBuilder");
class SetupDemo {
    constructor() {
        this.scenes = [];
        this.MockedGraph = {
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
        this.sequence = new sequence_1.Sequence(document.querySelector("canvas"), 100, 4, 4, [], "/wwwroot/assets/music/music.mp3");
    }
    async addAsset(url) {
        await assetsHelper_1.AssetsHelper.loadImage(url);
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
    // Create the Scenes
    // Music length = 139200 ms;
    var _a;
    const sceneBuilder = new sceneBuilder_1.SceneBuilder(139200);
    sceneBuilder.addScene("Scene 0", 10000).
        addScene("Scene 1", 8000).
        addScene("Scene 2", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 15000);
    const scenes = sceneBuilder.getScenes();
    // Set up all effects;
    const strobeEntity = new entity_1.Entity("Strobe", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
    }, (ts, ctx, props, sequence) => (0, strobeEffect_1.strobeEffect)(ts, ctx, props, instance.sequence));
    const imageOverlayEntity = new entity_1.Entity("ImageOverlay", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 0,
        y: 0,
        width: instance.MockedGraph.canvasWidth,
        height: instance.MockedGraph.canvasHeight,
        image: (_a = assetsHelper_1.AssetsHelper.textureCache.get("silhouette.png")) === null || _a === void 0 ? void 0 : _a.src,
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
    const typeWriterEntity = new entity_1.Entity("Typewriter", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 100,
        y: 300,
        text: "THIS IS A TYPWRITER-EFFECT",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: instance.MockedGraph.audioProperties.bpm,
        ticksPerBeat: instance.MockedGraph.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect);
    const randomSquareEntity = new entity_1.Entity("RandomSquare", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    }, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, instance.sequence.tickCounter) // Pass currentBar from Sequence
    );
    const gridOverlayEntity = new entity_1.Entity("GridOverlay", 800, // Canvas width
    450, // Canvas height
    {
        rows: 5,
        cols: 8,
        cellColor: "white",
        activeCells: new Set(),
    }, (ts, ctx, props, sequence) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, instance.sequence));
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
    const fractalShaderEntityTwo = new shaderEntity_1.ShaderEntity("ShaderEnriry", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        mainFragmentShader: mainFragment_1.mainFragment,
        mainShaderVertex: mainVertex_1.mainVertex,
        rendeBuffers: [
            {
                name: "MyShader",
                fragment: fractalTwo_1.fractalTwo,
                vertex: mainVertex_1.mainVertex,
                textures: []
            }
        ]
    }, (ts, render, propertybag) => {
    });
    const fractalShaderEntityOne = new shaderEntity_1.ShaderEntity("ShaderEnriry", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        mainFragmentShader: mainFragment_1.mainFragment,
        mainShaderVertex: mainVertex_1.mainVertex,
        rendeBuffers: [
            {
                name: "MyShader",
                fragment: fractalOne_1.fractalOne,
                vertex: mainVertex_1.mainVertex,
                textures: []
            }
        ]
    }, (ts, render, propertybag) => {
    });
    const textOverlay = new entity_1.Entity("TextEffect", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 100,
        y: 100,
        text: "Vad du kan förvänta dig....".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    }, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, instance.sequence) // Pass the sequence instance
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
    textArrayDisplayEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    // Add Entities to the Scens
    // setup a typeWriter, showing after 5 seconds in scene 0
    const typeWriterEntityForFirstScene = new entity_1.Entity("Typewriter", instance.MockedGraph.canvasWidth, instance.MockedGraph.canvasHeight, {
        x: 100,
        y: 300,
        text: "HELLO WORLD",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: instance.MockedGraph.audioProperties.bpm,
        ticksPerBeat: instance.MockedGraph.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect, 5000, 5000);
    scenes[0].addEntities(strobeEntity, typeWriterEntityForFirstScene);
    scenes[1].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[2].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[3].addEntities(strobeEntity, fractalShaderEntityTwo, imageOverlayEntity);
    scenes[4].addEntities(fractalShaderEntityOne, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    instance.sequence.addSceneArray(scenes);
    // add a postprocessor to the RenderResult; 
    //instance.sequence.addPostProcessor(createBeatShakePostProcessor(3));
});
demo.sequence.onReady = () => {
    const btn = document.querySelector("BUTTON");
    btn.textContent = "CLICK TO START!";
    btn.addEventListener("click", () => {
        var _a;
        (_a = document.querySelector("#launch")) === null || _a === void 0 ? void 0 : _a.remove();
        demo.sequence.play();
    });
};
