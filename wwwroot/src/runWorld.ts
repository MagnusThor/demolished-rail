import {
  AssetsHelper,
  CompositeEntity,
  DefaultAudioLoader,
  EngineLogger,
  ICompositeEntity,
  ICompositeEntityProps,
  IEntity,
  InputHelper,
  SceneBuilder,
  Sequence,
} from '../../src';
import { WorldEntity } from '../../src/Engine/Entity/WorldEntity';
import {
  ISpriteBlockProps,
  Sprite,
  SpriteAnimationDirection,
  SpriteSheet,
} from '../../src/Engine/Helpers/Canvas/SpriteSheet';
import { CollisionHelper } from '../../src/Engine/Helpers/CollisionHelper';
import {
  IBackgroundProps,
  worldBackgroundEffect,
} from './effects/worldBackgroundEffect';

export class RunWorld {
  screenCanvas: HTMLCanvasElement;
  sequence!: Sequence;
  worldAssets: HTMLImageElement[] | undefined;
  inputHelper: InputHelper;
  /**
   * Creates a new RunWorld instance.
   * @param target - The canvas element to render to.
   */
  constructor(target: HTMLCanvasElement, public bmp: number) {
    this.screenCanvas = target;
    this.inputHelper=  new InputHelper(target);
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

  /**
   * Load the image assets
   *
   * @param {string[]} images
   * @return {*}  {Promise<HTMLImageElement[]>}
   * @memberof RunWorld
   */
  async loadAssets(images:string[]):Promise<HTMLImageElement[]>{
    const result =  await AssetsHelper.loadImages(images);
    return result;
  }



  private createAstronaut():ICompositeEntity<any>
  {
    
      interface IAstronautEntity extends ISpriteBlockProps
      {
        input: InputHelper;
        radius:number;
        collidingRectIndex:number;
      };

      const spriteSheet = new SpriteSheet(this.worldAssets![0], 144, 24);

      const astronautEntity: ICompositeEntity<IAstronautEntity> = {
        key: "astronautEntity",
        props: {
          collidingRectIndex:-1,
          radius:24,
          x:0,
          y:225,
          input: this.inputHelper,
          spriteSheet: new SpriteSheet(this.worldAssets![0], 24, 24), // create the spritesheet
          sprite: new Sprite(spriteSheet.image,{x:0,y:0},{width:24,height:24}, // create the sprite (24x24)
             {
              frames: [0, 1, 2,3,4,5],  // animation 
              speed: 10, // 10 frames per second
              direction: SpriteAnimationDirection.VERTICAL, // extract sprites VERTICAL in spritesheet
              loop: true, 
              currentFrame:0           
            }        
          )
        },
        update(timeStamp: number, ctx: CanvasRenderingContext2D,entity: ICompositeEntity<IAstronautEntity> ) {
          const { sprite,input,x,y } = this.props;          
          if(input.isKeyPressed("ArrowRight")){
              this.props.x++;            
          }
          if(input.isKeyPressed("ArrowLeft")){            
            this.props.x--            
          }
          if(input.isKeyPressed("ArrowDown")){
              this.props.y++
              console.log(this.props.y);
          }

          if(input.isKeyPressed("ArrowUp")){ 
            this.props.y--;
            console.log(this.props.y);
          }


             
           sprite!.update(1 / 60,ctx); 
           sprite!.draw(ctx,x,y)
      
        }
      };
    return astronautEntity;
  }

  /**
   * Create an example world ( interactive animation )
   *
   * @param {Sequence} sequence
   * @return {*}  {Array<IEntity>}
   * @memberof RunWorld
   */
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
    const worldBackgroud: ICompositeEntity<IBackgroundProps> = {
      key: 'background',
      update: function (timeStamp: number, ctx: CanvasRenderingContext2D,
        entity: CompositeEntity<ICompositeEntityProps<any>>): void {
        worldBackgroundEffect(timeStamp, ctx, this.props);
      },
      props: backgroundProps
    };

   
    // add a collision detector , if the ball is astronautEntity with a rect in the background entity 
    world.addCollisionDetector<
    { x: number, y: number, radius: number,collidingRectIndex?: number },
    { rectangles: { x: number, y: number, width: number, height: number }[] }  >(
    "astronautEntity",
    "background",
    (astronautEntity, background) => {
      // Find the index of the colliding rectangle
      const collidingIndex = background.rectangles.findIndex(rect => {
        return CollisionHelper.rectangularDetection(
          { x: astronautEntity.x, y: astronautEntity.y, w: astronautEntity.radius * 2, h: astronautEntity.radius * 2 },
          { x: astronautEntity.x, y: rect.y, w: rect.width, h: rect.height }
        );
      });  
      if (collidingIndex !== -1) {
     
        astronautEntity.collidingRectIndex = collidingIndex; 
        return true; 
      }  
      return false; // No collision
    },
    (astronautEntity, background) => {
   
      const collidingIndex = astronautEntity.collidingRectIndex; 
      if (collidingIndex !== undefined) {
      //  background.rectangles.splice(collidingIndex, 1); 
      }
    }
  );

    // add entities to the world's "building blocks"
    world.addBlocks(
      worldBackgroud,
      this.createAstronaut());

    // just a test how we can sync viewports on frame
    sequence.onFrame((scene, time) => {
      const astronautEntity = world.findBlock<{ x: number }>("astronautEntity")?.props.x;

  

      if (astronautEntity !== undefined) {
        // Center the viewport on the ball's x position
        const viewportX =  astronautEntity-(world.props.viewportWidth /2);
        world.setViewportX(viewportX);
      }
    });
    return [world];
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.querySelector("canvas#main-canvas") as HTMLCanvasElement;
  const runner = new RunWorld(canvas, 110);

 
  runner.worldAssets = await runner.loadAssets(["/wwwroot/assets/sprites/astronaut_run_sprite.png"]);

  EngineLogger.log(runner.worldAssets);

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