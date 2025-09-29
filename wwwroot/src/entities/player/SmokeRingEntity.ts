import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity, IGameEntityBase } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { GameState } from "../../global/GameState";
import { GameEntity } from "../GameEntity";

export interface ISmokeRingProps extends IGameEntityBase {
    positioned: IPositioned
    radius: number;
    lifespan: number; // in milliseconds
    states: { [key: string]: any };
}

export class SmokeRingEntity extends GameEntity<ISmokeRingProps> implements IGameEntity<ISmokeRingProps> {
    private initialLifespan: number;
    private createdAt: number;

    constructor(x: number, y: number, radius: number = 5, lifespan: number = 500) {



        super("smokeRing", { 
            isCollidable: false,
            radius, lifespan, positioned: new Positioned(x - radius, y - radius, radius * 2, radius * 2), isInitialized: false, zIndex: 1, states: {} });

        this.initialLifespan = lifespan;
        this.createdAt = performance.now();
    }
    processCollisions?: ((self: IGameEntity<ISmokeRingProps>, entities: IGameEntity<any>[]) => void) | undefined;
    onCreated?: ((self: IGameEntity<ISmokeRingProps>) => void) | undefined;
    onDestroy?: ((self: IGameEntity<ISmokeRingProps>) => void) | undefined;

    getBoundingBox = (self: IGameEntity<ISmokeRingProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    }


    onUpdate? = (self: IGameEntity<ISmokeRingProps>, timeStamp: number) => {
        // Calculate the percentage of the ring's life that has passed
        const elapsed = timeStamp - this.createdAt;
        const progress = elapsed / this.initialLifespan;

        // If the ring's lifespan is over, mark it for removal
        if (progress >= 1) {
            GameState.removeEntityByUUID(self.uuid);
        }

        // Gradually shrink and fade the ring
        this.props.radius = this.props.radius + (1 - progress) * 0.1;
        this.props.lifespan = this.props.lifespan - elapsed;
    }

    onDraw = (self: IGameEntity<ISmokeRingProps>, helper: CanvasHelper) => {
        const progress = (performance.now() - this.createdAt) / this.initialLifespan;
        const opacity = 1 - progress;

        if (opacity > 0) {
            const ctx = helper.ctx;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

            // Draw a fluffy cloud shape
            ctx.beginPath();
            ctx.arc(self.props.positioned.x - 5, self.props.positioned.y, self.props.radius, 0, 2 * Math.PI);
            ctx.arc(self.props.positioned.x + 5, self.props.positioned.y, self.props.radius * 1.2, 0, 2 * Math.PI);
            ctx.arc(self.props.positioned.x, self.props.positioned.y + 5, self.props.radius * 0.8, 0, 2 * Math.PI);
            ctx.fill();

            ctx.restore();
        }
    }
}
