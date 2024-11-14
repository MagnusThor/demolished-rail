import { Canvas2DEntity } from './Canvas2DEntity';
import {
  ICompositeEntity,
  ICompositeEntityProps,
} from './CompositeEntity';

export interface IWorldProps {
    worldWidth: number;
    worldHeight: number;
    viewportX: number;
    viewportWidth: number;
    viewportHeight: number;
    blocks: ICompositeEntity<any>[];
}

const worldEntityRenderer = (ts: number, ctx: CanvasRenderingContext2D, propertybag: IWorldProps,
  worldEnity:WorldEntity

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
            block.update(ts, worldCtx, this); // Render on the world canvas
        }       
    });
    
    // check collition detectors attached to the world;

    worldEnity.checkCollisions();

    // Draw the portion of the world canvas that is within the viewport
    ctx.drawImage(
        worldCanvas,
        viewportX, 0, viewportWidth, viewportHeight,
        0, 0, viewportWidth, viewportHeight
    );

    
};


/**
 * WorldEntity main purpose is to be used in animations such as small games or implementations
 * requiering interactivity.
 * @export
 * @class WorldEntity
 * @extends {Canvas2DEntity<ICompositeEntityProps<IWorldProps>>}
 */
export class WorldEntity extends Canvas2DEntity<ICompositeEntityProps<IWorldProps>> {

    private collisionDetectors: {
        targetKey: string;
        sourceKey: string;
        detectorFn: (a: any, b: any) => boolean;
        onCollision: (target: any, source: any) => void;
      }[] = [];

    /**
     * Creates an instance of WorldEntity.
     * @param {string} name
     * @param {IWorldProps} props
     * @memberof WorldEntity
     */
    constructor(
        public name: string,public props: IWorldProps
    ) {
        super(
            name,
            props,
            (ts, ctx, props) => worldEntityRenderer(ts, ctx, props as IWorldProps, this),
            undefined, undefined,
            props.viewportWidth,
            props.viewportHeight
        );
    }
    findBlock<P>(key: string): ICompositeEntity<P> | undefined {
        return this.props?.blocks.find(block => block.key === key) as ICompositeEntity<P> | undefined;
    }
    /**
     * Scrolls the viewport horizontally.
     * @param x - The new x-coordinate of the viewport.
     */
    setViewportX(x: number) {
        const properties = this.props!
        properties.viewportX = Math.max(0, Math.min(x, properties.worldWidth - properties.viewportWidth))
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
      const targetBlock = this.findBlock<any>(detector.targetKey); // Assuming 'any' for simplicity
      const sourceBlock = this.findBlock<any>(detector.sourceKey);
      if (targetBlock && sourceBlock) {
        if (detector.detectorFn(targetBlock.props, sourceBlock.props)) {
          detector.onCollision(targetBlock.props, sourceBlock.props);
        }
      }
    });
  }

}