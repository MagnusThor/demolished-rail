import { Entity } from './entity';

/**
 * Interface for a CompositeEntity, which is a reusable component within a CompositeEntity.
 * @typeparam T - The type of the properties object for the CompositeEntity.
 */
export interface ICompositeEntity<T> {
  key: string;
  startTimeinMs?: number; // Optional start time for the block within the entity
  durationInMs?: number;  // Optional duration for the block within the entity
  update(timeStamp: number, ctx: CanvasRenderingContext2D, entity: any): void;
  props: T;
}

/**
 * Interface for the properties of a CompositeEntity.
 * @typeparam T - The type of the properties object for the blocks within the entity.
 */
export interface ICompositeEntityProps<T> {
  blocks: ICompositeEntity<T>[];
}

/**
 * A CompositeEntity is a special type of Entity that can contain multiple Blocks.
 * Each block can have its own update function and properties, allowing for modular and reusable components within an entity.
 * @typeparam T - The type of ICompositeEntityProps for the entity.
 */
export class CompositeEntity<T extends ICompositeEntityProps<any>> extends Entity<ICompositeEntityProps<any>> {
  /**
   * Creates a new CompositeEntity.
   * @param name - The name or identifier for the entity.
   * @param w - The width of the entity's canvas.
   * @param h - The height of the entity's canvas.
   * @param props - The properties for the entity, including an array of blocks.
   */
  constructor(
    name: string,
    w: number,
    h: number,
    props: T
  ) {
    super(name, props, (ts, ctx, props) => {
      props.blocks.forEach(block => {
        // Calculate the elapsed time for the block
        const elapsed = ts - (block.startTimeinMs || 0);

        // Check if the block should be rendered based on its lifetime
        if (elapsed >= 0 && elapsed <= (block.durationInMs || Infinity)) {
          block.update(ts, ctx, this);
        }
      });
    }, undefined, undefined, w, h);
  }

  /**
   * Finds a block within the entity by its key.
   * @param key - The key of the block to find.
   * @returns The block if found, otherwise undefined.
   */
  findBlock<P>(key: string): ICompositeEntity<P> | undefined {
    return this.props?.blocks.find(block => block.key === key) as ICompositeEntity<P> | undefined;
  }
}