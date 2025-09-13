import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntity, IGameEntityBase } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";

/**
 * Interface for the properties of a RopeEntity.
 * Extends the base EntityProps and adds properties for the pendulum behavior.
 */
export interface IRopeProps extends IGameEntityBase {
    positioned: IPositioned;
    isInitialized: boolean;
    states: { [key: string]: any };
    zIndex: number;
    // Properties for continuous swinging and curving
    lengthOfRope: number;
    angle: number;
    sagDistance: number;
    // New physics-based properties for a more realistic pendulum swing
    angularVelocity: number;
    angularAcceleration: number;
    gravity: number;
    damping: number;
}

/**
 * Represents a dynamic rope in the game that swings continuously and sags naturally using a Bézier curve.
 */
export class RopeEntity extends GameEntity<IRopeProps> {

    public endX: number = 0;
    public endY: number = 0;
    public controlX: number = 0;
    public controlY: number = 0;

    /**
     * Creates a new instance of the RopeEntity.
     * @param x The x-coordinate of the rope's fixed top point.
     * @param y The y-coordinate of the rope's fixed top point.
     * @param lengthOfRope The length of the rope in pixels.
     * @param initialAngle The initial angle of the rope in radians.
     * @param sagDistance The distance the rope curves downward from a straight line.
     */
    constructor(x: number, y: number, lengthOfRope: number, initialAngle = Math.PI / 10, sagDistance = 30) {
        const props: IRopeProps = {
            positioned: new Positioned(x - 16, y - 16, 10, lengthOfRope),
            zIndex: 10,
            isInitialized: true,
            states: {},
            lengthOfRope: lengthOfRope,
            angle: initialAngle,
            sagDistance: sagDistance,
            // Initialize physics properties
            angularVelocity: 0,
            angularAcceleration: 0.2,
            gravity: 0.0015, // A small value for gravity to control swing speed
            damping: 0.999 // A damping factor to simulate friction and slow the swing
        };
        super("rope", props);
    }

    getBoundingBox = (self: IGameEntity<IRopeProps>): IBoundingBox => {
        return self.props.positioned.getBoundingBox!();
    };

    /**
     * Updates the state of the rope. It calculates the swing angle and the positions
     * of the end point and the control point for the Bézier curve using physics.
     * @param self The current instance of the RopeEntity.
     */
    public onUpdate(self: IGameEntity<IRopeProps>): void {
        const props = self.props;
        
        // Calculate angular acceleration. This is a simple pendulum physics model:
        // acceleration = -gravity * sin(angle)
        props.angularAcceleration = -props.gravity * Math.sin(props.angle);

        // Update angular velocity based on acceleration.
        // We also apply a damping factor to simulate friction.
        props.angularVelocity += props.angularAcceleration;
        props.angularVelocity *= props.damping;

        // Update the angle based on the new angular velocity.
        props.angle += props.angularVelocity;

        // Calculate the end point of the rope based on its angle.
        this.endX = props.positioned.x + props.lengthOfRope * Math.sin(props.angle);
        this.endY = props.positioned.y + props.lengthOfRope * Math.cos(props.angle);

        // Calculate the control point for the quadratic Bézier curve.
        // The control point is positioned halfway between the start and end,
        // and shifted downwards to create the sag.
        const midX = (props.positioned.x + this.endX) / 2;
        const midY = (props.positioned.y + this.endY) / 2;

        this.controlX = midX - props.sagDistance * Math.cos(props.angle);
        this.controlY = midY + props.sagDistance * Math.sin(props.angle);
    }

    /**
     * Draws the rope on the canvas as a curved line using a quadratic Bézier curve.
     * @param self The current instance of the RopeEntity.
     * @param helper The CanvasHelper instance for drawing operations.
     */
    public onDraw(self: IGameEntity<IRopeProps>, helper: CanvasHelper): void {
        const ctx = helper.ctx;

        ctx.save();
        ctx.strokeStyle = '#4A2514'; // Dark brown color for the rope.
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(self.props.positioned.x, self.props.positioned.y);
        ctx.quadraticCurveTo(this.controlX, this.controlY, this.endX, this.endY);
        ctx.stroke();
        ctx.restore();
    }
}
