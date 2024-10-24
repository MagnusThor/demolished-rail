import { Sequence } from "../../src/Engine/sequence";
import { Scene } from "../../src/Engine/scene";
import { Entity, IEntity } from "../../src/Engine/entity";
import { ShaderEntity } from "../../src/Engine/shaderEntity";
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
import { createBeatShakePostProcessor } from "./postprocessors/createBeatShakePostProcessor";
import { fractalTwo } from "../assets/shaders/fractalTwo";
import { SceneBuilder } from "../../src/Engine/Helpers/sceneBuilder";
import { gridOverlayEffect, IGridOverlayEffectProps } from "./effects/gridOverlayEffect";
import { IParallaxLayerProps, parallaxLayerEffect } from "./effects/paralaxEffect";
import { ballEffect, IBallEntityProps } from "./effects/bubbleParticles";
import { createCRTJitterPostProcessor } from "./postprocessors/createCRTJitterPostProcessor";
import { IStretchingTextProps, stretchingTextEffect } from "./effects/streachingTextEffect";
import { creditsScrollerEffect, ICreditsScrollerProps } from "./effects/creditsScroller";
import { createLensPostProcessor } from "./postprocessors/createLensPostProcessor";


class SetupDemo {
    sequence: Sequence;
    scenes: Scene[] = [];
    settings = {
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
    constructor() {
        this.sequence = new Sequence(
            document.querySelector("canvas") as HTMLCanvasElement,
            100, 4, 4, [], "/wwwroot/assets/music/music.mp3");

    }
    async addAssets(...urls: string[]) {
        await AssetsHelper.loadImages(urls);
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

demo.addAssets("assets/images/silhouette.png","assets/images/lens.png").then((demo: SetupDemo) => {
    // Create the Scenes
    // Music length = 139200 ms;
    const sceneBuilder = new SceneBuilder(139200);
    sceneBuilder.addScene("Scene 0", 20000).
        addScene("Scene 1", 8000).
        addScene("Scene 2", 15000).
        addScene("Scene 4", 15000).
        addScene("Scene 5", 25000).
        durationUntilEndInMs("Scene 6");

    const scenes = sceneBuilder.getScenes();

    // Set up all effects;

    const strobeEntity = new Entity<IStrobeEffectProps>(
        "Strobe",
        demo.settings.width,
        demo.settings.height,
        {
            color: "white", // You can change the color
            isOn: false,
            lastBeat: -1, // Initialize to -1 to trigger on the first beat
        },
        (ts, ctx, props, sequence) => strobeEffect(ts, ctx, props, demo.sequence)
    );


    const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
        "ImageOverlay",
        demo.settings.width,
        demo.settings.height,
        {
            x: 0,
            y: 0,
            width: demo.settings.width,
            height: demo.settings.height,
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
        demo.settings.width,
        demo.settings.height,
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
        demo.settings.width, // Canvas width
        demo.settings.width,  // Canvas height
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
        demo.settings.width,
        demo.settings.height,
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
        demo.settings.width,
        demo.settings.height,
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
        800, // Canvas width
        450, // Canvas height
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
        demo.settings.width,
        demo.settings.height,
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


    const fractalShaderEntityTwo = new ShaderEntity("ShaderEnriry",
        demo.settings.width
        , demo.settings.height,
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
        demo.settings.width
        , demo.settings.height,
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
        demo.settings.width,
        demo.settings.height,
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
        demo.settings.width,
        demo.settings.width,
        {
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
        },
        (ts, ctx, props) => {
            textArrayDisplayEffect(ts, ctx, props, demo.sequence);
        }
    );
    textArrayDisplayEntity.addPostProcessor(createBeatShakePostProcessor(3));


    // Add Entities to the Scens

    // setup a some more test Entities for Scene 0

    const typeWriter1EntityForFirstScene = new Entity<ITypeWriterEffectProps>(
        "Typewriter",
        demo.settings.width,
        demo.settings.height,
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
        demo.settings.width,
        demo.settings.height,
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
        demo.settings.width,
        demo.settings.height, {
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
        demo.settings.width,
        demo.settings.height,
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
        800, // Canvas width
        450, // Canvas height
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
        font:"40px Poppins",
      };
      
      const creditsEntity = new Entity<ICreditsScrollerProps>(
        "CreditsScroller",
        demo.settings.width, // Canvas width
        demo.settings.height, // Canvas height
        creditsScrollerProps,
        (ts, ctx, props, sequence) => creditsScrollerEffect(ts, ctx, props, demo.sequence)
      );

      creditsEntity.addPostProcessor(createBeatShakePostProcessor(3));

    // Okey, done setup , add the stuff to scens 

     scenes[0].addEntities(typeWriter1EntityForFirstScene, 
         typeWriter2EntityForFirstScene,
         gridOverlayEffectEntity,ballEntity,stretchingTextEntity);
     //    .addPostProcessorToEntities(createLensPostProcessor(AssetsHelper.textureCache!.get("lens.png")?.src));
    
    scenes[1].addEntities(expandingCircleEntity, starburstEntity, imageOverlayEntity);
    scenes[2].addEntities(audioVisualizerEntity, randomSquareEntity, imageOverlayEntity, imageOverlayEntity, typeWriterEntity);
    scenes[3].addEntities(strobeEntity, fractalShaderEntityTwo, imageOverlayEntity);
    scenes[4].addEntities(fractalShaderEntityOne, imageOverlayEntity, textOverlay, textArrayDisplayEntity);
    scenes[5].addEntities(creditsEntity,imageOverlayEntity,ballEntity);
   
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


