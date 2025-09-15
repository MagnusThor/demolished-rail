// entities/worldEntity.ts
import { Canvas2DEntity } from '../../../src/Engine/Entity/Canvas2DEntity';
import { ICompositeEntity } from '../../../src/Engine/Entity/CompositeEntity';
import { CanvasHelper } from '../../../src/Engine/Helpers/CanvasHelper';
import { gameState } from '../state/gameState';
import { IGameEntity, IGameEntityBase } from '../interface/IGameEntity';
import { IPlayerProps } from '../interface/IPlayerProps';
import { isEntityInView } from '../utils/collitionHelpers';
import { StateHelper } from './StateHelper';

/**
 * Interface for the properties of a WorldEntity.
 */
export interface IWorldProps extends IGameEntityBase {
    worldWidth: number;
    worldHeight: number;
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
  
}


/**
 * WorldEntity represents a scrollable world with a viewport.
 * It manages all game entities and controls the camera.
 */
export class WorldEntity extends Canvas2DEntity<IWorldProps> implements IGameEntity<IWorldProps> {
    // CHANGE: Removed worldCanvas, worldCtx, and canvasHelper as they are no longer needed.
    private followTarget?: IGameEntity<any>;
 
    stateHelper: StateHelper<IWorldProps>;

    // A getter for a key if your engine requires it.
    get key() {
        return 'world';
    }
    set key(value: string) { /* No-op */ }

    uuid: string = crypto.randomUUID();


    lifeTime: number = Infinity

    constructor(
        public name: string,
        public props: IWorldProps,
        public screenWidth: number,
        public screenHeight: number,
    ) {
        super(
            name,
            props,
            (ts, ctx) => this.worldEntityRenderer(ts, ctx),
            undefined,
            undefined,
            screenWidth,
            screenHeight
        );

        this.stateHelper = new StateHelper(props);

        gameState.worldWidth = props.worldWidth;
        gameState.worldHeight = props.worldHeight;

        // Rounding viewport dimensions is a good practice to prevent floating point issues.
        this.props.viewportWidth = Math.round(this.props.viewportWidth);
        this.props.viewportHeight = Math.round(this.props.viewportHeight);
    }

    /**
     * Set the entity for the camera to follow.
     * @param target The entity to follow.
     */
    follow(target: IGameEntity<any>): void {
        this.followTarget = target;
    }

    /**
     * The main update loop for the world and its entities.
     * @param ts The timestamp.
     */
    updateBlocks(ts: number): void {
        // Combine static and dynamic entities for collision processing.
        const allEntities = [...gameState.entities];

         allEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));

        // Update all dynamic entities and filter out the ones that are no longer alive.


        // Update all the static blocks within the world.
        allEntities.forEach(entity => {
            if(entity.onUpdate)
                entity.onUpdate!(entity, ts);

             if (entity.processCollisions) {
                entity.processCollisions(entity, allEntities);
            }   
        });

        // Update the viewport to smoothly follow the target.
        if (this.followTarget) {
            const targetProps = this.followTarget.props as IPlayerProps;

            // Calculate the desired viewport position to center the target.
            const targetCenterX = targetProps.positioned.x + targetProps.positioned.width / 2;
            const targetCenterY = targetProps.positioned.y + targetProps.positioned.height / 2;
            const desiredViewportX = targetCenterX - this.props.viewportWidth / 2;
            const desiredViewportY = targetCenterY - this.props.viewportHeight / 2;

            // Clamp the desired position to the world boundaries. This logic remains the same.
            const clampedX = Math.max(0, Math.min(desiredViewportX, this.props.worldWidth - this.props.viewportWidth));
            const clampedY = Math.max(0, Math.min(desiredViewportY, this.props.worldHeight - this.props.viewportHeight));

            // CHANGE: Use lerp for smooth camera movement.
            const smoothing = 0.1; // Adjust this value: 0.05 is slower, 0.2 is faster.
            const smoothedX = this.lerp(this.props.viewportX, clampedX, smoothing);
            const smoothedY = this.lerp(this.props.viewportY, clampedY, smoothing);

            this.setViewportX(smoothedX);
            this.setViewportY(smoothedY);
        }
    }

    /**
     * Linear interpolation function to smooth movement.
     */
    private lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    setViewportX(x: number): void {
        this.props.viewportX = x;
        gameState.viewport.x = this.props.viewportX;
    }

    setViewportY(y: number): void {
        this.props.viewportY = y;
        gameState.viewport.y = this.props.viewportY;
    }

    // async addBlock(block: IGameEntity<any>) {
    //     if (block.onInit) {
    //         block.onInit(block);
    //     }
    //     block.props.isInitialized = true;
    //     this.props.blocks.push(block);
    //     return this;
    // }

    private worldEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        const canvasHelper = new CanvasHelper(ctx)

      
        // Save the clean, untransformed state of the main canvas.
        ctx.save();

        // Translate the canvas's coordinate system by the viewport's offset.
        // This effectively moves the camera.
        ctx.translate(-this.props.viewportX, -this.props.viewportY);

         const allEntities = [...gameState.entities]
            allEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));

        for (const entity of allEntities) {
             if (entity.onDraw && isEntityInView(entity, {
                x:this.props.viewportX, y:this.props.viewportY
                }  , this.props.viewportWidth, this.props.viewportHeight)) {
                entity.onDraw(entity, canvasHelper);
            }
        }


        // Restore the canvas to its original state (removes the translation).
        // This is crucial for drawing UI elements that should not move with the world.

         //this.drawDebugInfo(ctx);

        ctx.restore();

        // --- DEBUG INFO ---
        // This code now runs after ctx.restore(), so it draws directly onto the
        // screen and is not affected by the camera's position.
       
    };

  
}