import { Canvas2DEntity } from './Canvas2DEntity';
import { ICompositeEntity } from './CompositeEntity';

/**
 * Interface for the properties of a WorldEntity.
 */
export interface IWorldProps {
  worldWidth: number;
  worldHeight: number;
  viewportX: number;
  viewportWidth: number;
  viewportHeight: number;
  blocks: ICompositeEntity<any>[];
}

/**
 * Renders the world entity by drawing the visible portion of the world onto the canvas.
 * @param ts - The current timestamp in the animation.
 * @param ctx - The 2D rendering context of the canvas.
 * @param propertybag - The properties of the world entity, including world dimensions, viewport position, and blocks.
 * @param worldEntity - The WorldEntity instance.
 */
const worldEntityRenderer = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IWorldProps,
  worldEntity: WorldEntity
) => {
  const { worldWidth, worldHeight, viewportX, viewportWidth, viewportHeight } = propertybag;

  // Create a temporary canvas to represent the world
  const worldCanvas = document.createElement("canvas");
  worldCanvas.width = worldWidth;
  worldCanvas.height = worldHeight;
  const worldCtx = worldCanvas.getContext("2d")!;

  // Render the blocks onto the world canvas
  propertybag.blocks.forEach(block => {
    const elapsed = ts - (block.startTimeinMs || 0);
    if (elapsed >= 0 && elapsed <= (block.durationInMs || Infinity)) {
      block.update(ts, worldCtx, this);
    }
  });

  // Check collision detectors attached to the world
  worldEntity.checkCollisions();

  // Draw the portion of the world canvas that is within the viewport
  ctx.drawImage(
    worldCanvas,
    viewportX, 0, viewportWidth, viewportHeight,
    0, 0, viewportWidth, viewportHeight
  );
};

/**
 * WorldEntity represents a scrollable world with a viewport.
 * It extends Canvas2DEntity and provides methods for adding blocks,
 * managing collisions, and scrolling the viewport.
 * @export
 * @class WorldEntity
 * @extends {Canvas2DEntity<IWorldProps>}
 */
export class WorldEntity extends Canvas2DEntity<IWorldProps> {

  private collisionDetectors: {
    targetKey: string;
    sourceKey: string;
    detectorFn: (a: any, b: any) => boolean;
    onCollision: (target: any, source: any) => void;
  }[] = [];

  /**
   * Creates an instance of WorldEntity.
   * @param name - The name of the entity.
   * @param props - The properties of the world entity.
   */
  constructor(
    public name: string,
    public props: IWorldProps
  ) {
    super(
      name,
      props,
      (ts, ctx, props) => worldEntityRenderer(ts, ctx, props, this),
      undefined,
      undefined,
      props.viewportWidth,
      props.viewportHeight
    );
  }

  /**
   * Finds a block within the entity by its key.
   * @param key - The key of the block to find.
   * @returns The block if found, otherwise undefined.
   */
  findBlock<P>(key: string): ICompositeEntity<P> | undefined {
    return this.props?.blocks.find(block => block.key === key) as ICompositeEntity<P> | undefined;
  }

  /**
   * Scrolls the viewport horizontally.
   * @param x - The new x-coordinate of the viewport.
   */
  setViewportX(x: number) {
    this.props.viewportX = Math.max(0, Math.min(x, this.props.worldWidth - this.props.viewportWidth));
  }

  /**
   * Adds a collision detector to the entity.
   * @param targetKey - The key of the target block.
   * @param sourceKey - The key of the source block.
   * @param detectorFn - The collision detection function.
   * @param onCollision - The callback function to be executed when a collision is detected.
   */
  addCollisionDetector<A, B>(
    targetKey: string,
    sourceKey: string,
    detectorFn: (a: A, b: B) => boolean,
    onCollision: (target: A, source: B) => void
  ): void {
    this.collisionDetectors.push({ targetKey, sourceKey, detectorFn, onCollision });
  }

  /**
   * Checks for collisions between the registered collision detectors.
   */
  checkCollisions() {
    this.collisionDetectors.forEach(detector => {
      const targetBlock = this.findBlock<any>(detector.targetKey);
      const sourceBlock = this.findBlock<any>(detector.sourceKey);
      if (targetBlock && sourceBlock) {
        if (detector.detectorFn(targetBlock.props, sourceBlock.props)) {
          detector.onCollision(targetBlock.props, sourceBlock.props);
        }
      }
    });
  }

  /**
   * Adds a block to the world.
   * @param block - The block to add.
   * @param startTime - The optional start time of the block within the scene (in milliseconds).
   * @param duration - The optional duration of the block within the scene (in milliseconds).
   * @returns The WorldEntity instance for chaining.
   */
  addBlock(block: ICompositeEntity<any>, startTime?: number, duration?: number): this {
    this.props.blocks.push(block);
    block.startTimeinMs = startTime;
    block.durationInMs = duration;
    return this;
  }

  /**
   * Adds multiple blocks to the world.
   * @param blocks - The blocks to add.
   * @returns The WorldEntity instance for chaining.
   */
  addBlocks(...blocks: ICompositeEntity<any>[]): this {
    blocks.forEach(block => this.props.blocks.push(block));
    return this;
  }
}