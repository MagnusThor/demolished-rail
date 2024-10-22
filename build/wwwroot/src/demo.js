"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequence_1 = require("../../src/Engine/Sequence");
const Scene_1 = require("../../src/Engine/Scene");
const Entity_1 = require("../../src/Engine/Entity");
const ShaderEntity_1 = require("../../src/Engine/ShaderEntity");
const mainFragment_1 = require("../assets/shaders/mainFragment");
const mainVertex_1 = require("../assets/shaders/mainVertex");
const ShaderScene_1 = require("../assets/shaders/ShaderScene");
// Mock Entities
const demoPros = {
    w: 800,
    h: 450
};
const movingCircle_props = {
    x: demoPros.w / 2,
    y: demoPros.h / 2,
    xSpeed: 5,
    ySpeed: 5
};
const movingCircle = new Entity_1.Entity("MovingCircle", demoPros.w, demoPros.h, movingCircle_props, (ts, ctx, propertybag) => {
    propertybag.x += propertybag.xSpeed;
    propertybag.y += propertybag.ySpeed;
    ctx.strokeStyle = "red";
    // Bounce off the edges of the canvas
    if (propertybag.x + 40 > ctx.canvas.width || propertybag.x - 40 < 0) {
        propertybag.xSpeed = -propertybag.xSpeed;
    }
    if (propertybag.y + 40 > ctx.canvas.height || propertybag.y - 40 < 0) {
        propertybag.ySpeed = -propertybag.ySpeed;
    }
    ctx.beginPath();
    ctx.arc(propertybag.x, propertybag.y, 40, 0, 2 * Math.PI);
    ctx.stroke();
});
const entity2 = new Entity_1.Entity("Shader 2", demoPros.w, demoPros.h, null, (ts, ctx, props) => {
});
const scene1 = new Scene_1.Scene("Scene 1", 0, 15000); // Starts at 0ms, duration 10000ms (10 second)
scene1.addEntity(movingCircle);
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
const entity3 = new ShaderEntity_1.ShaderEntity("ShaderEnriry", 1200, demoPros.h, shaderProps, (ts, ctx, propertybag) => {
});
const scene2 = new Scene_1.Scene("Scene 2", 15000, 139200); // Starts at 1000ms, duration 5000ms
scene2.addEntity(entity3);
// Create a Sequence
const sequence = new Sequence_1.Sequence(document.querySelector("canvas"), 125, 4, 4, [scene1, scene2], "/wwwroot/assets/music/music.mp3");
sequence.onBeat((scene, ts) => {
    //  console.log(`Beat! ${scene}:${ts}`);
});
sequence.onTick((scene, ts) => {
    // console.log(`Tick! ${scene}:${ts}`);
});
sequence.onBar((bar) => {
    console.log(`Bar! ${bar} `);
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
