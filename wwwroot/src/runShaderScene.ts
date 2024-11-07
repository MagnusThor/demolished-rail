import {
  DefaultAudioLoader,
  GLSLShaderEntity,
  IEntity,
  Scene,
  Sequence,
  SequenceHelper,
} from '../../src';
import { earthShader } from '../assets/shaders/earthShader';
import { mainFragment } from '../assets/shaders/mainFragment';
import { mainVertex } from '../assets/shaders/mainVertex';

/**
   * A class to demonstrate the usage of WGSL shaders in the demolished-rail framework.
   */
export class RunShaderScene {
  screenCanvas: HTMLCanvasElement;
  /**
   * Creates a new RunShader instance.
   * @param target - The canvas element to render to.
   */
  constructor(target: HTMLCanvasElement,public bmp:number) {
    this.screenCanvas = target;
  }
  async setupSequence(): Promise<Sequence> {
    const sequence = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
    // create a scene starting at 0ms , duration is as long as the audioBuffer 
    await sequence.initialize();
    const scene = new Scene("glsl-shader-scene", 0, sequence.audioBuffer.duration * 1000);
    scene.addEntities(...this.createShaderSceneEntities());
    sequence.addScene(scene);
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
    const waitForMsUntilStart = SequenceHelper.getDurationForBeats(this.bmp,8) // wait 8 beats

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
      }, this.screenCanvas.width, this.screenCanvas.height,waitForMsUntilStart
    );

    shader.onBar((ts: number, count: number) => {
      const positionIndex = (count) % cameraPositions.length; // swap camera positon on bar
      cameraPos = cameraPositions[positionIndex];
    });
    return [shader];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunShaderScene(canvas,122); 
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