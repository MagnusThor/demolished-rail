import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { gameState } from "../state/gameState";
import { IBoundingBox } from "./IBoundingBox";

export interface IPositioned {
    x: number;
    y: number;
    width: number;
    height: number;
    priorX?: number;
    priorY?: number;
    getBoundingBox(): IBoundingBox;
    isMoving?(): boolean;
    updatePriorPosition(): void;
    toPoint2D(): IPoint2D;
}


export class Positioned implements IPositioned {
    public priorX: number;
    public priorY: number;

    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {
        this.priorX = x;
        this.priorY = y;
    }
    
    /**
     * Checks if the entity has moved since the last frame.
     * @returns {boolean} True if the position has changed, otherwise false.
     */
    isMoving(): boolean {
        return this.x !== this.priorX || this.y !== this.priorY;
    }

    /**
     * Updates the prior position to the current position.
     * This should be called at the end of the update loop.
     */
    updatePriorPosition(): void {
       
        this.priorX = this.x;
        this.priorY = this.y;
        
    }

    getBoundingBox(): IBoundingBox {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    toPoint2D(): IPoint2D {
        return { x: this.x, y: this.y };
    }
}
