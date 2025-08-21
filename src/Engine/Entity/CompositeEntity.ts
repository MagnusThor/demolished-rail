import { ICollisionDetector } from "../../../wwwroot/src/interface/IGameEntity";
import { CanvasHelper } from "../Helpers/CanvasHelper";
import { Canvas2DEntity } from "./Canvas2DEntity";

/**
 * Interface for a base composite entity block.
 * @typeparam T - The type of the properties object for the CompositeEntity.
 */
export interface ICompositeEntity<T> {
    key: string;
    props: T;
}

/**
 * Interface for a game entity, which extends the base composite entity.
 * It adds specific methods for the game loop.
 * @typeparam P - The type of the properties object for the game entity, which must include `isInitialized`.
 */
export interface IGameEntity<P extends { isInitialized?: boolean }> extends ICompositeEntity<P> {
    collisionDetectors?: ICollisionDetector[];
    onInit?: (self: IGameEntity<P>) => void;
    onUpdate?: (self: IGameEntity<P>, timeStamp: number) => void;
    onDraw?: (self: IGameEntity<P>, helper: CanvasHelper) => void;
}

/**
 * Interface for the properties of a CompositeEntity.
 * @typeparam T - The type of the properties object for the blocks within the entity.
 * It is constrained to ensure all blocks have the required properties.
 */
export interface ICompositeEntityProps<T extends { isInitialized?: boolean }> {
    blocks: IGameEntity<T>[];
    isInitialized?: boolean; // Indicates if the entity has been initialized
}

/**
 * A CompositeEntity is a special type of Entity that can contain multiple Blocks.
 * Each block can have its own update function and properties, allowing for modular and reusable components within an entity.
 * @typeparam T - The type of ICompositeEntityProps for the entity.
 */
export class CompositeEntity<T extends ICompositeEntityProps<any>> extends Canvas2DEntity<ICompositeEntityProps<any>> {
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
        // The core game loop logic is now in this update function.
        super(name, props, (ts, ctx, props) => {
            const helper = new CanvasHelper(ctx);

            props.blocks.forEach(block => {
                // Cast the block to IGameEntity to access the methods
                const gameEntity = block as any;

                // Call onInit if it exists and the block has not been initialized yet
                if (gameEntity.onInit && !gameEntity.props.isInitialized) {
                    gameEntity.onInit(gameEntity);
                    gameEntity.props.isInitialized = true;
                }

                // Call onUpdate if it exists
                if (gameEntity.onUpdate) {
                    gameEntity.onUpdate(gameEntity, ts);
                }

                // Call onDraw if it exists
                if (gameEntity.onDraw) {
                    gameEntity.onDraw(gameEntity, helper);
                }
            });
        }, undefined, undefined, w, h);

    }

    /**
     * Updates the entity's properties, merging new properties with existing ones.
     * @param props - The partial or complete properties to apply.
     */
    setProps(props: T): void {
        this.props = { ...this.props, ...props };
    }
    
    /**
     * Updates the properties of a specific block within the entity.
     * @param key - The key of the block to update.
     * @param newProps - The new properties to apply, which will be merged with existing ones.
     */
    setBlockProps<P extends { isInitialized?: boolean }>(key: string, newProps: P): void {
        const block = this.findBlock<P>(key);
        if (block) {
            block.props = { ...block.props, ...newProps };
        }
    }


    setIsInitialized(isInitialized: boolean): void {
        this.props!.isInitialized = isInitialized
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