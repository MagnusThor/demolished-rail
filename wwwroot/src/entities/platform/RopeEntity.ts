import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { IGameEntityBase, IGameEntity } from "../../interface/IGameEntity";
import { IPositioned, Positioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";

export interface IRopeProps extends IGameEntityBase {
    positioned: IPositioned;
    isInitialized: boolean;
    states: { [key: string]: any };
    zIndex: number;
    lengthOfRope: number;
    angle: number;
    // rope end physics
    angularVelocity: number;
    angularAcceleration: number;
    gravity: number;
    damping: number;
    useDamping: boolean;   
}

export class RopeEntity extends GameEntity<IRopeProps> {
    public endX: number = 0;
    public endY: number = 0;
    public controlX: number = 0;
    public controlY: number = 0;

    lifeTime: number = Infinity;

    constructor(
        x: number,
        y: number,
        lengthOfRope: number,
        initialAngleDeg = 45,
        useDamping = true     
    ) {
        const initialAngle = (initialAngleDeg * Math.PI) / 180;

        const props: IRopeProps = {
            positioned: new Positioned(x - 16, y- 16, 10, lengthOfRope),
            zIndex: 10,
            isInitialized: true,
            states: {},
            lengthOfRope,
            angle: initialAngle,
            angularVelocity: 0,
            angularAcceleration: 0,
            gravity: 0.0015,
            damping: 0.999,
            useDamping: useDamping 
        };
        super("rope", props);
    }


     getBoundingBox = (self: IGameEntity<IRopeProps>): IBoundingBox => {
            return self.props.positioned.getBoundingBox!();
        }

    public onUpdate(self: IGameEntity<IRopeProps>): void {
        const props = self.props;

        // main pendulum
        props.angularAcceleration = -props.gravity * Math.sin(props.angle);
        props.angularVelocity += props.angularAcceleration;

        if (props.useDamping) {
            props.angularVelocity *= props.damping;
        }

        props.angle += props.angularVelocity;

        // trailing tip
        if (!props.states.endAngle) {
            props.states.endAngle = props.angle;
            props.states.endVelocity = 0;
        }

        const stiffness = 0.4;
        const dampingEnd = 0.9;
        const diff = props.angle - props.states.endAngle;

        props.states.endVelocity += diff * stiffness;
        props.states.endVelocity *= dampingEnd;
        props.states.endAngle += props.states.endVelocity;

        // end position
        this.endX = props.positioned.x + props.lengthOfRope * Math.sin(props.states.endAngle);
        this.endY = props.positioned.y + props.lengthOfRope * Math.cos(props.states.endAngle);

        // straight midpoint
        this.controlX = (props.positioned.x + this.endX) / 2;
        this.controlY = (props.positioned.y + this.endY) / 2;
    }

    public onDraw(self: IGameEntity<IRopeProps>, helper: CanvasHelper): void {
        const ctx = helper.ctx;
        ctx.save();

        // Rope
        ctx.strokeStyle = '#4A2514';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(self.props.positioned.x, self.props.positioned.y);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();

        // Bottom knot (circle)
        ctx.fillStyle = '#3A1F0F';
        ctx.beginPath();
        ctx.arc(this.endX, this.endY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
