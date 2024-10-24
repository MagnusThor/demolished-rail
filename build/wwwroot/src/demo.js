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
const sceneBuilder_1 = require("../../src/Engine/Helpers/sceneBuilder");
const gridOverlayEffect_1 = require("./effects/gridOverlayEffect");
const bubbleParticles_1 = require("./effects/bubbleParticles");
const streachingTextEffect_1 = require("./effects/streachingTextEffect");
const creditsScroller_1 = require("./effects/creditsScroller");
class SetupDemo {
    constructor() {
        this.scenes = [];
        this.settings = {
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
        this.sequence = new sequence_1.Sequence(document.querySelector("canvas"), 100, 4, 4, [], "/wwwroot/assets/music/music.mp3");
    }
    async addAssets(...urls) {
        await assetsHelper_1.AssetsHelper.loadImages(urls);
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
demo.addAssets("assets/images/silhouette.png", "assets/images/lens.png").then((demo) => {
    var _a;
    // Create the Scenes
    // Music length = 139200 ms;
    const sceneBuilder = new sceneBuilder_1.SceneBuilder(139200);
    sceneBuilder.addScene("Scene 0", 20000).
        addScene("Scene 1", 8000).
        addScene("Scene 2", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 25000).
        durationUntilEndInMs("Scene 6");
    const scenes = sceneBuilder.getScenes();
    // Set up all effects;
    const strobeEntity = new entity_1.Entity("Strobe", demo.settings.width, demo.settings.height, {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
    }, (ts, ctx, props, sequence) => (0, strobeEffect_1.strobeEffect)(ts, ctx, props, demo.sequence));
    const imageOverlayEntity = new entity_1.Entity("ImageOverlay", demo.settings.width, demo.settings.height, {
        x: 0,
        y: 0,
        width: demo.settings.width,
        height: demo.settings.height,
        image: (_a = assetsHelper_1.AssetsHelper.textureCache.get("silhouette.png")) === null || _a === void 0 ? void 0 : _a.src,
        opacity: 0.7,
        fadeIn: true,
        fadeOut: true,
        duration: 5,
    }, (ts, ctx, props) => (0, imageOverlayEffect_1.imageOverlayEffect)(ts, ctx, props));
    const expandingCircleEntity = new entity_1.Entity("ExpandingCircle", demo.settings.width, demo.settings.height, {
        x: demo.settings.width / 2,
        y: demo.settings.height / 2,
        radius: 0,
        maxRadius: 450,
        growthRate: 15,
        duration: 5 // Scene duration in seconds
    }, (ts, ctx, props) => (0, expandingCircleEffect_1.expandingCircleEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const starburstEntity = new entity_1.Entity("Starburst", demo.settings.width, // Canvas width
    demo.settings.width, // Canvas height
    {
        x: demo.settings.width / 2, // Example x-coordinate
        y: demo.settings.height / 2, // Example y-coordinate
        numPoints: 8, // Example number of points
        outerRadius: 50,
        innerRadius: 25,
        rotation: 0,
        rotationSpeed: 2, // Example rotation speed
        hue: 0,
        saturation: 100,
        lightness: 50
    }, starBurstEffct_1.starburstEffect);
    const typeWriterEntity = new entity_1.Entity("Typewriter", demo.settings.width, demo.settings.height, {
        x: 100,
        y: 300,
        text: "EASY AUDIO SYNCRONIZATON",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.settings.audioProperties.bpm,
        ticksPerBeat: demo.settings.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect);
    const randomSquareEntity = new entity_1.Entity("RandomSquare", demo.settings.width, demo.settings.height, {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    }, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, demo.sequence.tickCounter) // Pass currentBar from Sequence
    );
    const gridOverlayEntity = new entity_1.Entity("GridOverlay", 800, // Canvas width
    450, // Canvas height
    {
        rows: 5,
        cols: 8,
        cellColor: "white",
        activeCells: new Set(),
    }, (ts, ctx, props, sequence) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const audioVisualizerEntity = new entity_1.Entity("AudioVisualizer", demo.settings.width, demo.settings.height, {
        x: 0,
        y: 150,
        width: demo.settings.width,
        height: 300,
        barWidth: 5,
        barSpacing: 2,
        numBars: 100,
        color: "red"
    }, (ts, ctx, props, sequence) => (0, fftAnalyzerEffect_1.audioVisualizerEffect)(ts, ctx, props, demo.sequence));
    const fractalShaderEntityTwo = new shaderEntity_1.ShaderEntity("ShaderEnriry", demo.settings.width, demo.settings.height, {
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
    const fractalShaderEntityOne = new shaderEntity_1.ShaderEntity("ShaderEnriry", demo.settings.width, demo.settings.height, {
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
    const textOverlay = new entity_1.Entity("TextEffect", demo.settings.width, demo.settings.height, {
        x: 100,
        y: 100,
        text: "FULL SHADER SUPPORT".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    }, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const textArrayDisplayEntity = new entity_1.Entity("TextArrayDisplay", demo.settings.width, demo.settings.width, {
        x: 100,
        y: 200,
        texts: [
            "1-N RENDERPASS".toUpperCase(),
            "POSTPROCESSING".toUpperCase(),
            "1-N TEXTURES",
            "CUSTOM UNIFORMS",
        ],
        font: demo.settings.font,
        size: 60,
        currentBeat: 0,
    }, (ts, ctx, props) => {
        (0, textArrayDisplayEffect_1.textArrayDisplayEffect)(ts, ctx, props, demo.sequence);
    });
    textArrayDisplayEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    // Add Entities to the Scens
    // setup a some more test Entities for Scene 0
    const typeWriter1EntityForFirstScene = new entity_1.Entity("Typewriter", demo.settings.width, demo.settings.height, {
        x: 100,
        y: 200,
        text: "DEMOLISHED-RAILS",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.settings.audioProperties.bpm,
        ticksPerBeat: demo.settings.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect, 1000, 10000);
    const typeWriter2EntityForFirstScene = new entity_1.Entity("Typewriter", demo.settings.width, demo.settings.height, {
        x: 0,
        y: 350,
        text: "FRAMEWORK DEMO",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.settings.audioProperties.bpm,
        ticksPerBeat: demo.settings.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect, 5000, 10000);
    const gridOverlayEffectEntity = new entity_1.Entity("gridOverlayEffets", demo.settings.width, demo.settings.height, {
        activeCells: new Set(),
        cellColor: "rgba(255,255,0,0.2)",
        cols: 4,
        rows: 4,
    }, (ts, ctx, props) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const ballEntityProps = {
        numBalls: 20,
        balls: [],
    };
    const ballEntity = new entity_1.Entity("BallEntity", demo.settings.width, demo.settings.height, ballEntityProps, (ts, ctx, props, sequence) => (0, bubbleParticles_1.ballEffect)(ts, ctx, props, sequence));
    const stretchingTextProps = {
        texts: ["BRING", "THE", "BEAT", "BACK"],
        currentIndex: 0,
        font: "Poppins", // Or your custom font
        color: "rgba(255,255,255,0.2)",
        lastBeat: -1,
    };
    const stretchingTextEntity = new entity_1.Entity("StretchingText", 800, // Canvas width
    450, // Canvas height
    stretchingTextProps, (ts, ctx, props, sequence) => (0, streachingTextEffect_1.stretchingTextEffect)(ts, ctx, props, demo.sequence));
    // set up an endScene ( credits )
    const creditsText = [
        "FRAMWORK CODE",
        "MAGNUS 'BAGZY'THOR",
        "EXAMPLE FX'S",
        "MAGNUS 'BAGZY'THOR",
        "MUSIC BY",
        "VIRGILL / MANIACS OF NOISE",
        "GRAPHIS",
        "COOKIEDOUGH",
        // ... more lines
    ];
    const creditsScrollerProps = {
        lines: creditsText.map((text, index) => ({
            text,
            y: 100 + index * 30, // Initial y position
            alpha: 0,
        })),
        lineHeight: 80,
        scrollSpeed: 40,
        fadeInDuration: 0.5,
        fadeOutDuration: 0.5,
        font: "40px Poppins",
    };
    const creditsEntity = new entity_1.Entity("CreditsScroller", demo.settings.width, // Canvas width
    demo.settings.height, // Canvas height
    creditsScrollerProps, (ts, ctx, props, sequence) => (0, creditsScroller_1.creditsScrollerEffect)(ts, ctx, props, demo.sequence));
    creditsEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    // Okey, done setup , add the stuff to scens 
    scenes[0].addEntities(typeWriter1EntityForFirstScene, typeWriter2EntityForFirstScene, gridOverlayEffectEntity, ballEntity, stretchingTextEntity);
    //    .addPostProcessorToEntities(createLensPostProcessor(AssetsHelper.textureCache!.get("lens.png")?.src));
    scenes[1].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[2].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[3].addEntities(strobeEntity, fractalShaderEntityTwo, imageOverlayEntity);
    scenes[4].addEntities(fractalShaderEntityOne, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    scenes[5].addEntities(creditsEntity, imageOverlayEntity, ballEntity);
    demo.sequence.addSceneArray(scenes);
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
