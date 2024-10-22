"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequence_1 = require("../../src/Engine/Sequence");
const Scene_1 = require("../../src/Engine/Scene");
const Entity_1 = require("../../src/Engine/Entity");
const ShaderEntity_1 = require("../../src/Engine/ShaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const ShaderScene_1 = require("../assets/shaders/ShaderScene");
const typeWriterEffet_1 = require("./effects/typeWriterEffet");
const ranndomSquareByTickEffect_1 = require("./effects/ranndomSquareByTickEffect");
const expandingCircleEffect_1 = require("./effects/expandingCircleEffect");
const starBurstEffct_1 = require("./effects/starBurstEffct");
const textEffect_1 = require("./effects/textEffect");
const iRailGraph = {
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
const expandingCircleProps = {
    x: iRailGraph.canvasWidth / 2,
    y: iRailGraph.canvasHeight / 2,
    radius: 0,
    maxRadius: 450,
    growthRate: 15,
    duration: 5 // Scene duration in seconds
};
const expandingCircleEntity = new Entity_1.Entity("ExpandingCircle", iRailGraph.canvasWidth, iRailGraph.canvasHeight, expandingCircleProps, (ts, ctx, props) => (0, expandingCircleEffect_1.expandingCircleEffect)(ts, ctx, props, sequence) // Pass the sequence instance
);
const starburstProps = {
    x: iRailGraph.canvasWidth / 2, // Example x-coordinate
    y: iRailGraph.canvasHeight / 2, // Example y-coordinate
    numPoints: 8, // Example number of points
    outerRadius: 50,
    innerRadius: 25,
    rotation: 0,
    rotationSpeed: 2, // Example rotation speed
    hue: 0,
    saturation: 100,
    lightness: 50
};
const starburstEntity = new Entity_1.Entity("Starburst", iRailGraph.canvasWidth, // Canvas width
iRailGraph.canvasWidth, // Canvas height
starburstProps, starBurstEffct_1.starburstEffect);
const scene1 = new Scene_1.Scene("Scene 1", 0, 5000); // Starts at 0ms, duration 10000ms (10 second)
scene1.addEntity(expandingCircleEntity);
scene1.addEntity(starburstEntity);
const typeWriterProps = {
    x: 100,
    y: 300,
    text: "Scene with typewriter & randomSquare effects - Simple but neat?",
    index: 0,
    speed: 5, // 5 characters per second
    lastCharacterTime: 0,
    useBPM: true,
    bpm: iRailGraph.audioProperties.bpm,
    ticksPerBeat: iRailGraph.audioProperties.ticks
};
const typeWriterEntity = new Entity_1.Entity("Typewriter", iRailGraph.canvasWidth, iRailGraph.canvasHeight, typeWriterProps, typeWriterEffet_1.typeWriterEffect);
const randomSquareProps = {
    x: 0,
    y: 0,
    size: 0,
    color: "red",
    lastTick: -1 // Initialize to -1 to add a square on the first bar
};
const randomSquareEntity = new Entity_1.Entity("RandomSquare", iRailGraph.canvasWidth, iRailGraph.canvasHeight, randomSquareProps, (ts, ctx, props) => (0, ranndomSquareByTickEffect_1.randomSquareEffect)(ts, ctx, props, sequence.tickCounter) // Pass currentBar from Sequence
);
const scene2 = new Scene_1.Scene("Scene 2", 5000, 15000); // Starts at 1000ms, duration 5000ms
scene2.addEntity(randomSquareEntity);
scene2.addEntity(typeWriterEntity);
const shaderProps = {
    mainFragmentShader: mainFragment_1.mainFragment,
    mainShaderVertex: mainVertex_1.mainVertex,
    rendeBuffers: [
        {
            name: "MyShader",
            fragment: ShaderScene_1.shaderScene,
            vertex: mainVertex_1.mainVertex,
            textures: []
        }
    ]
};
const fractalShaderEntity = new ShaderEntity_1.ShaderEntity("ShaderEnriry", 1200, iRailGraph.canvasHeight, shaderProps, (ts, render, propertybag) => {
    // access render here, i'e set uniforms etc using propertyBag or anyting;
});
const textProps = {
    x: 100,
    y: 300,
    text: "Hello, world!",
    font: "Arial",
    size: 30,
    duration: 15 // 5 seconds
};
const textEntity = new Entity_1.Entity("TextEffect", 1280, 720, textProps, (ts, ctx, props) => (0, textEffect_1.textEffect)(ts, ctx, props, sequence) // Pass the sequence instance
);
const scene3 = new Scene_1.Scene("Scene 3", 15000, 139200); // Starts at 1000ms, duration 5000ms
scene3.addEntity(fractalShaderEntity);
scene3.addEntity(textEntity);
// Create a Sequence
const sequence = new Sequence_1.Sequence(document.querySelector("canvas"), 125, 4, 4, [scene1, scene2, scene3], "/wwwroot/assets/music/music.mp3");
sequence.onBeat((scene, ts) => {
    //  console.log(`Beat! ${scene}:${ts}`);
});
sequence.onTick((scene, ts) => {
    // console.log(`Tick! ${scene}:${ts}`);
});
sequence.onBar((bar) => {
    console.log(`Bar! ${bar} `);
    iRailGraph.audioProperties.bar = bar;
});
// Show Sequence properties
console.log(`Total duration ${sequence.durationMs}`);
// Start the animation
console.log(`Await ready`);
sequence.onReady = () => {
    console.log(`Click to start..`);
    document.addEventListener("click", () => {
        sequence.play();
    });
};
