import {
  DefaultAudioLoader,
  Entity,
  GLSLShaderEntity,
  IEntity,
  Scene,
  Sequence,
  SequenceHelper,
} from '../../src';
import {
  earthShader,
  IEarthShader,
} from '../assets/shaders/earthShader';
import { mainFragment } from '../assets/shaders/mainFragment';
import { mainVertex } from '../assets/shaders/mainVertex';
import { TextAlignment } from './effects/FoL/fadeInOutTextEffect';
import {
  ISimpleTextEffectProps,
  simpleTextEffect,
} from './effects/simpleTextEffect';

/**
 * A class to demonstrate the usage of the demolished-rail framework,
 * including GLSL shaders, Canvas2D rendering, transitions, and music synchronization.
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
  /**
  * Sets up the Sequence and Scene for the demo.
  * @returns A Promise that resolves to the created Sequence.
  */
  async setupSequence(): Promise<Sequence> {
    const sequence = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
    // create a scene starting at 0ms , duration is as long as the audioBuffer 
    await sequence.initialize();
    const scene = new Scene("glsl-shader-scene", 0, sequence.audioBuffer.duration * 1000);
    scene.addEntities(...this.createShaderSceneEntities());
    scene.transitionIn(sequence, 0, SequenceHelper.getDurationForBeats(this.bmp, 4), (ctx, scene, progress) => {
      ctx.globalAlpha = progress;
    });
    sequence.addScene(scene);
    this.sequence = sequence
    return sequence;
  }
  /**
  * Creates the entities for the shader scene.
  * @param sequence - The Sequence instance.
  * @returns An array of IEntity objects.
  */
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
    ];

    const shader = new GLSLShaderEntity<IEarthShader>("earthShader",
      {
        cameraPos: cameraPositions[0],
        amountOfLightning: 1500,
        mainFragmentShader: mainFragment,
        mainVertexShader: mainVertex,
        renderBuffers: [
          {
            name: "a_buffer",
            fragment: earthShader,
            vertex: mainVertex,
            textures: [],
            customUniforms: {
              "amountOfLightning": (uniformLocation: WebGLUniformLocation, gl: WebGLRenderingContext,
                program: WebGLProgram, time: number, entity: GLSLShaderEntity<IEarthShader>
              ) => {
                if (uniformLocation) { // uniform float amountOfLightning
                  gl.uniform1f(uniformLocation, entity.props!.amountOfLightning);
                }
              },
              "cameraPos": (uniformLocation: WebGLUniformLocation, gl: WebGLRenderingContext,
                program: WebGLProgram, time: number, entity: GLSLShaderEntity<IEarthShader>
              ) => {
                if (uniformLocation) { // uniform cameraPos vec3 
                  gl.uniform3fv(uniformLocation!,
                    entity.props!.cameraPos)
                };
              }
            }
          }
        ]
      }, () => {
        // ... your additional logic for the shader entity, argument is optional,but i wanted to show it anyway ...
      }, this.screenCanvas.width, this.screenCanvas.height
    );

    // Swap camera positon on each bar
    shader.onBar<IEarthShader>((ts: number, count: number, propertyBag?: IEarthShader) => {
      const positionIndex = (count) % cameraPositions.length;
      propertyBag!.cameraPos = cameraPositions[positionIndex];
    });

    // change amountOfLightning each tick, 4 times per beat in this case
    shader.onTick<IEarthShader>((ts: number, count: number, propertyBag?: IEarthShader) => {
      const avgFrequency = this.sequence.fftData.reduce((sum, val) => sum + val, 0) / this.sequence.fftData.length;
      propertyBag!.amountOfLightning = (avgFrequency / 255) * 2000;
    });

    // set up a Canvas2D Entity  - Layer that we put on top on the glsl shader
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
      (ts, ctx, props, sequence, entity) => simpleTextEffect(ts, ctx, props, sequence!, entity!)
    );

    // Change text onBar, just showing
    textEntity.onBar<ISimpleTextEffectProps>((ts, count, propertybag?: ISimpleTextEffectProps) => {
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