import {
  DefaultAudioLoader,
  IEntity,
  SceneBuilder,
  Sequence,
  SequenceHelper,
} from '../../../src';
import {
  CompositeEntity,
  ICompositeEntity,
  ICompositeEntityProps,
} from '../../../src/Engine/Entity/CompositeEntity';
import { easeInOutCubic } from '../../../src/Engine/Helpers/EntityHelpers';
import {
  IParticleTextEffectProps,
  particleTextEffect,
} from './canvas2d/particleTextEffect';
import {
  ITextEntranceEffectProps,
  ScrollDirection,
  textEntranceEffect,
} from './canvas2d/textEntranceEffect';

interface ITextBlockProps {
  text: string;
  font: string;
  size: number;
  color: string;
}

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

    const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);

    sb.addScene("scene0", 30000) // first scene last for 30 seconds
      .durationUntilEndInMs("scene1"); // last scene until end of Sequence

    sb.getScenes()[0].addEntity(this.cretaeParticleTextEffect()).
    transitionIn(sequence, 0, SequenceHelper.getDurationForBeats(this.bmp, 4), (ctx, scene, progress) => {
      ctx.globalAlpha = progress;
    });

    sb.getScenes()[1].addEntities(...this.createEntities()).transitionIn(sequence, 0, SequenceHelper.getDurationForBeats(this.bmp, 4), (ctx, scene, progress) => {
      ctx.globalAlpha = progress;
    });

    sequence.addScenes(...sb.getScenes());

    this.sequence = sequence
    return sequence;
  }



  cretaeParticleTextEffect(): CompositeEntity<ICompositeEntityProps<any>> {

    interface IBallBlockProps {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }
    
    const ballBlock: ICompositeEntity<IBallBlockProps> = {
      key: "ballBlock",
      props: {
        x: 400,
        y: 225,
        radius: 2,
        vx: 5,
        vy: 3
      },
  
      update(timeStamp: number, ctx: CanvasRenderingContext2D, entity: CompositeEntity<any>) {
        const { x, y, radius, vx, vy } = this.props;    
        // Update ball position for bouncing
        this.props.x += vx;
        this.props.y += vy;
    
        if (this.props.x + radius > ctx.canvas.width || this.props.x - radius < 0) {
          this.props.vx = -vx;
          this.props.vy += (Math.random() - 0.5) * 2; // Add random vertical velocity
        }
        if (this.props.y + radius > ctx.canvas.height || this.props.y - radius < 0) {
          this.props.vy = -vy;
          this.props.vx += (Math.random() - 0.5) * 2; // Add random horizontal velocity
        }
        // Draw the ball (optional, if you want to visualize the ball)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red"; // Example color
        ctx.fill();
      }
    };

    const particleTextProps: IParticleTextEffectProps = {
      text: "The ultimate cosmic abyss".toLocaleUpperCase(), // Your text
      fontSize: 50,
      maxTextWidth: 800 * 0.8, // 80% of canvas width
      gap: 3,
      particleHitRadius: 20000,
      particles: [],

    };



    const textParticles: ICompositeEntity<IParticleTextEffectProps> = {
      key: 'textParticles',
      update: function (timeStamp: number, ctx: CanvasRenderingContext2D,
        entity: CompositeEntity<ICompositeEntityProps<any>>): void {

        particleTextEffect(timeStamp, ctx, this.props!, entity!)
      },
      props: particleTextProps
    }

    // Create a BlockEntity and add the textBlock to it
    const compisiteEntity = new CompositeEntity<ICompositeEntityProps<any>>(
      "TextBlockEntity",
      800,
      450,
      { blocks: [ballBlock,textParticles] } // 
    );

    return compisiteEntity;

  }




  createEntities(): Array<IEntity> {


    
    const textBlock: ICompositeEntity<ITextBlockProps> = {
      key: "textBlock",
      props: {
        text: "Hello, world!",
        font: "Arial",
        size: 30,
        color: "white"
      },
      update(timeStamp: number, ctx: CanvasRenderingContext2D, entity: ICompositeEntity<ITextBlockProps>) {
        const { text, font, size, color } = this.props;
        ctx.font = `${size}px ${font}`;
        ctx.fillStyle = color;
        ctx.fillText(text, 100, 100);
      }
    };

    const scrollingTextBlock: ICompositeEntity<ITextEntranceEffectProps> = {
      key: "scrollingTextBlock",
      props: {
        x: 400, // Target x-coordinate
        y: 225, // Target y-coordinate
        text: "Scrolling Text!",
        font: "Arial",
        size: 30,
        scrollInFrom: ScrollDirection.LEFT,
        easingFunction: easeInOutCubic,
        duration: 3 // Scroll in over 3 seconds
      },
      update(timeStamp: number, ctx: CanvasRenderingContext2D, entity: ICompositeEntity<ITextBlockProps>) {
        textEntranceEffect(timeStamp, ctx, this.props, entity!)
      }
    };

    // Create a BlockEntity and add the textBlock to it
    const blockEntity = new CompositeEntity<ICompositeEntityProps<any>>(
      "TextBlockEntity",
      800,
      450,
      { blocks: [ textBlock, scrollingTextBlock,] }
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