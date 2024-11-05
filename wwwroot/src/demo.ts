import { Entity } from "../../src/Engine/entity";
import { GLSLShaderEntity } from "../../src/Engine/GLSLShaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { someKindOfFractal } from "../assets/shaders/someKindOfFractal";
import { ITypeWriterEffectProps, typeWriterEffect } from "./effects/typeWriterEffet";
import { IRandomSquareEffectProps, randomSquareEffect } from "./effects/ranndomSquareByTickEffect";
import { expandingCircleEffect, IExpandingCircleEffectProps } from "./effects/expandingCircleEffect";
import { IStarburstProps, starburstEffect } from "./effects/starBurstEffct";
import { ITextEffectProps, textEffect } from "./effects/textEffect";
import { IImageOverlayEffectProps, imageOverlayEffect, ImagePosition } from "./effects/imageOverlayEffect";
import { textArrayDisplayEffect, ITextArrayDisplayProps } from './effects/textArrayDisplayEffect'
import { AssetsHelper } from "../../src/Engine/Helpers/assetsHelper";
import { audioVisualizerEffect, IAudioVisualizerProps } from "./effects/fftAnalyzerEffect";
import { IStrobeEffectProps, strobeEffect } from "./effects/strobeEffect";
import { createBeatShakePostProcessor } from "./postprocessors/createBeatShakePostProcessor";
import { pseudoKnightyanFractal } from "../assets/shaders/pseudoKnightyanFractal";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";
import { gridOverlayEffect, IGridOverlayEffectProps } from "./effects/gridOverlayEffect";
import { ballEffect, IBallEntityProps } from "./effects/bubbleParticles";
import { IStretchingTextProps, stretchingTextEffect } from "./effects/streachingTextEffect";
import { creditsScrollerEffect, ICreditsScrollerProps } from "./effects/creditsScroller";
import { createLensPostProcessor } from "./postprocessors/createLensPostProcessor";
import { SetupDemo } from "./SetupDemo";
import { DefaultAudioLoader } from "../../src/Engine/Audio/audioLoader";
import { IWGSLShaderProperties, IWGSLShaderEntity } from "../../src/Engine/WGSLShaderEntity";
import { initWebGPU, WGSLShaderRenderer } from "../../src/Engine/ShaderRenderers/WebGPU/wgslShaderRenderer";
import { defaultMainShader } from "../../src/Engine/ShaderRenderers/WebGPU/defaultMainShader";
import { Material } from "../../src/Engine/ShaderRenderers/WebGPU/material";
import { Geometry, rectGeometry } from "../../src/Engine/ShaderRenderers/WebGPU/geometry";
import { blueColorShader } from "../assets/shaders/wglsl/wgslShaderExample";
import { TextureLoader } from "../../src/Engine/ShaderRenderers/WebGPU/textureLoader";
import { WgslTextureType } from "../../src/Engine/Interfaces/IWgslTexture";
import { wgslFlamesShader } from "../assets/shaders/wglsl/wgslFlamesShader";



// get the music as baase
const demo = new SetupDemo(
    new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));

