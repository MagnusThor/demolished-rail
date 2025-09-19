import { IPoint2D, Point2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { gameState } from "../state/gameState";
import { IBoundingBox } from "./IBoundingBox";

export interface IPositioned {
    x: number;
    y: number;
    width: number;
    height: number;    
    getBoundingBox(): IBoundingBox;
    isMoving?(): boolean;
    updatePriorPosition(): void;
    toPoint2D(): Point2D;
    prior?:IPositioned[]
}


/**
 * Represents an entity with a position and size in 2D space, 
 * tracking both current and prior positions for movement detection.
 * 
 * Provides methods for movement checks, bounding box retrieval, 
 * and scaling operations.
 * 
 * @implements IPositioned
 */
export class Positioned implements IPositioned {
    public priorX: number;
    public priorY: number;

    /**
     * Creates an instance of the class with specified position and size.
     *
     * @param x - The x-coordinate of the object.
     * @param y - The y-coordinate of the object.
     * @param width - The width of the object.
     * @param height - The height of the object.
     *
     * Also initializes `priorX` and `priorY` to the initial position values.
     */
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
     * Adds a prior position to the current object.
     * 
     * @throws {Error} This method is not implemented.
     */
    addPriorPosition(){
       throw new Error("Method not implemented.");
    }
    /**
     * Updates the prior position to the current position.
     * This should be called at the end of the update loop.
     */
    updatePriorPosition(): void {       
        this.priorX = this.x;
        this.priorY = this.y;        
    }
    /**
     * Returns the bounding box of the object.
     *
     * @returns {IBoundingBox} An object containing the `x` and `y` coordinates,
     * as well as the `width` and `height` of the bounding box.
     */
    getBoundingBox(): IBoundingBox {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Returns a scaled bounding box based on the provided scale factor.
     * The bounding box is scaled from its center, maintaining its proportions.
     *
     * @param scale - The factor by which to scale the bounding box (e.g., 0.5 for half size).
     * @returns An `IBoundingBox` object representing the scaled bounding box.
     */
    getScaledBoundingBox(scale:number): IBoundingBox {       
        return {
            x: this.x + (this.width * (1 - scale)) / 2,
            y: this.y + (this.height * (1 - scale)) / 2,
            width: this.width * scale,
            height: this.height * scale
        };
    }
    /**
     * Converts the current object to a {@link Point2D} instance using its `x` and `y` properties.
     *
     * @returns {Point2D} A new `Point2D` object representing the current position.
     */
    toPoint2D(): Point2D {
        return new Point2D(this.x, this.y) ;
    }
}
