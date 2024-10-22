import { Sequence } from "../../src/Engine/Sequence";
import { Scene } from "../../src/Engine/Scene";
import { Entity, IEntity } from "../../src/Engine/Entity";
import { IShaderProperties, ShaderEntity } from "../../src/Engine/ShaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { shaderScene } from "../assets/shaders/ShaderScene";
import { IMovingCircleProps, movingCircleEffet } from "./effects/movingCircleEffect";
import { ITypeWriterEffectProps, typeWriterEffect } from "./effects/typeWriterEffet";
import { IRandomSquareEffectProps, randomSquareEffect } from "./effects/ranndomSquareByTickEffect";
import { expandingCircleEffect, IExpandingCircleEffectProps } from "./effects/expandingCircleEffect";
import { IStarburstProps, starburstEffect } from "./effects/starBurstEffct";
import { ITextEffectProps, textEffect } from "./effects/textEffect";
import { IImageOverlayEffectProps, imageOverlayEffect } from "./effects/imageOverlayEffect";
import { TextureCacheHelper } from "../../src/Engine/Helpers/AssetsHelper";



// idea of some kind of graph, in the future, thart loads all the shit
const MockedGraph = {
    canvasWidth: 800,
    canvasHeight: 450,
    audioProperties: {
        bpm: 125,
        ticks: 4,
        beat: 0,
        tick: 0,
        bar: 0,
        avgFreq: 0
    }
};


// load the assets




// use image loader , when i have the energy..

const image = new Image();
image.src = "assets/images/silhouette.png"; // Replace with your image path


const imageOverlayProps: IImageOverlayEffectProps = {
    x: 0,
    y: 0,
    width: MockedGraph.canvasWidth,
    height: MockedGraph.canvasHeight,
    image: image,
    opacity: 0.7,
    fadeIn: true,
    fadeOut: true,
    duration: 5,
};

const imageOverlayEntity = new Entity<IImageOverlayEffectProps>(
    "ImageOverlay",
    MockedGraph.canvasWidth,
    MockedGraph.canvasHeight,
    imageOverlayProps,
    (ts, ctx, props) => imageOverlayEffect(ts, ctx, props)
);




const expandingCircleProps: IExpandingCircleEffectProps = {
    x: MockedGraph.canvasWidth / 2,
    y: MockedGraph.canvasHeight / 2,
    radius: 0,
    maxRadius: 450,
    growthRate: 15,
    duration: 5 // Scene duration in seconds
};


const expandingCircleEntity = new Entity<IExpandingCircleEffectProps>(
    "ExpandingCircle",
    MockedGraph.canvasWidth,
    MockedGraph.canvasHeight,
    expandingCircleProps,
    (ts, ctx, props) => expandingCircleEffect(ts, ctx, props, sequence) // Pass the sequence instance
);


const starburstProps: IStarburstProps = {
    x: MockedGraph.canvasWidth / 2, // Example x-coordinate
    y: MockedGraph.canvasHeight / 2, // Example y-coordinate
    numPoints: 8,  // Example number of points
    outerRadius: 50,
    innerRadius: 25,
    rotation: 0,
    rotationSpeed: 2, // Example rotation speed
    hue: 0,
    saturation: 100,
    lightness: 50
};

const starburstEntity = new Entity<IStarburstProps>(
    "Starburst",
    MockedGraph.canvasWidth, // Canvas width
    MockedGraph.canvasWidth,  // Canvas height
    starburstProps,
    starburstEffect
);




const scene1 = new Scene("Scene 1", 0, 5000); // Starts at 0ms, duration 10000ms (10 second)

scene1.addEntity(expandingCircleEntity);
scene1.addEntity(starburstEntity);
scene1.addEntity(imageOverlayEntity);



const typeWriterProps: ITypeWriterEffectProps = {
    x: 100,
    y: 300,
    text: "Scene with typewriter & randomSquare effects - Simple but neat?",
    index: 0,
    speed: 5, // 5 characters per second
    lastCharacterTime: 0,
    useBPM: true,
    bpm: MockedGraph.audioProperties.bpm,
    ticksPerBeat: MockedGraph.audioProperties.ticks
};

const typeWriterEntity = new Entity<ITypeWriterEffectProps>(
    "Typewriter",
    MockedGraph.canvasWidth,
    MockedGraph.canvasHeight,
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
    MockedGraph.canvasWidth,
    MockedGraph.canvasHeight,
    randomSquareProps,
    (ts, ctx, props) => randomSquareEffect(ts, ctx, props, sequence.tickCounter) // Pass currentBar from Sequence
);





const scene2 = new Scene("Scene 2", 5000, 15000); // Starts at 1000ms, duration 5000ms
scene2.addEntity(randomSquareEntity);
scene2.addEntity(imageOverlayEntity);
scene2.addEntity(typeWriterEntity);





const shaderProps: IShaderProperties = {
    mainFragmentShader: mainFragment,
    mainShaderVertex: mainVertex,
    rendeBuffers: [
        {
            name: "MyShader",
            fragment: shaderScene,
            vertex: mainVertex,
            textures: []
        }
    ]

}



const fractalShaderEntity = new ShaderEntity("ShaderEnriry", 1200, MockedGraph.canvasHeight, shaderProps, (ts, render, propertybag) => {
    // access render here, i'e set uniforms etc using propertyBag or anyting;
});

const textProps: ITextEffectProps = {
    x: 100,
    y: 300,
    text: "Hello, world!",
    font: "Arial",
    size: 30,
    duration: 15 // 5 seconds
};

const textEntity = new Entity<ITextEffectProps>(
    "TextEffect",
    1280,
    720,
    textProps,
    (ts, ctx, props) => textEffect(ts, ctx, props, sequence) // Pass the sequence instance
);

const scene3 = new Scene("Scene 3", 15000, 139200); // Starts at 1000ms, duration 5000ms
scene3.addEntity(fractalShaderEntity);
scene3.addEntity(imageOverlayEntity);
scene3.addEntity(textEntity);





// Create a Sequence
const sequence = new Sequence(
    document.querySelector("canvas") as HTMLCanvasElement,
    125, 4, 4, [scene1, scene2, scene3], "/wwwroot/assets/music/music.mp3");

sequence.onBeat((scene: number, ts: number) => {
    //  console.log(`Beat! ${scene}:${ts}`);
});

sequence.onTick((scene: number, ts: number) => {
    // console.log(`Tick! ${scene}:${ts}`);

});

sequence.onBar((bar) => {
    console.log(`Bar! ${bar} `);

    MockedGraph.audioProperties.bar = bar;


});

// Show Sequence properties

console.log(`Total duration ${sequence.durationMs}`);



// Start the animation


console.log(`Await ready`);

sequence.onReady = () => {
    console.log(`Click to start..`);


    document.addEventListener("click", () => {



        sequence.play();
    })
}


