import {
  CompositeEntity,
  DefaultAudioLoader,
  ICompositeEntity,
  ICompositeEntityProps,
  IEntity,
  SceneBuilder,
  Sequence,
} from '../../src';
import { WorldEntity } from '../../src/Engine/Entity/WorldEntity';
import { CollisionHelper } from '../../src/Engine/Helpers/CollisionHelper';
import {
  IBackgroundProps,
  worldBackgroundEffect,
} from './effects/worldBackgroundEffect';

interface IBallBlockProps {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  collidingRectIndex?: number
}

/**
 * A class to demonstrate the usage of the demolished-rail framework,
 * including GLSL shaders, Canvas2D rendering, transitions, and music synchronization.
 */
export class RunWorld {
  screenCanvas: HTMLCanvasElement;
  sequence!: Sequence;
  /**
   * Creates a new RunWorld instance.
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

    const instance = new Sequence(this.screenCanvas, this.bmp, 4, 4, new DefaultAudioLoader("/wwwroot/assets/music/music.mp3"));
    const sequence = await instance.initialize();
    const sb = new SceneBuilder(sequence.audioBuffer.duration * 1000);

        // create a scene starting at 0ms , duration is as long as the audioBuffer 
    sb.durationUntilEndInMs("scene0"); 
    (sb.getScenes())[0]!.addEntities(...this.createWorld(sequence));
    sequence.addScenes(...sb.getScenes());

    this.sequence = sequence
    return sequence;
  }

  createWorld(sequence: Sequence): Array<IEntity> {

    const world = new WorldEntity("our-world", {
      worldHeight: this.screenCanvas.height,
      worldWidth: this.screenCanvas.width * 10 ,// make it 10 x the screen canvas
      viewportWidth: this.screenCanvas.width,
      viewportHeight: this.screenCanvas.height,
      viewportX: 0,
      blocks: []
    });

    // Set up the background entity to use in the World
    const backgroundProps: IBackgroundProps = {
      rectangles: []
    }
    const worldBg: ICompositeEntity<IBackgroundProps> = {
      key: 'background',
      update: function (timeStamp: number, ctx: CanvasRenderingContext2D,
        entity: CompositeEntity<ICompositeEntityProps<any>>): void {
        worldBackgroundEffect(timeStamp, ctx, this.props);
      },
      props: backgroundProps
    };

    // Set up a second entity for the World
    const ballBlock: ICompositeEntity<IBallBlockProps> = {
      key: "ballBlock",
      props: {
        x: 400,
        y: 225,
        radius: 20,
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
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red"; // Example color
        ctx.fill();
      }
    };

    // add a collision detector , of the ball is colliding with a rect 
    world.addCollisionDetector<
    { x: number, y: number, radius: number,collidingRectIndex?: number },
    { rectangles: { x: number, y: number, width: number, height: number }[] }  >(
    "ballBlock",
    "background",
    (ball, background) => {
      // Find the index of the colliding rectangle
      const collidingIndex = background.rectangles.findIndex(rect => {
        return CollisionHelper.rectangularDetection(
          { x: ball.x, y: ball.y, w: ball.radius * 2, h: ball.radius * 2 },
          { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
        );
      });  
      if (collidingIndex !== -1) {
        // Store the colliding rectangle's index in the ball's props
        ball.collidingRectIndex = collidingIndex; 
        return true; // Collision detected
      }  
      return false; // No collision
    },
    (ball, background) => {
      // Access the colliding rectangle's index from the ball's props , and remove it
      const collidingIndex = ball.collidingRectIndex; 
      if (collidingIndex !== undefined) {
        background.rectangles.splice(collidingIndex, 1); 
      }
    }
  );

    // add entities to the world's "building blocks"
    world.addBlocks(worldBg,ballBlock);

    // just a test how we can sync viewports on frame?
    sequence.onFrame((scene, time) => {
      const ballX = world.findBlock<{ x: number }>("ballBlock")?.props.x;
      if (ballX !== undefined) {
        // Center the viewport on the ball's x position
        const viewportX = ballX - world.props.viewportWidth / 2;
        world.setViewportX(viewportX);
      }
    });
    return [world];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunWorld(canvas, 110);
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