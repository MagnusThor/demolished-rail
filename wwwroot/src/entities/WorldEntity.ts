// entities/worldEntity.ts
import { Canvas2DEntity } from '../../../src/Engine/Entity/Canvas2DEntity';
import { ICompositeEntity } from '../../../src/Engine/Entity/CompositeEntity';
import { CanvasHelper } from '../../../src/Engine/Helpers/CanvasHelper';
import { gameState } from '../gameState';
import { IGameEntity } from '../interface/IGameEntity';

/**
 * Interface for the properties of a WorldEntity.
 * It now includes a dedicated list for dynamic entities like bullets.
 */
export interface IWorldProps {
    worldWidth: number;
    worldHeight: number;
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
    blocks: IGameEntity<any>[]; // For static entities like tiles and the player
}

/**
 * WorldEntity represents a scrollable world with a viewport.
 * It now uses a dedicated ICompositeEntity to render the background tiles.
 */
export class WorldEntity extends Canvas2DEntity<IWorldProps> {
    private worldCanvas: HTMLCanvasElement;
    private worldCtx: CanvasRenderingContext2D;
    collisionDetectors: any[]; // Changed to an array for proper use
    canvasHelper: CanvasHelper;
    private followTarget?: IGameEntity<any>; // New property to store the entity to follow

    get key() {
        return 'world';
    }

    set key(value: string) {
        // No-op, WorldEntity does not have a key
    }

    constructor(
        public name: string,
        public props: IWorldProps
    ) {
        super(
            name,
            props,
            (ts, ctx) => this.worldEntityRenderer(ts, ctx),
            undefined,
            undefined,
            props.viewportWidth,
            props.viewportHeight
        );

        this.worldCanvas = document.createElement("canvas");
        this.worldCanvas.width = props.worldWidth;
        this.worldCanvas.height = props.worldHeight;
        this.worldCtx = this.worldCanvas.getContext("2d")!;

        this.canvasHelper = new CanvasHelper(this.worldCtx);

        this.collisionDetectors = [];
    }
    
    /**
     * Set the entity for the camera to follow.
     * @param target The entity to follow.
     */
    follow(target: IGameEntity<any>) {
        this.followTarget = target;
    }

    /**
     * The main update loop for the world and its entities.
     * @param ts The timestamp.
     */
    updateBlocks(ts: number) {
        // Update all the static blocks within the world
        this.props.blocks.forEach(block => {
            block.onUpdate!(block, ts);
        });

        // Update and filter the bullets from the global gameState
        gameState.dynamicEntities = gameState.dynamicEntities.filter(bullet => {
            bullet.onUpdate!(bullet, ts);
            // Check for collisions with tiles
            const tileBlock = this.findBlock('tileBlock');
            if (tileBlock && bullet.collisionDetectors) {
                const detector = bullet.collisionDetectors.find(d => d.targetName === "tileBlock");
                if (detector) {
                    const collisionResults = detector.detectorFn(bullet.props, tileBlock);
                    if (Array.isArray(collisionResults) && collisionResults.length > 0) {
                        detector.onCollision!(bullet.props, collisionResults[0]);
                    }
                }
            }
            // Return true if the bullet is still alive
            return bullet.props.isAlive;
        });

        // Update the viewport to follow the target if it exists
        if (this.followTarget) {
            const targetProps = this.followTarget.props;
            const newViewportX = targetProps.x - this.props.viewportWidth / 2;
            const newViewportY = targetProps.y - this.props.viewportHeight / 2;
            this.setViewportX(newViewportX);
            this.setViewportY(newViewportY);
        }
    }

    findBlock<P>(key: string): IGameEntity<P> | undefined {
        return this.props.blocks.find(block => block.key === key) as IGameEntity<P> | undefined;
    }

    setViewportX(x: number) {
        this.props.viewportX = Math.max(0, Math.min(x, this.props.worldWidth - this.props.viewportWidth));
        gameState.viewport.x = this.props.viewportX; // Update the game state viewport
    }

    setViewportY(y: number) {
        this.props.viewportY = Math.max(0, Math.min(y, this.props.worldHeight - this.props.viewportHeight));
        gameState.viewport.y = this.props.viewportY; // Update the game state viewport 
    }

    addBlock(block: IGameEntity<any>): this {
        if (block.onInit) {
            block.onInit(block); // Initialize the block
        }
        block.props.isInitialized = true; // Mark the block as initialized
        this.props.blocks.push(block);
        return this;
    }

    addBlocks(...blocks: IGameEntity<any>[]): this {
        blocks.forEach(block => this.addBlock(block));
        return this;
    }

    private worldEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        // Clear the off-screen world canvas
        this.worldCtx.clearRect(0, 0, this.props.worldWidth, this.props.worldHeight);

        // Draw the background blocks
        this.props.blocks.forEach(block => {
            block.onDraw!(block, this.canvasHelper);
        });

        // Draw the bullets from the global gameState
        gameState.dynamicEntities.forEach(bullet => {
            bullet.onDraw!(bullet, this.canvasHelper);
        });

        // Draw the portion of the world canvas that is within the viewport
        ctx.drawImage(
            this.worldCanvas,
            this.props.viewportX, this.props.viewportY, 
            this.props.viewportWidth, this.props.viewportHeight,
            0, 0, this.props.viewportWidth, this.props.viewportHeight
        );
    };
}
