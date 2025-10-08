import { IPoint2D } from "../../../src/Engine/Helpers/Math/Point2D";
import { IGameEntity } from "./IGameEntity";
import { ILevelProps } from "./ILevelProps";
import { ISpriteAnimation } from "./ISpriteAnimation";



export interface ITileProps {
    id: number;
    name?: string;
    color?: string;
    width: number;
    height: number;
    texture?: string;
    isSolid: boolean;
    useLevelCreator: boolean;
    offset?: {
        x: number;
        y: number;
    };
    zIndex: number;
    creator?: (levelProps: ILevelProps, tile: IPoint2D) => IGameEntity<any>;
    tileAnimation?: ISpriteAnimation;
}
