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

import { TextureCacheHelper } from "../../src/Engine/Helpers/assetsHelper";
import { audioVisualizerEffect, IAudioVisualizerProps } from "./effects/fftAnalyzerEffect";
import { IStrobeEffectProps, strobeEffect } from "./effects/strobeEffect";
import { createBlurPostProcessor } from "../../src/Engine/Helpers/postProcessors";
import { createBeatShakePostProcessor } from "./postprocessors/createBeatShakePostProcessor";
import { fractalTwo } from "../assets/shaders/fractalTwo";




class SetupDemo {
    sequence: Sequence;
    scenes: Scene[] = [];
    MockedGraph = {
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
    constructor() {
        this.sequence = new Sequence(
            document.querySelector("canvas") as HTMLCanvasElement,
            125, 4, 4, [], "/wwwroot/assets/music/music.mp3");

    }
    async addAsset(url: string) {
        await TextureCacheHelper.loadImage(url);
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


    // Scene 1
    const scene1 = new Scene("Scene 1", 0, 5000); 

    const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
        "ImageOverlay",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        {
            x: 0,
            y: 0,
            width: instance.MockedGraph.canvasWidth,
            height: instance.MockedGraph.canvasHeight,
            image: TextureCacheHelper.textureCache!.get("silhouette.png")?.src,
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


   
    scene1.addEntity(expandingCircleEntity);
    scene1.addEntity(starburstEntity);
    scene1.addEntity(imageOverlayEntity);

    instance.addScene(scene1);


    // Scene 2


    const scene2 = new Scene("Scene 2", 5000, 15000); 

    const typeWriterProps: ITypeWriterEffectProps = {
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

    const typeWriterEntity = new Entity<ITypeWriterEffectProps>(
        "Typewriter",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        typeWriterProps,
        typeWriterEffect
    );

    const randomSquareProps: IRandomSquareEffectProps = {
        x: 0,
        y: 0,
        size: 0,
        color: "red",
        lastTick: -1 // Initialize to -1 to add a square on the first bar
    };

    const randomSquareEntity = new Entity<IRandomSquareEffectProps>(
        "RandomSquare",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        randomSquareProps,
        (ts, ctx, props) => randomSquareEffect(ts, ctx, props, instance.sequence.tickCounter) // Pass currentBar from Sequence
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


    
    scene2.addEntity(audioVisualizerEntity);
    scene2.addEntity(randomSquareEntity);
    scene2.addEntity(imageOverlayEntity);
    scene2.addEntity(typeWriterEntity);
   
    
    instance.addScene(scene2);


    const scene3 = new Scene("Scene 3",20000,20000);

    const strobeProps: IStrobeEffectProps = {
        color: "white", // You can change the color
        isOn: false,
        lastBeat: -1, // Initialize to -1 to trigger on the first beat
      };
      
      const strobeEntity = new Entity<IStrobeEffectProps>(
        "Strobe",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        strobeProps,
        (ts, ctx, props, sequence) => strobeEffect(ts, ctx, props, instance.sequence)
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
        // access render here, i'e set uniforms etc using propertyBag or anyting;
    });

      scene3.addEntity(strobeEntity);
      scene3.addEntity(fractalShaderEntityTwo);
      scene3.addEntity(imageOverlayEntity);
     

      instance.addScene(scene3);



  

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
        // access render here, i'e set uniforms etc using propertyBag or anyting;
    });

    const textOverlayProps: ITextEffectProps = {
        x: 100,
        y: 100,
        text: "Vad du kan förvänta dig....".toUpperCase(),
        font: "Big Shoulders Stencil Text",
        size: 60,
        duration: 15 // 5 seconds
    };

    const textOverlay = new Entity<ITextEffectProps>(
        "TextEffect",
        instance.MockedGraph.canvasWidth,
        instance.MockedGraph.canvasHeight,
        textOverlayProps,
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



    const scene4 = new Scene("Scene 4", 40000,140000 );
    scene4.addEntity(fractalShaderEntityOne);
    scene4.addEntity(imageOverlayEntity);
    scene4.addEntity(textOverlay);
    
    textArrayDisplayEntity.addPostProcessor(createBeatShakePostProcessor(3));
    scene4.addEntity(textArrayDisplayEntity)


    instance.addScene(scene4);

 
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


