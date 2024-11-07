import {
  DefaultAudioLoader,
  Entity,
  GLSLShaderEntity,
  IEntity,
  Scene,
  Sequence,
  SequenceHelper,
} from '../../src';
import { earthShader } from '../assets/shaders/earthShader';
import { mainFragment } from '../assets/shaders/mainFragment';
import { mainVertex } from '../assets/shaders/mainVertex';
import { TextAlignment } from './effects/FoL/fadeInOutTextEffect';
import {
  ISimpleTextEffectProps,
  simpleTextEffect,
} from './effects/simpleTextEffect';

/**
   * A class to demonstrate the usage of GLSL shaders in the demolished-rail framework.
   */
export class RunShaderScene {
  screenCanvas: HTMLCanvasElement;
  sequence!: Sequence;
  /**
   * Creates a new RunShader instance.
   * @param target - The canvas element to render to.
   */
  constructor(target: HTMLCanvasElement, public bmp: number) {
    this.screenCanvas = target;
  }
  async setupSequence(): Promise<Sequence> {
    const sequence = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
    // create a scene starting at 0ms , duration is as long as the audioBuffer 
    await sequence.initialize();
    const scene = new Scene("glsl-shader-scene", 0, sequence.audioBuffer.duration * 1000);
    scene.addEntities(...this.createShaderSceneEntities());
    scene.transitionIn(sequence, 0, SequenceHelper.getDurationForBeats(this.bmp,4), (ctx, scene, progress) => {
      ctx.globalAlpha = progress;
    });

    sequence.addScene(scene);
    this.sequence = sequence
    return sequence;

  }
  createShaderSceneEntities(): Array<IEntity> {
    const cameraPositions = [
      [0.0, 1.2, 0.7],
      [0.5, 1.0, 0.9],
      [1.0, 0.8, 1.1],
      [0.7, 1.3, 0.6],
      [0.2, 1.1, 1.0],
      [1.2, 0.9, 0.8],
      [0.9, 1.4, 0.5],
      [0.4, 1.0, 1.2],
      [0.0, 1.2, 2.0],
      [-1.0, 0.99, 1.0],
      [1.0, 0.99, 1.0],
      [0.0, 1.2, 0.2],
      [0.0, 0.99, 1.0],
      [0.0, 1.2, 1.2],
      [0.0, 0.9, 1.0],
      [0.0, 1.5, 1.9],
      [0.0, 1.2, 1.9],
      [1.0, 1.5, 1.1],
      [1.0, 1.5, 1.9]
    ]
    let cameraPos = cameraPositions[0];
  

    const shader = new GLSLShaderEntity("earthShader",
      {
        mainFragmentShader: mainFragment,
        mainVertexShader: mainVertex,
        renderBuffers: [
          {
            name: "a_buffer",
            fragment: earthShader,
            vertex: mainVertex,
            textures: [],
            customUniforms: {
              "cameraPos": (uniformLoction: Map<string, WebGLUniformLocation>, gl: WebGLRenderingContext) => {
                if (uniformLoction) { // uniform cameraPos vec3 
                  gl.uniform3fv(uniformLoction!,
                    cameraPos)
                };
              }
            }
          }
        ]
      }, () => {
        // ... your additional logic for the shader entity ...
      }, this.screenCanvas.width, this.screenCanvas.height
    );

    
    shader.onBar((ts: number, count: number) => {
      const positionIndex = (count) % cameraPositions.length; // swap camera positon on bar
      cameraPos = cameraPositions[positionIndex];
    });


    const textEntity = new Entity<ISimpleTextEffectProps>(
      "textEntity",
      {
        x: this.screenCanvas.width / 2,
        y: this.screenCanvas.height / 2,
        texts: ["We are a cosmic accident,but a fortunate one.".toUpperCase()
          , "Swallowed by darkness, crushed by gravity.".toUpperCase(),
        "A rip in the fabric of spacetime.".toUpperCase(),
        "Beyond the event horizon, the unknown awaits".toUpperCase(),
        "The shadow of the universe, holding it all in place".toUpperCase()
        ],
        textIndex: 0,
        font: "Arial",
        size: 20,
        fadeInDuration: 1,
        fadeOutDuration: 1,
        textDuration: 3,
        alignment: TextAlignment.CENTER
      },
      (ts, ctx, props, sequence, entity) => simpleTextEffect(ts, ctx, props, sequence!, textEntity)
    );

    // change text onBar..
    textEntity.onBar<ISimpleTextEffectProps>((ts, count, propertybag: ISimpleTextEffectProps) => {
      propertybag!.textIndex = (propertybag!.textIndex + 1) % propertybag!.texts.length;
      const scene = textEntity.getScene()!; 
      textEntity.startTimeinMs = ts - scene.startTimeinMs;
    });



    return [shader, textEntity];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunShaderScene(canvas, 110);
  const sequence = await runner.setupSequence();

  sequence.onLowFrameRate((fps) => {
    console.warn(`Low frame rate detected: ${fps.toFixed(2)} FPS`);
  });

  const btn = document.querySelector("BUTTON");
  btn!.textContent = "CLICK TO START!";
  btn!.addEventListener("click", () => {
    document.querySelector("#launch")?.remove();
    sequence.play(25);
  });
});