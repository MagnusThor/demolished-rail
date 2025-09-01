import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { gameState } from "../state/gameState";
import { IBoundingBox } from "./IBoundingBox";

export interface IPositioned {
    x: number;
    y: number;
    width: number;
    height: number;
    getBoundingBox(): IBoundingBox;
    toPoint2D?(): IPoint2D;
}

export class Positioned implements IPositioned {
    
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {}

   
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