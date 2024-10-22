import { Sequence } from "../../src/Engine/Sequence";
import { Scene } from "../../src/Engine/Scene";
import { Entity, IEntity } from "../../src/Engine/Entity";
import { IShaderProperties, ShaderEntity } from "../../src/Engine/ShaderEntity";
import { mainFragment } from "../assets/shaders/mainFragment";
import { mainVertex } from "../assets/shaders/mainVertex";
import { shaderScene } from "../assets/shaders/ShaderScene";


// Mock Entities

const demoPros = {
    w:800,
    h:450
}


interface ISample2dEntity {
    x: number
    y: number
    xSpeed: number
    ySpeed: number
}

const movingCircle_props: ISample2dEntity = {
    x: demoPros.w / 2,
    y: demoPros.h / 2,
    xSpeed: 5,
    ySpeed: 5
}

const movingCircle = new Entity<ISample2dEntity>("MovingCircle", demoPros.w, demoPros.h, movingCircle_props, (ts, ctx, propertybag) => {

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

const entity2 = new Entity("Shader 2", demoPros.w, demoPros.h, null, (ts, ctx, props) => {

});



const scene1 = new Scene("Scene 1", 0, 15000); // Starts at 0ms, duration 10000ms (10 second)
scene1.addEntity(movingCircle);



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

const entity3 = new ShaderEntity("ShaderEnriry", 1200, demoPros.h, shaderProps, (ts, ctx, propertybag) => {

   

}
);


const scene2 = new Scene("Scene 2", 15000, 139200); // Starts at 1000ms, duration 5000ms
scene2.addEntity(entity3);


// Create a Sequence
const sequence = new Sequence(
    document.querySelector("canvas") as HTMLCanvasElement,
    125, 4, 4, [scene1, scene2], "/wwwroot/assets/music/music.mp3");

sequence.onBeat((scene: number, ts: number) => {
    //  console.log(`Beat! ${scene}:${ts}`);
});

sequence.onTick((scene: number, ts: number) => {
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
    })
}


