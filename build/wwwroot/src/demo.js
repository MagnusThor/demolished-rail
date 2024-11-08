"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AudioLoader_1 = require("../../src/Engine/Audio/AudioLoader");
const Entity_1 = require("../../src/Engine/Entity");
const GLSLShaderEntity_1 = require("../../src/Engine/GLSLShaderEntity");
const AssetsHelper_1 = require("../../src/Engine/Helpers/AssetsHelper");
const SceneBuilder_1 = require("../../src/Engine/Helpers/SceneBuilder");
const DefaultMainShader_1 = require("../../src/Engine/ShaderRenderers/WebGPU/DefaultMainShader");
const Geometry_1 = require("../../src/Engine/ShaderRenderers/WebGPU/Geometry");
const Material_1 = require("../../src/Engine/ShaderRenderers/WebGPU/Material");
const TextureLoader_1 = require("../../src/Engine/ShaderRenderers/WebGPU/TextureLoader");
const WGSLShaderRenderer_1 = require("../../src/Engine/ShaderRenderers/WebGPU/WGSLShaderRenderer");
const WGSLShaderEntity_1 = require("../../src/Engine/WGSLShaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const pseudoKnightyanFractal_1 = require("../assets/shaders/pseudoKnightyanFractal");
const someKindOfFractal_1 = require("../assets/shaders/someKindOfFractal");
const wgslFlamesShader_1 = require("../assets/shaders/wglsl/wgslFlamesShader");
const bubbleParticles_1 = require("./effects/bubbleParticles");
const creditsScroller_1 = require("./effects/creditsScroller");
const expandingCircleEffect_1 = require("./effects/expandingCircleEffect");
const fftAnalyzerEffect_1 = require("./effects/fftAnalyzerEffect");
const gridOverlayEffect_1 = require("./effects/gridOverlayEffect");
const imageOverlayEffect_1 = require("./effects/imageOverlayEffect");
const ranndomSquareByTickEffect_1 = require("./effects/ranndomSquareByTickEffect");
const starBurstEffct_1 = require("./effects/starBurstEffct");
const streachingTextEffect_1 = require("./effects/streachingTextEffect");
const strobeEffect_1 = require("./effects/strobeEffect");
const textArrayDisplayEffect_1 = require("./effects/textArrayDisplayEffect");
const textEffect_1 = require("./effects/textEffect");
const typeWriterEffet_1 = require("./effects/typeWriterEffet");
const createBeatShakePostProcessor_1 = require("./postprocessors/createBeatShakePostProcessor");
const createLensPostProcessor_1 = require("./postprocessors/createLensPostProcessor");
const SetupDemo_1 = require("./SetupDemo");
// get the music as baase
const demo = new SetupDemo_1.SetupDemo(new AudioLoader_1.DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
demo.addAssets("assets/images/silhouette.png", "assets/images/lens.png").then(async (demo) => {
    var _a, _b;
    await demo.sequence.initialize();
    const sceneBuilder = new SceneBuilder_1.SceneBuilder(demo.sequence.audioBuffer.duration * 1000);
    sceneBuilder
        .addScene("Scene 0", 10000).
        addScene("Scene 1", 20000).
        addScene("Scene 2", 8000).
        addScene("Scene 3", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 25000).
        durationUntilEndInMs("Scene 6");
    const scenes = sceneBuilder.getScenes();
    // Set up a wgsl shader entity & renderer
    const wgslCanvas = document.createElement("canvas"); // target canvas for WGSLShader
    wgslCanvas.width = demo.targetCanvas.width;
    wgslCanvas.height = demo.targetCanvas.height;
    const webgpu = await (0, WGSLShaderRenderer_1.initWebGPU)(wgslCanvas, { powerPreference: 'high-performance' });
    // preload textures to use in WGSL Shader
    const wsglTextures = await TextureLoader_1.WGSLTextureLoader.loadAll(webgpu.device, {
        key: "NOISE-TEXTURE",
        source: "assets/images/noise.png",
        type: TextureLoader_1.WGSLTextureType.IMAGE,
    });
    // Set up the WGSL Shader entity to render
    const wgslShaderProps = {
        canvas: wgslCanvas,
        device: webgpu.device,
        context: webgpu.context,
        shader: DefaultMainShader_1.defaultMainShader,
        renderBuffers: [
            {
                name: "iChannel0",
                shader: new Material_1.Material(webgpu.device, wgslFlamesShader_1.wgslFlamesShader),
                geometry: new Geometry_1.Geometry(webgpu.device, Geometry_1.rectGeometry),
                textures: wsglTextures
            }
        ]
    };
    const wgslShaderEntity = new WGSLShaderEntity_1.WGSLShaderEntity("wgsl-shader", wgslShaderProps, (ts, shaderRender) => {
        // this is an action called for each frame.
    });
    // done with wgsl stuff  , we just add the entiry to a Scene later on.
    const strobeEntity = new Entity_1.Entity("Strobe", {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
    }, (ts, ctx, props, sequence) => (0, strobeEffect_1.strobeEffect)(ts, ctx, props, demo.sequence));
    const imageOverlayEntity = new Entity_1.Entity("ImageOverlay", {
        position: imageOverlayEffect_1.ImagePosition.FILL,
        width: demo.targetCanvas.width,
        height: demo.targetCanvas.height,
        image: (_a = AssetsHelper_1.AssetsHelper.textureCache.get("silhouette.png")) === null || _a === void 0 ? void 0 : _a.src,
        opacity: 0.7,
        fadeIn: true,
        fadeOut: true,
        duration: 5,
    }, (ts, ctx, props) => (0, imageOverlayEffect_1.imageOverlayEffect)(ts, ctx, props, demo.sequence));
    const expandingCircleEntity = new Entity_1.Entity("ExpandingCircle", {
        x: demo.targetCanvas.width / 2,
        y: demo.targetCanvas.height / 2,
        radius: 0,
        maxRadius: 450,
        growthRate: 15,
        duration: 5 // Scene duration in seconds
    }, (ts, ctx, props) => (0, expandingCircleEffect_1.expandingCircleEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const starburstEntity = new Entity_1.Entity("Starburst", {
        x: demo.targetCanvas.width / 2, // Example x-coordinate
        y: demo.targetCanvas.height / 2, // Example y-coordinate
        numPoints: 8, // Example number of points
        outerRadius: 50,
        innerRadius: 25,
        rotation: 0,
        rotationSpeed: 2, // Example rotation speed
        hue: 0,
        saturation: 100,
        lightness: 50
    }, starBurstEffct_1.starburstEffect);
    const typeWriterEntity = new Entity_1.Entity("Typewriter", {
        x: 100,
        y: 300,
        text: "EASY AUDIO SYNCRONIZATON",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.audioProperties.bpm,
        ticksPerBeat: demo.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect);
    const randomSquareEntity = new Entity_1.Entity("RandomSquare", {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    }, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, demo.sequence.tickCounter) // Pass currentBar from Sequence
    );
    const gridOverlayEntity = new Entity_1.Entity("GridOverlay", {
        rows: 5,
        cols: 8,
        cellColor: "white",
        activeCells: new Set(),
    }, (ts, ctx, props, sequence) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const audioVisualizerEntity = new Entity_1.Entity("AudioVisualizer", {
        x: 0,
        y: 150,
        width: demo.targetCanvas.width,
        height: 300,
        barWidth: 5,
        barSpacing: 2,
        numBars: 100,
        color: "red"
    }, (ts, ctx, props, sequence) => (0, fftAnalyzerEffect_1.audioVisualizerEffect)(ts, ctx, props, demo.sequence));
    const pseudoKnightyanShaderEntity = new GLSLShaderEntity_1.GLSLShaderEntity("ShaderEnriry", {
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
    }, demo.targetCanvas.width, demo.targetCanvas.height);
    const someKindOfFractalShaderEntity = new GLSLShaderEntity_1.GLSLShaderEntity("ShaderEnriry", {
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
    }, demo.targetCanvas.width, demo.targetCanvas.height);
    const textOverlay = new Entity_1.Entity("TextEffect", {
        x: 100,
        y: 100,
        text: "FULL SHADER SUPPORT".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    }, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );
    const textArrayDisplayEntity = new Entity_1.Entity("TextArrayDisplay", {
        x: 100,
        y: 200,
        texts: [
            "1-N RENDERPASSES".toUpperCase(),
            "POSTPROCESSING".toUpperCase(),
            "1-N TEXTURES",
            "CUSTOM UNIFORMS",
        ],
        font: demo.font,
        size: 60,
        currentBeat: 0,
    }, (ts, ctx, props) => {
        (0, textArrayDisplayEffect_1.textArrayDisplayEffect)(ts, ctx, props, demo.sequence);
    });
    textArrayDisplayEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    const typeWriter1EntityForFirstScene = new Entity_1.Entity("Typewriter", {
        x: 100,
        y: 200,
        text: "DEMOLISHED-RAILS",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.audioProperties.bpm,
        ticksPerBeat: demo.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect, 1000, 10000);
    const typeWriter2EntityForFirstScene = new Entity_1.Entity("Typewriter", {
        x: 0,
        y: 350,
        text: "FRAMEWORK DEMO",
        index: 0,
        speed: 5, // 5 characters per second
        lastCharacterTime: 0,
        useBPM: true,
        bpm: demo.audioProperties.bpm,
        ticksPerBeat: demo.audioProperties.ticks
    }, typeWriterEffet_1.typeWriterEffect, 5000, 10000);
    const gridOverlayEffectEntity = new Entity_1.Entity("gridOverlayEffets", {
        activeCells: new Set(),
        cellColor: "rgba(255,255,0,0.2)",
        cols: 4,
        rows: 4,
    }, (ts, ctx, props) => (0, gridOverlayEffect_1.gridOverlayEffect)(ts, ctx, props, demo.sequence));
    const ballEntityProps = {
        numBalls: 20,
        balls: [],
    };
    const ballEntity = new Entity_1.Entity("BallEntity", ballEntityProps, (ts, ctx, props, sequence) => (0, bubbleParticles_1.ballEffect)(ts, ctx, props, sequence));
    const stretchingTextProps = {
        texts: ["BRING", "THE", "BEAT", "BACK"],
        currentIndex: 0,
        font: "Poppins", // Or your custom font
        color: "rgba(255,255,255,0.2)",
        lastBeat: -1,
    };
    const stretchingTextEntity = new Entity_1.Entity("StretchingText", stretchingTextProps, (ts, ctx, props, sequence) => (0, streachingTextEffect_1.stretchingTextEffect)(ts, ctx, props, demo.sequence));
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
    const creditsEntity = new Entity_1.Entity("CreditsScroller", creditsScrollerProps, (ts, ctx, props, sequence) => (0, creditsScroller_1.creditsScrollerEffect)(ts, ctx, props, demo.sequence));
    creditsEntity.addPostProcessor((0, createBeatShakePostProcessor_1.createBeatShakePostProcessor)(3));
    // Okey, done setup , add the stuff to scens 
    typeWriter1EntityForFirstScene.onBar((ts, count, props) => {
        console.log(`${ts} bar #${count}.`);
        // modify props on bar in this case;
    });
    scenes[0].addEntities(wgslShaderEntity);
    scenes[1].addEntities(typeWriter2EntityForFirstScene, gridOverlayEffectEntity, ballEntity, stretchingTextEntity)
        .addPostProcessorToEntities((0, createLensPostProcessor_1.createLensPostProcessor)((_b = AssetsHelper_1.AssetsHelper.textureCache.get("lens.png")) === null || _b === void 0 ? void 0 : _b.src));
    scenes[2].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[3].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[4].addEntities(strobeEntity, pseudoKnightyanShaderEntity, imageOverlayEntity);
    scenes[5].addEntities(someKindOfFractalShaderEntity, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    scenes[6].addEntities(creditsEntity, imageOverlayEntity, ballEntity);
    demo.sequence.addSceneArray(scenes);
});
const btn = document.querySelector("BUTTON");
btn.textContent = "CLICK TO START!";
btn.addEventListener("click", () => {
    var _a;
    (_a = document.querySelector("#launch")) === null || _a === void 0 ? void 0 : _a.remove();
    demo.sequence.play();
});
