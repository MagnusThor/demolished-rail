import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";



export interface IIndexedTile extends IPoint2D {
    col: number; // Grid column index
    row: number; // Grid row index
    type: number; // Tile type ID
}
