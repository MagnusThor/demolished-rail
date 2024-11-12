import {
  DefaultAudioLoader,
  Entity,
  IEntity,
  Scene,
  Sequence,
  SequenceHelper,
} from '../../src';
import {
  CompositeEntity,
  ICompositeEntity,
  ICompositeEntityProps,
} from '../../src/Engine/CompositeEntity';
import { easeInOutCubic } from '../../src/Engine/Helpers/EntityHelpers';
import {
  ITextEntranceEffectProps,
  ScrollDirection,
  textEntranceEffect,
} from './effects/textEntranceEffect';

/**
 * A class to demonstrate the usage of the demolished-rail framework,
 * including GLSL shaders, Canvas2D rendering, transitions, and music synchronization.
 */
export class RunScene {
  screenCanvas: HTMLCanvasElement;
  sequence!: Sequence;
  /**
   * Creates a new RunScene instance.
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
    const scene = new Scene("test-scene", 0, sequence.audioBuffer.duration * 1000);
    scene.addEntities(...this.createEntities());
    scene.transitionIn(sequence, 0, SequenceHelper.getDurationForBeats(this.bmp, 4), (ctx, scene, progress) => {
      ctx.globalAlpha = progress;
    });
    sequence.addScene(scene);    
    
    this.sequence = sequence
    return sequence;
  }
 


  createEntities():Array<IEntity>{
 
    const scrollTextEntity = new Entity<ITextEntranceEffectProps>(
      "ScrollText",
      {
        x: 400, // Target x-coordinate
        y: 225, // Target y-coordinate
        text: "Scrolling Text!",
        font: "Arial",
        size: 30,
        scrollInFrom: ScrollDirection.LEFT,
        easingFunction: easeInOutCubic,
        duration: 3 // Scroll in over 3 seconds
      },
      (ts, ctx, props, sequence, entity) => textEntranceEffect(ts, ctx, props, entity!)
    );

    interface ITextBlockProps {
      text: string;
      font: string;
      size: number;
      color: string;
    }    
    const textBlock: ICompositeEntity<ITextBlockProps> = {
      key:"textBlock",
      props: {      
        text: "Hello, world!",
        font: "Arial",
        size: 30,
        color: "white"
      },
      update(timeStamp: number, ctx: CanvasRenderingContext2D, entity:  ICompositeEntity<ITextBlockProps>) {
        const { text, font, size, color } = this.props; 
        ctx.font = `${size}px ${font}`;
        ctx.fillStyle = color;
        ctx.fillText(text, 100, 100);       
      }
    };

    const scrollingTextBlock :ICompositeEntity<ITextEntranceEffectProps> = {
      key:"scrollingTextBlock",
      props:  {
        x: 400, // Target x-coordinate
        y: 225, // Target y-coordinate
        text: "Scrolling Text!",
        font: "Arial",
        size: 30,
        scrollInFrom: ScrollDirection.LEFT,
        easingFunction: easeInOutCubic,
        duration: 3 // Scroll in over 3 seconds
      },
      update(timeStamp: number, ctx: CanvasRenderingContext2D, entity:  ICompositeEntity<ITextBlockProps>) {
        textEntranceEffect(timeStamp, ctx, this.props, entity!)
    }
  };
    
  // Create a BlockEntity and add the textBlock to it
  const blockEntity = new CompositeEntity<ICompositeEntityProps<any>>(
    "TextBlockEntity", 
    800, 
    450, 
    { blocks: [textBlock,scrollingTextBlock] }
  );

  

    return [blockEntity];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunScene(canvas, 110);
  const sequence = await runner.setupSequence();

  sequence.onLowFrameRate((fps) => {
    console.warn(`Low frame rate detected: ${fps.toFixed(2)} FPS`);
  });

  const btn = document.querySelector("BUTTON");
  btn!.textContent = "CLICK TO START!";
  btn!.addEventListener("click", () => {
    document.querySelector("#launch")?.remove();
    sequence.play();
  });
});