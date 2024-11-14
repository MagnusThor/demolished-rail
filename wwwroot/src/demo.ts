import { Canvas2DEntity } from '../../src';
import { DefaultAudioLoader } from '../../src/Engine/Audio/AudioLoader';
import { GLSLShaderEntity } from '../../src/Engine/Entity/GLSLShaderEntity';
import { AssetsHelper } from '../../src/Engine/Helpers/AssetsHelper';
import { SceneBuilder } from '../../src/Engine/Helpers/SceneBuilder';
import {
  WGSLTextureLoader,
  WGSLTextureType,
} from '../../src/Engine/ShaderRenderers/WebGPU/TextureLoader';
import {
  initWebGPU,
} from '../../src/Engine/ShaderRenderers/WebGPU/WgslShaderRenderer';
import { mainFragment } from '../assets/shaders/mainFragment';
import { mainVertex } from '../assets/shaders/mainVertex';
import {
  pseudoKnightyanFractal,
} from '../assets/shaders/pseudoKnightyanFractal';
import { someKindOfFractal } from '../assets/shaders/someKindOfFractal';
import {
  ballEffect,
  IBallEntityProps,
} from './effects/bubbleParticles';
import {
  creditsScrollerEffect,
  ICreditsScrollerProps,
} from './effects/creditsScroller';
import {
  expandingCircleEffect,
  IExpandingCircleEffectProps,
} from './effects/expandingCircleEffect';
import {
  audioVisualizerEffect,
  IAudioVisualizerProps,
} from './effects/fftAnalyzerEffect';
import {
  gridOverlayEffect,
  IGridOverlayEffectProps,
} from './effects/gridOverlayEffect';
import {
  IImageOverlayEffectProps,
  imageOverlayEffect,
  ImagePosition,
} from './effects/imageOverlayEffect';
import {
  IRandomSquareEffectProps,
  randomSquareEffect,
} from './effects/ranndomSquareByTickEffect';
import {
  IStarburstProps,
  starburstEffect,
} from './effects/starBurstEffct';
import {
  IStretchingTextProps,
  stretchingTextEffect,
} from './effects/streachingTextEffect';
import {
  IStrobeEffectProps,
  strobeEffect,
} from './effects/strobeEffect';
import {
  ITextArrayDisplayProps,
  textArrayDisplayEffect,
} from './effects/textArrayDisplayEffect';
import {
  ITextEffectProps,
  textEffect,
} from './effects/textEffect';
import {
  ITypeWriterEffectProps,
  typeWriterEffect,
} from './effects/typeWriterEffet';
import {
  createBeatShakePostProcessor,
} from './postprocessors/createBeatShakePostProcessor';
import {
  createLensPostProcessor,
} from './postprocessors/createLensPostProcessor';
import { SetupDemo } from './SetupDemo';

// get the music as baase
const demo = new SetupDemo(new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));

