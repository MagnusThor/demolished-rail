import { Sequence } from "../../src/runner/runner";
import { Scene } from "../../src/runner/Scene";
import { Entity } from "../../src/runner/Entity";


// Mock Entities

const uniforms = new Map<string, number>();

uniforms.set("a", 1)
uniforms.set("b", 2)
uniforms.set("c", 3)

const entity1 = new Entity("Shader 1", uniforms);
const entity2 = new Entity("Shader 2");
const entity3 = new Entity("Shader 3");

// Mock Scenes
const scene1 = new Scene("Scene 1", 0, 5000); // Starts at 0ms, duration 10000ms (10 second)
scene1.addEntity(entity1);

const scene2 = new Scene("Scene 2", 5000, 15000); // Starts at 1000ms, duration 5000ms
scene2.addEntity(entity2);
scene2.addEntity(entity3);

// Create a Sequence
const sequence = new Sequence(125, 4, 4, [scene1, scene2], "/wwwroot/assets/music.mp3");

sequence.onBeat((scene: number, ts: number) => {
    console.log(`Beat! ${scene}:${ts}`);
});

sequence.onTick((scene: number, ts: number) => {
    console.log(`Tick! ${scene}:${ts}`);

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
    })
}


