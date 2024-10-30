"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("../../src/Engine/entity");
const shaderEntity_1 = require("../../src/Engine/shaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const someKindOfFractal_1 = require("../assets/shaders/someKindOfFractal");
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
const pseudoKnightyanFractal_1 = require("../assets/shaders/pseudoKnightyanFractal");
const sceneBuilder_1 = require("../../src/Engine/Helpers/sceneBuilder");
const gridOverlayEffect_1 = require("./effects/gridOverlayEffect");
const bubbleParticles_1 = require("./effects/bubbleParticles");
const streachingTextEffect_1 = require("./effects/streachingTextEffect");
const creditsScroller_1 = require("./effects/creditsScroller");
const createLensPostProcessor_1 = require("./postprocessors/createLensPostProcessor");
const SetupDemo_1 = require("./SetupDemo");
// get the music as base 64;
const demo = new SetupDemo_1.SetupDemo("/wwwroot/assets/music/music.mp3");
demo.addAssets("assets/images/silhouette.png", "assets/images/lens.png").then((demo) => {
    var _a, _b;
    // Create the Scenes
    // Music length = 139200 ms;
    const sceneBuilder = new sceneBuilder_1.SceneBuilder(139200);
    sceneBuilder
        .addScene("Scene 0", 1000).
        addScene("Scene 1", 20000).
        addScene("Scene 2", 8000).
        addScene("Scene 3", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 25000).
        durationUntilEndInMs("Scene 6");
    const scenes = sceneBuilder.getScenes();
    // Set up all effects;
    const strobeEntity = new entity_1.Entity("Strobe", {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
    }, (ts, ctx, props, sequence) => (0, strobeEffect_1.strobeEffect)(ts, ctx, props, demo.sequence));
    const imageOverlayEntity = new entity_1.Entity("ImageOverlay", {
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
    const expandingCircleEntity = new entity_1.Entity("ExpandingCircle", {
        x: demo.settings.width / 2,
        y: demo.settings.height / 2,
        radius: 0,
        maxRadius: 450,
        growthRate: 15,
        duration: 5 // Scene duration in seconds
    }, (ts, ctx, props) => (0, expandingCircleEffect_1.expandingCircleEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const starburstEntity = new entity_1.Entity("Starburst", {
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
    const typeWriterEntity = new entity_1.Entity("Typewriter", {
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
    const randomSquareEntity = new entity_1.Entity("RandomSquare", {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    }, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, demo.sequence.tickCounter) // Pass currentBar from Sequence
    );
    const gridOverlayEntity = new entity_1.Entity("GridOverlay", {
        rows: 5,
        cols: 8,
        cellColor: "white",
        activeCells: new Set(),
    }, (ts, ctx, props, sequence) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const audioVisualizerEntity = new entity_1.Entity("AudioVisualizer", {
        x: 0,
        y: 150,
        width: demo.settings.width,
        height: 300,
        barWidth: 5,
        barSpacing: 2,
        numBars: 100,
        color: "red"
    }, (ts, ctx, props, sequence) => (0, fftAnalyzerEffect_1.audioVisualizerEffect)(ts, ctx, props, demo.sequence));
    const pseudoKnightyanShaderEntity = new shaderEntity_1.ShaderEntity("ShaderEnriry", {
        mainFragmentShader: mainFragment_1.mainFragment,
        mainVertexShader: mainVertex_1.mainVertex,
        renderBuffers: [
            {
                name: "MyShader",
                fragment: pseudoKnightyanFractal_1.pseudoKnightyanFractal,
                vertex: mainVertex_1.mainVertex,
                textures: []
            }
        ]
    }, (ts, render, propertybag) => {
    }, demo.settings.width, demo.settings.height);
    const someKindOfFractalShaderEntity = new shaderEntity_1.ShaderEntity("ShaderEnriry", {
        mainFragmentShader: mainFragment_1.mainFragment,
        mainVertexShader: mainVertex_1.mainVertex,
        renderBuffers: [
            {
                name: "MyShader",
                fragment: someKindOfFractal_1.someKindOfFractal,
                vertex: mainVertex_1.mainVertex,
                textures: []
            }
        ]
    }, (ts, render, propertybag) => {
    }, demo.settings.width, demo.settings.height);
    const textOverlay = new entity_1.Entity("TextEffect", {
        x: 100,
        y: 100,
        text: "FULL SHADER SUPPORT".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    }, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const textArrayDisplayEntity = new entity_1.Entity("TextArrayDisplay", {
        x: 100,
        y: 200,
        texts: [
            "1-N RENDERPASSES".toUpperCase(),
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
    // setup a some more test Entities for § 0
    const typeWriter1EntityForFirstScene = new entity_1.Entity("Typewriter", {
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
    const typeWriter2EntityForFirstScene = new entity_1.Entity("Typewriter", {
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
    const gridOverlayEffectEntity = new entity_1.Entity("gridOverlayEffets", {
        activeCells: new Set(),
        cellColor: "rgba(255,255,0,0.2)",
        cols: 4,
        rows: 4,
    }, (ts, ctx, props) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const ballEntityProps = {
        numBalls: 20,
        balls: [],
    };
    const ballEntity = new entity_1.Entity("BallEntity", ballEntityProps, (ts, ctx, props, sequence) => (0, bubbleParticles_1.ballEffect)(ts, ctx, props, sequence));
    const stretchingTextProps = {
        texts: ["BRING", "THE", "BEAT", "BACK"],
        currentIndex: 0,
        font: "Poppins", // Or your custom font
        color: "rgba(255,255,255,0.2)",
        lastBeat: -1,
    };
    const stretchingTextEntity = new entity_1.Entity("StretchingText", stretchingTextProps, (ts, ctx, props, sequence) => (0, streachingTextEffect_1.stretchingTextEffect)(ts, ctx, props, demo.sequence));
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
    const creditsEntity = new entity_1.Entity("CreditsScroller", creditsScrollerProps, (ts, ctx, props, sequence) => (0, creditsScroller_1.creditsScrollerEffect)(ts, ctx, props, demo.sequence));
    creditsEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    // Okey, done setup , add the stuff to scens 
    typeWriter1EntityForFirstScene.onBar((ts, count, props) => {
        console.log(`${ts} bar #${count}.`);
        // modify props on bar in this case;
    });
    scenes[1].addEntities(typeWriter1EntityForFirstScene, typeWriter2EntityForFirstScene, gridOverlayEffectEntity, ballEntity, stretchingTextEntity)
        .addPostProcessorToEntities((0, createLensPostProcessor_1.createLensPostProcessor)((_b = assetsHelper_1.AssetsHelper.textureCache.get("lens.png")) === null || _b === void 0 ? void 0 : _b.src));
    scenes[2].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[3].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[4].addEntities(strobeEntity, pseudoKnightyanShaderEntity, imageOverlayEntity);
    scenes[5].addEntities(someKindOfFractalShaderEntity, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    scenes[6].addEntities(creditsEntity, imageOverlayEntity, ballEntity);
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