demo.addAssets("assets/images/silhouette.png", "assets/images/lens.png").then(async (demo: SetupDemo) => {

await demo.sequence.initialize();
    
    const sceneBuilder = new SceneBuilder(demo.sequence.audioBuffer.duration * 1000);
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
    const wgslCanvas = document.createElement("canvas");  // target canvas for WGSLShader
    wgslCanvas.width = demo.targetCanvas.width; wgslCanvas.height = demo.targetCanvas.height;

    const webgpu = await initWebGPU(wgslCanvas, { powerPreference: 'high-performance' });

    // preload textures to use in WGSL Shader
    const wsglTextures = await WGSLTextureLoader.loadAll(webgpu.device, {
        key: "NOISE-TEXTURE",
        source: "assets/images/noise.png",
        type: WGSLTextureType.IMAGE,
    });

   

    const strobeEntity = new Canvas2DEntity<IStrobeEffectProps>(
        "Strobe",

        {
            color: "white", // You can change the color
            isOn: false,
            lastBeat: -1, // Initialize to -1 to trigger on the first beat
        },
        (ts, ctx, props, sequence) => strobeEffect(ts, ctx, props, demo.sequence)
    );


    const imageOverlayEntity = new Canvas2DEntity<IImageOverlayEffectProps>(
        "ImageOverlay",

        {
            position: ImagePosition.FILL,
            width: demo.targetCanvas.width,
            height: demo.targetCanvas.height,
            image: AssetsHelper.textureCache!.get("silhouette.png")?.src,
            opacity: 0.7,
            fadeIn: true,
            fadeOut: true,
            duration: 5,
        }
        ,
        (ts, ctx, props) => imageOverlayEffect(ts, ctx, props, demo.sequence)
    );

    const expandingCircleEntity = new Canvas2DEntity<IExpandingCircleEffectProps>(
        "ExpandingCircle",

        {
            x: demo.targetCanvas.width / 2,
            y: demo.targetCanvas.height / 2,
            radius: 0,
            maxRadius: 450,
            growthRate: 15,
            duration: 5 // Scene duration in seconds
        },
        (ts, ctx, props) => expandingCircleEffect(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );

    const starburstEntity = new Canvas2DEntity<IStarburstProps>(
        "Starburst",

        {
            x: demo.targetCanvas.width / 2, // Example x-coordinate
            y: demo.targetCanvas.height / 2, // Example y-coordinate
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

    const typeWriterEntity = new Canvas2DEntity<ITypeWriterEffectProps>(
        "Typewriter",

        {
            x: 100,
            y: 300,
            text: "EASY AUDIO SYNCRONIZATON",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.audioProperties.bpm,
            ticksPerBeat: demo.audioProperties.ticks
        },
        typeWriterEffect
    );

    const randomSquareEntity = new Canvas2DEntity<IRandomSquareEffectProps>(
        "RandomSquare",

        {
            x: 0,
            y: 0,
            size: 0,
            color: "red",
            lastTick: -1 // Initialize to -1 to add a square on the first bar
        },
        (ts:number, ctx:CanvasRenderingContext2D, props:IRandomSquareEffectProps) => 
                randomSquareEffect(ts, ctx, props, demo.sequence.tickCounter) // Pass currentBar from Sequence
    );


    const gridOverlayEntity = new Canvas2DEntity<IGridOverlayEffectProps>(
        "GridOverlay",

        {
            rows: 5,
            cols: 8,
            cellColor: "white",
            activeCells: new Set(),
        },
        (ts:number, ctx:CanvasRenderingContext2D, props:IGridOverlayEffectProps) => gridOverlayEffect(ts, ctx, props, demo.sequence)
    );

    const audioVisualizerEntity = new Canvas2DEntity<IAudioVisualizerProps>(
        "AudioVisualizer",

        {
            x: 0,
            y: 150,
            width: demo.targetCanvas.width,
            height: 300,
            barWidth: 5,
            barSpacing: 2,
            numBars: 100,
            color: "red"
        },
        (ts:number, ctx:CanvasRenderingContext2D, props:IAudioVisualizerProps): void => audioVisualizerEffect(ts, ctx, props, demo.sequence)
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
        }, (ts: any, render: any, propertybag: any) => {
        }, demo.targetCanvas.width, demo.targetCanvas.height);

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
        }, (ts: any, render: any, propertybag: any) => {
        }, demo.targetCanvas.width, demo.targetCanvas.height);


    const textOverlay = new Canvas2DEntity<ITextEffectProps>(
        "TextEffect",

        {
            x: 100,
            y: 100,
            text: "FULL SHADER SUPPORT".toUpperCase(),
            font: "Big Shoulders Stencil Text",
            size: 60,
            duration: 15 // 5 seconds
        },
        (ts:number, ctx:CanvasRenderingContext2D, props:ITextEffectProps) => textEffect(ts, ctx, props, demo.sequence) // Pass the sequence instance
    );


    const textArrayDisplayEntity = new Canvas2DEntity<ITextArrayDisplayProps>(
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
            font: demo.font,
            size: 60,
            currentBeat: 0,
        },
        (ts:number, ctx:CanvasRenderingContext2D, props:ITextArrayDisplayProps) => {
            textArrayDisplayEffect(ts, ctx, props, demo.sequence);
        }
    );
    textArrayDisplayEntity.addPostProcessor(createBeatShakePostProcessor(3));


    const typeWriter1EntityForFirstScene = new Canvas2DEntity<ITypeWriterEffectProps>(
        "Typewriter",

        {
            x: 100,
            y: 200,
            text: "DEMOLISHED-RAILS",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.audioProperties.bpm,
            ticksPerBeat: demo.audioProperties.ticks
        },
        typeWriterEffect, 1000, 10000
    );

    typeWriter1EntityForFirstScene.onBar<ITypeWriterEffectProps>((ts, count, props) => {
        console.log(`${ts} bar #${count}.`);
        // modify props on bar in this case;
    });


    const typeWriter2EntityForFirstScene = new Canvas2DEntity<ITypeWriterEffectProps>(
        "Typewriter",

        {
            x: 0,
            y: 350,
            text: "FRAMEWORK DEMO",
            index: 0,
            speed: 5, // 5 characters per second
            lastCharacterTime: 0,
            useBPM: true,
            bpm: demo.audioProperties.bpm,
            ticksPerBeat: demo.audioProperties.ticks
        },
        typeWriterEffect, 5000, 10000
    );


    
    const gridOverlayEffectEntity = new Canvas2DEntity<IGridOverlayEffectProps>("gridOverlayEffets",
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

    const ballEntity = new Canvas2DEntity<IBallEntityProps>(
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

    const stretchingTextEntity = new Canvas2DEntity<IStretchingTextProps>(
        "StretchingText",
        stretchingTextProps,
        (ts:number, ctx:CanvasRenderingContext2D, props:IStretchingTextProps) => stretchingTextEffect(ts, ctx, props, demo.sequence)
    );
 

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

        lineHeight: 80,        scrollSpeed: 40,
        fadeInDuration: 0.5,
        fadeOutDuration: 0.5,
        font: "40px Poppins",
    };

    const creditsEntity = new Canvas2DEntity<ICreditsScrollerProps>(
        "CreditsScroller",
        creditsScrollerProps,
        (ts:number, ctx:CanvasRenderingContext2D, props:ICreditsScrollerProps) => creditsScrollerEffect(ts, ctx, props, demo.sequence)
    );

    creditsEntity.addPostProcessor(createBeatShakePostProcessor(3));

    // Okey, done setup , add the stuff to scens 
    

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


    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();
        demo.sequence.play();
    });









