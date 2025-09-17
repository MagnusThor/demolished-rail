import { Canvas2DEntity } from '../../../src/Engine/Entity/Canvas2DEntity';
import { ICompositeEntity } from '../../../src/Engine/Entity/CompositeEntity';
import { CanvasHelper } from '../../../src/Engine/Helpers/CanvasHelper';
import { gameState } from '../state/gameState';
import { IGameEntity, IGameEntityBase } from '../interface/IGameEntity';
import { IPlayerProps } from '../interface/IPlayerProps';
import { isEntityInView } from '../utils/collitionHelpers';
import { StateHelper } from './StateHelper';
import { LevelEntity  } from './level/levelEntity';


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
    private followTarget?: IGameEntity<any>;
 
    stateHelper: StateHelper<IWorldProps>;

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
        const allEntities = [...gameState.entities];

        allEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
        
        allEntities.forEach(entity => {
            if(entity.onUpdate)
                entity.onUpdate!(entity, ts);

            if (entity.processCollisions) {
                entity.processCollisions(entity, allEntities);
            }  
        });

        if (this.followTarget) {
            const targetProps = this.followTarget.props as IPlayerProps;

            const targetCenterX = targetProps.positioned.x + targetProps.positioned.width / 2;
            const targetCenterY = targetProps.positioned.y + targetProps.positioned.height / 2;
            const desiredViewportX = targetCenterX - this.props.viewportWidth / 2;
            const desiredViewportY = targetCenterY - this.props.viewportHeight / 2;

            const clampedX = Math.max(0, Math.min(desiredViewportX, this.props.worldWidth - this.props.viewportWidth));
            const clampedY = Math.max(0, Math.min(desiredViewportY, this.props.worldHeight - this.props.viewportHeight));

            const smoothing = 0.1;
            const smoothedX = this.lerp(this.props.viewportX, clampedX, smoothing);
            const smoothedY = this.lerp(this.props.viewportY, clampedY, smoothing);

            this.setViewportX(smoothedX);
            this.setViewportY(smoothedY);
        }
    }

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

    private worldEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        const canvasHelper = new CanvasHelper(ctx);

        ctx.save();
        ctx.translate(-this.props.viewportX, -this.props.viewportY);

        // Find the TileEntity and separate it from the rest.
        let tileEntity: LevelEntity  | undefined;
        const otherEntities: IGameEntity<any>[] = [];
        for (const entity of gameState.entities) {
            if (entity instanceof LevelEntity ) {
                tileEntity = entity;
            } else {
                otherEntities.push(entity);
            }
        }
        
        // Step 1: Draw the background tiles first.
        if (tileEntity && tileEntity.onDrawBackground) {
            tileEntity.onDrawBackground(tileEntity, canvasHelper);
        }

        // Step 2: Draw all other entities in their correct zIndex order.
        otherEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
        for (const entity of otherEntities) {
            if (entity.onDraw && isEntityInView(entity, {
                 x: this.props.viewportX, y: this.props.viewportY
            }, this.props.viewportWidth, this.props.viewportHeight)) {
                entity.onDraw(entity, canvasHelper);
            }
        }

        // Step 3: Draw the foreground tiles last.
        if (tileEntity && tileEntity.onDrawForeground) {
            tileEntity.onDrawForeground(tileEntity, canvasHelper);
        }

        ctx.restore();
    };
 
}
