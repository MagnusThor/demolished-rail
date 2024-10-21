"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("../../src/runner/runner");
const Scene_1 = require("../../src/runner/Scene");
const Entity_1 = require("../../src/runner/Entity");
// Mock Entities
const uniforms = new Map();
uniforms.set("a", 1);
uniforms.set("b", 2);
uniforms.set("c", 3);
const entity1 = new Entity_1.Entity("Shader 1", uniforms);
const entity2 = new Entity_1.Entity("Shader 2");
const entity3 = new Entity_1.Entity("Shader 3");
// Mock Scenes
const scene1 = new Scene_1.Scene("Scene 1", 0, 5000); // Starts at 0ms, duration 10000ms (10 second)
scene1.addEntity(entity1);
const scene2 = new Scene_1.Scene("Scene 2", 5000, 15000); // Starts at 1000ms, duration 5000ms
scene2.addEntity(entity2);
scene2.addEntity(entity3);
// Create a Sequence
const sequence = new runner_1.Sequence(125, 4, 4, [scene1, scene2], "/wwwroot/assets/music.mp3");
sequence.onBeat((scene, ts) => {
    console.log(`Beat! ${scene}:${ts}`);
});
sequence.onTick((scene, ts) => {
    console.log(`Tick! ${scene}:${ts}`);
});
sequence.onBar(() => {
    console.log(`Bar!`);
});
// Show Sequence properties
console.log(`Total duration ${sequence.durationMs}`);
// Start the animation
console.log(`Click to start..`);
document.addEventListener("click", () => {
    sequence.play();
});
