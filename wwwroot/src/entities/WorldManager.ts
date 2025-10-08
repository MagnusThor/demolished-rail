import { Canvas2DEntity } from '../../../src/Engine/Entity/Canvas2DEntity';
import { ICompositeEntity } from '../../../src/Engine/Entity/CompositeEntity';
import { CanvasHelper } from '../../../src/Engine/Helpers/CanvasHelper';
import { GameState } from "../global/GameState";
import { IGameEntity } from '../interface/IGameEntity';
import { IPlayerProps } from '../interface/IPlayerProps';
import { isEntityInView } from '../utils/collitionHelpers';
import { StateHelper } from './StateHelper';
import { LevelEntityRenderer } from './level/LevelEntityRenderer';
import { Sequence } from '../../../src';
import { Camera2D } from '../camera/Camera2D';
import { IWorldProps } from './IWorldProps';


/**
 * WorldEntity represents a scrollable world with a viewport.
 * It manages all game entities and controls the camera.
 */
export class WorldManager extends Canvas2DEntity<IWorldProps> implements IGameEntity<IWorldProps> {


    stateHelper: StateHelper<IWorldProps>;

    private static instance: WorldManager | null = null;


    uuid: string = crypto.randomUUID();
    lifeTime: number = Infinity
    camera: Camera2D;

    lastTs: number = 0;

    copyToCanvas(targetCanvas: HTMLCanvasElement, sequence: Sequence): void {
        const targetCtx = targetCanvas.getContext("2d", { alpha: true });


        if (targetCtx) {
            const elapsed = sequence.currentTime - (this.startTimeinMs || 0);

            if (elapsed >= 0 && elapsed <= (this.durationInMs || Infinity)) {


                targetCtx.drawImage(this.canvas, 0, 0);
                this.postProcessors.forEach(processor => processor(targetCtx, sequence));
            }
        }
    }

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

        this.camera = new Camera2D();

        this.stateHelper = new StateHelper(props);

        GameState.getInstance().worldWidth = props.worldWidth;
        GameState.getInstance().worldHeight = props.worldHeight;

        GameState.getInstance().camera = this.camera;

        this.props.viewportWidth = Math.round(this.props.viewportWidth);
        this.props.viewportHeight = Math.round(this.props.viewportHeight);

        WorldManager.instance = this;


    }

    /**
     * Returns the current {@link Camera2D} instance associated with the world entity.
     * If no camera is available, returns `null`.
     *
     * @returns {Camera2D | null} The camera instance or `null` if not set.
     */
    public static getCamera(): Camera2D | null {
        return WorldManager.instance?.camera || null;
    }


   private updateViewport(delta: number): void {
        if (!this.camera.followTarget) return;

        this.camera.update(delta);

        const effectiveViewportWidth = this.props.viewportWidth / this.camera.zoom;
        const effectiveViewportHeight = this.props.viewportHeight / this.camera.zoom;

        const targetProps = this.camera.followTarget.props as IPlayerProps;

        const targetCenterX = targetProps.position.x + targetProps.position.width / 2;
        const targetCenterY = targetProps.position.y + targetProps.position.height / 2;

        const effectiveTargetX = targetCenterX + this.camera.offsetX;
        const effectiveTargetY = targetCenterY + this.camera.offsetY;

        const desiredViewportX = effectiveTargetX - effectiveViewportWidth / 2;
        const desiredViewportY = effectiveTargetY - effectiveViewportHeight / 2;

        const maxViewportX = this.props.worldWidth - effectiveViewportWidth;
        const maxViewportY = this.props.worldHeight - effectiveViewportHeight;

        const clampedX = Math.max(0, Math.min(desiredViewportX, maxViewportX));
        const clampedY = Math.max(0, Math.min(desiredViewportY, maxViewportY));


        let smoothing = 0.1;

        if (Object.keys(this.camera.activeEffects).length > 0) {
            smoothing = 1.0; 
        }

        const smoothedX = this.lerp(this.props.viewportX, clampedX, smoothing);
        const smoothedY = this.lerp(this.props.viewportY, clampedY, smoothing);

        this.setViewportX(smoothedX);
        this.setViewportY(smoothedY);
    }

    updateEntities(ts: number, deltaTime: number): void {
        const allEntities = [...GameState.getInstance().entities];
        allEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));

        allEntities.forEach(entity => {
            if (entity.onUpdate)
                entity.onUpdate!(entity, ts);

            if (entity.processCollisions) {
                entity.processCollisions(entity, allEntities);
            }
        });

        if (this.camera.followTarget) {
            this.updateViewport(deltaTime);
        }

    }


    private lerp(start: number, end: number, t: number): number {
        return start * (1 - t) + end * t;
    }

    setViewportX(x: number): void {
        this.props.viewportX = x;
        GameState.getInstance().viewport.x = this.props.viewportX;
    }

    setViewportY(y: number): void {
        this.props.viewportY = y;
        GameState.getInstance().viewport.y = this.props.viewportY;
    }

    private worldEntityRenderer = (
        ts: number,
        ctx: CanvasRenderingContext2D
    ) => {
        const canvasHelper = new CanvasHelper(ctx);

        ctx.save();
        ctx.translate(-this.props.viewportX, -this.props.viewportY);

        let tileEntity: LevelEntityRenderer | undefined;
        const otherEntities: IGameEntity<any>[] = [];
        for (const entity of GameState.getInstance().entities) {
            if (entity instanceof LevelEntityRenderer) {
                tileEntity = entity;
            } else {
                otherEntities.push(entity);
            }
        }

        if (tileEntity && tileEntity.onDrawBackground) {
            tileEntity.onDrawBackground(tileEntity, canvasHelper, ts);
        }

        otherEntities.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
        for (const entity of otherEntities) {
            if (entity.onDraw && isEntityInView(entity, {
                x: this.props.viewportX, y: this.props.viewportY
            }, this.props.viewportWidth, this.props.viewportHeight)) {
                entity.onDraw(entity, canvasHelper);

                if(entity.onPostDraw){
                    entity.onPostDraw(entity,canvasHelper);
                }

            }
        }

        if (tileEntity && tileEntity.onDrawForeground) {
            tileEntity.onDrawForeground(tileEntity, canvasHelper, ts);
        }

        GameState.getInstance().particles = GameState.getInstance().particles.filter(particle => {

            const isStillAlive = particle.update!(GameState.getInstance().ctx!.canvas.height);
            if (isStillAlive) {
                particle.draw!(GameState.getInstance().ctx!);
            }
            
            return isStillAlive;
        });


        ctx.restore();
    };

}