demo.addAssets("assets/images/silhouette.png", "assets/images/lens.png").then(async (demo: SetupDemo) => {
   
   
    // Create the Scenes
    // Music length = 139200 ms;
    const sceneBuilder = new SceneBuilder(139200);

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
    const wgslCanvas = document.createElement("canvas");
    wgslCanvas.width = demo.settings.width; wgslCanvas.height = demo.settings.height;

    const webgpu = await initWebGPU(wgslCanvas,{ powerPreference: 'high-performance' });

    const wsglTextures = await TextureLoader.loadAll(webgpu.device, {
        key: "NOISE-TEXTURE",
        source: "assets/images/noise.png", 
        type: WgslTextureType.IMAGE,
    }); 
  
    const wgslShaderProps: IWGSLShaderProperties = {
        canvas: wgslCanvas,
        device: webgpu.device,
        context: webgpu.context!,
        shader: defaultMainShader,
        renderBuffers: [
            {
                name: "iChannel0",
                shader: new Material(webgpu.device,
                    wgslFlamesShader 
                ),
                geometry: new Geometry(webgpu.device, rectGeometry),
                textures: wsglTextures 
            }
        ]
    };

    const wgslShaderEntity = new IWGSLShaderEntity("wgsl-shader",
        wgslShaderProps, (ts: number, shaderRender: WGSLShaderRenderer) => {
            // this is an action called for each, frame
     });

     // done with wgsl stuf...

    const strobeEntity = new Entity<IStrobeEffectProps>(
        "Strobe",

        {
            color: "white", // You can change the color
            isOn: false,
            lastBeat: -1, // Initialize to -1 to trigger on the first beat
        },
        (ts, ctx, props, sequence) => strobeEffect(ts, ctx, props, demo.sequence)
    );


    const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
        "ImageOverlay",

        {
            position: ImagePosition.FILL,
            width: demo.settings.width,
            height: demo.settings.height,
            image: AssetsHelper.textureCache!.get("silhouette.png")?.src,
            opacity: 0.7,
            fadeIn: true,
            fadeOut: true,
            duration: 5,
        }
        ,
        (ts, ctx, props) => imageOverlayEffect(ts, ctx, props, demo.sequence)
    );

    const expandingCircleEntity = new Entity<IExpandingCircleEffectProps>(
        "ExpandingCircle",

        {
            x: demo.settings.width / 2,
            y: demo.settings.height / 2,
            radius: 0,
            maxRadius: 450,
            growthRate: 15,
            duration: 5 // Scene duration in seconds
        },
        (ts, ctx, props) => expandingCircleEffect(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );

    const starburstEntity = new Entity<IStarburstProps>(
        "Starburst",

        {
            x: demo.settings.width / 2, // Example x-coordinate
            y: demo.settings.height / 2, // Example y-coordinate
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

        {
            x: 100,
            y: 300,
            text: "EASY AUDIO SYNCRONIZATON",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.settings.audioProperties.bpm,
            ticksPerBeat: demo.settings.audioProperties.ticks
        },
        typeWriterEffect
    );

    const randomSquareEntity = new Entity<IRandomSquareEffectProps>(
        "RandomSquare",

        {
            x: 0,
            y: 0,
            size: 0,
            color: "red",
            lastTick: -1 // Initialize to -1 to add a square on the first bar
        },
        (ts, ctx, props) => randomSquareEffect(ts, ctx, props, demo.sequence.tickCounter) // Pass currentBar from Sequence
    );


    const gridOverlayEntity = new Entity<IGridOverlayEffectProps>(
        "GridOverlay",

        {
            rows: 5,
            cols: 8,
            cellColor: "white",
            activeCells: new Set(),
        },
        (ts, ctx, props, sequence) => gridOverlayEffect(ts, ctx, props, demo.sequence)
    );

    const audioVisualizerEntity = new Entity<IAudioVisualizerProps>(
        "AudioVisualizer",

        {
            x: 0,
            y: 150,
            width: demo.settings.width,
            height: 300,
            barWidth: 5,
            barSpacing: 2,
            numBars: 100,
            color: "red"
        },
        (ts, ctx, props, sequence) => audioVisualizerEffect(ts, ctx, props, demo.sequence)
    );

    const pseudoKnightyanShaderEntity = new GLSLShaderEntity("ShaderEnriry",
        {
            mainFragmentShader: mainFragment,
            mainVertexShader: mainVertex,
            renderBuffers: [
                {
                    name: "MyShader",
                    fragment: pseudoKnightyanFractal,
                    vertex: mainVertex,
                    textures: []
                }
            ]
        }, (ts, render, propertybag) => {
        }, demo.settings.width, demo.settings.height);

    const someKindOfFractalShaderEntity = new GLSLShaderEntity("ShaderEnriry",

        {
            mainFragmentShader: mainFragment,
            mainVertexShader: mainVertex,
            renderBuffers: [
                {
                    name: "MyShader",
                    fragment: someKindOfFractal,
                    vertex: mainVertex,
                    textures: []
                }
            ]
        }, (ts, render, propertybag) => {
        }, demo.settings.width, demo.settings.height);


    const textOverlay = new Entity<ITextEffectProps>(
        "TextEffect",

        {
            x: 100,
            y: 100,
            text: "FULL SHADER SUPPORT".toUpperCase(),
            font: "Big Shoulders Stencil Text",
            size: 60,
            duration: 15 // 5 seconds
        },
        (ts, ctx, props) => textEffect(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );


    const textArrayDisplayEntity = new Entity<ITextArrayDisplayProps>(
        "TextArrayDisplay",

        {
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
        },
        (ts, ctx, props) => {
            textArrayDisplayEffect(ts, ctx, props, demo.sequence);
        }
    );
    textArrayDisplayEntity.addPostProcessor(createBeatShakePostProcessor(3));


    const typeWriter1EntityForFirstScene = new Entity<ITypeWriterEffectProps>(
        "Typewriter",

        {
            x: 100,
            y: 200,
            text: "DEMOLISHED-RAILS",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.settings.audioProperties.bpm,
            ticksPerBeat: demo.settings.audioProperties.ticks
        },
        typeWriterEffect, 1000, 10000
    );

    const typeWriter2EntityForFirstScene = new Entity<ITypeWriterEffectProps>(
        "Typewriter",

        {
            x: 0,
            y: 350,
            text: "FRAMEWORK DEMO",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.settings.audioProperties.bpm,
            ticksPerBeat: demo.settings.audioProperties.ticks
        },
        typeWriterEffect, 5000, 10000
    );

    const gridOverlayEffectEntity = new Entity<IGridOverlayEffectProps>("gridOverlayEffets",
        {
            activeCells: new Set<number>(),
            cellColor: "rgba(255,255,0,0.2)",
            cols: 4,
            rows: 4,

        }, (ts, ctx, props) => gridOverlayEffect(ts, ctx, props, demo.sequence));


    const ballEntityProps: IBallEntityProps = {
        numBalls: 20,
        balls: [],
    };

    const ballEntity = new Entity<IBallEntityProps>(

        "BallEntity",

        ballEntityProps,
        (ts, ctx, props, sequence) => ballEffect(ts, ctx, props, sequence!)
    );

    const stretchingTextProps: IStretchingTextProps = {
        texts: ["BRING", "THE", "BEAT", "BACK"],
        currentIndex: 0,
        font: "Poppins", // Or your custom font
        color: "rgba(255,255,255,0.2)",
        lastBeat: -1,
    };

    const stretchingTextEntity = new Entity<IStretchingTextProps>(
        "StretchingText",

        stretchingTextProps,
        (ts, ctx, props, sequence) => stretchingTextEffect(ts, ctx, props, demo.sequence)
    );

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

    const creditsScrollerProps: ICreditsScrollerProps = {
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

    const creditsEntity = new Entity<ICreditsScrollerProps>(
        "CreditsScroller",

        creditsScrollerProps,
        (ts, ctx, props, sequence) => creditsScrollerEffect(ts, ctx, props, demo.sequence)
    );

    creditsEntity.addPostProcessor(createBeatShakePostProcessor(3));

    // Okey, done setup , add the stuff to scens 


    typeWriter1EntityForFirstScene.onBar<ITypeWriterEffectProps>((ts, count, props) => {
        console.log(`${ts} bar #${count}.`);
        // modify props on bar in this case;
    });


    scenes[0].addEntities(wgslShaderEntity);

    scenes[1].addEntities(
     typeWriter2EntityForFirstScene,
        gridOverlayEffectEntity, ballEntity, stretchingTextEntity)
        .addPostProcessorToEntities(createLensPostProcessor(AssetsHelper.textureCache!.get("lens.png")?.src));

    scenes[2].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[3].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[4].addEntities(strobeEntity, pseudoKnightyanShaderEntity, imageOverlayEntity);
    scenes[5].addEntities(someKindOfFractalShaderEntity, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    scenes[6].addEntities(creditsEntity, imageOverlayEntity, ballEntity);

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



