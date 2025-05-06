import {
  DefaultAudioLoader,
  InputHelper,
  SceneBuilder,
  Sequence,
  SequenceHelper,
} from '../../../src';
import { EndScene } from './EndScene';
import { AssetsManager } from './helpers/AssetsManager';
import { IDemo } from './interface/IDemo';
import { IntroScene } from './IntroScene';
import {
  Scene1Shader,
  textEntity,
} from './Scene1Shader';
import { Scene2Shader } from './Scene2Shader';

export const GLOBALS = {
    width: 800,
    height: 450,  
}

//Echoes of the Eathersea runner - debugging purposes only

export const setup = async (settings: IDemo): Promise<Sequence> => {
    const screenCanvas = document.querySelector("canvas") as HTMLCanvasElement;
   
    const sequence = new Sequence(screenCanvas, settings.audio.bpm,
        settings.audio.ticks, settings.audio.bpb, new DefaultAudioLoader(settings.audio.src));
    await sequence.initialize();   
    const setupScenes = (async () => {     
        console.log("Audio buffer duration:", sequence.audioBuffer.duration * 100);
        const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);    
        settings.scenes.forEach(scene => {
            sb.addScene(scene.name, scene.duration || 0);
            sb.getScenes().find((s) => s.name === scene.name)
             ?.addEntities(...scene.entities);
        });
        sequence.addScenes(...sb.getScenes());


        
    });

   ;
    

    document.body.addEventListener("keyup", (event) => { // just  for debugging
        console.log(sequence.currentTime);
    });
    const btn = document.querySelector("BUTTON");
    btn!.textContent = "CLICK TO START!";
    btn!.addEventListener("click", () => {
        document.querySelector("#launch")?.remove();

        sequence.play();
        

        

        
    });

    setupScenes();
    return sequence
};


document.addEventListener("DOMContentLoaded", async () => {


    // Load assets

    await AssetsManager.instance.load([
        "images/logo-fol.png"]);


    // Echoes of the Eathersea
    const settings: IDemo = {
        audio: {
            src: "/wwwroot/assets/music/demo.mp3",
            bpm: 122,
            ticks: 400,
            bpb: 4
        },
        graphics: {
            textures: [
                "images/logo-fol.png"
            ]
        },
        scenes: [
            {
                index: 0,
                name: "intro",
                duration: 31800,
                entities:IntroScene(),
                timers:[
                    {
                        key:"logoFading",
                        startTime: SequenceHelper.getDurationForBeats(122,4),
                        duration: SequenceHelper.getDurationForBeats(122,16)
                    }
                ]
                
            },
            {
                index: 1,
                name: "nebula",
                duration: 31800,
                entities: [Scene2Shader()]
            },
            {
                index: 2,
                name: "xo-planet",
                duration: 31800,
                entities: [ Scene1Shader(),textEntity]
            },           
            {
                index: 255,
                name: "endScene",
                duration: 31800,
                entities: EndScene(),
            }
        ]
    };
    await setup(settings).then((sequence) => {
        console.log("Sequence initialized:", sequence);
        sequence.scenes.forEach((scene) => {           
            console.log("Scene:", scene.name,"StartTime",scene.startTimeinMs, "Duration:", scene.durationInMs);
        });
        sequence.play();

        
            const inputHelper = new InputHelper(document.querySelector("canvas") as HTMLCanvasElement);

           // setup a div showing the current time of the sequence and beats and bar
           const immediate = document.createElement("div");
           immediate.classList.add("immediate");
           document.body.appendChild(immediate);
           sequence.play(200,(ts,frame,beat,ba,tick) => {
            // also show the name of the current scene 
               const currentScene = sequence.currentScene;
                immediate.innerHTML = `Current Scene: ${currentScene?.name}<br>`;
               immediate.innerHTML += `Time: ${ts?.toFixed(0)}ms<br>Frame: ${frame}<br>Beat: ${beat}<br>Bar: ${ba}<br>Tick: ${tick}`;
               immediate.innerHTML += `<br>Mouse X: ${inputHelper.getMouseX()}<br>Mouse Y: ${inputHelper.getMouseY()}`;
               const normalizedMouseCoords = inputHelper.getMouseNormalizedPosition();
                immediate.innerHTML += `<br>Mouse Normalized X: ${normalizedMouseCoords.x.toFixed(2)}
                <br>Mouse Normalized Y: ${normalizedMouseCoords.y.toFixed(2)}<br>Mouse Normalized Z: ${normalizedMouseCoords.z.toFixed(2)}`;
               // also add mouse position and key pressed 
                if(inputHelper.isMouseButtonPressed(0)){
                    // if button is , store the mouse coordinates in a object, 
                    // store the mouse coordinates in a object,
                    const mouseCoords = {
                        x: inputHelper.getMouseX(),
                        y: inputHelper.getMouseY(),
                        z: inputHelper.getMouseZoom()
                    };
                    localStorage.setItem("mouseCoords",JSON.stringify(mouseCoords));
                } 
           });
           



    }).catch((error) => {
        console.error("Error setting up sequence:", error);
    });

  

});
