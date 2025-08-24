import { Point2D } from "../../../src";
import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IHealthProps } from "./IHealthProps";
import { IBoundingBox } from "./IBoundingBox";
import { IDynamicProps } from "./IDynamicProps";
import { IPositioned } from "./IPositioned";
import { IDynamicEntity } from "./IDynamicEntity";
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";

export interface IEnemyBehavior {
    name: string;
    onUpdate?: (enemy: IDynamicEntity<IEnemyProps>) => void;
    onDraw?: (enemy: IDynamicEntity<IEnemyProps>, helper: CanvasHelper) => void;
}

export interface IEnemyProps extends IDynamicProps {
    position: IPositioned; // The position of the enemy in the game world
    health: IHealthProps
    behavior?: IEnemyBehavior[]
}

