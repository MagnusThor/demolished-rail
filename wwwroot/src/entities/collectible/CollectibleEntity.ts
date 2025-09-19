import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { gameAssets, gameState } from "../../state/gameState";
import { IBoundingBox } from "../../interface/IBoundingBox";
import { ICollectibleProps } from "../../interface/ICollectibleProps";
import { ICollisionResult } from "../../interface/ICollisionResult";
import { IGameEntity } from "../../interface/IGameEntity";
import { ILevelProps } from "../../interface/ILevelProps";
import { IPlayerProps } from "../../interface/IPlayerProps";
import { Positioned } from "../../interface/IPositioned";
import { GameEntity } from "../GameEntity";

/**
 * A class-based collectible entity.
 * It assumes the correct world coordinates are passed in from the tileBlock.
 */
export class CollectibleEntity extends GameEntity<ICollectibleProps> {

    private static readonly COLLECTIBLE_WIDTH = 32;
    private static readonly COLLECTIBLE_HEIGHT = 32;
    private static readonly COLLECTIBLE_RADIUS = 16;


    constructor(x: number, y: number) {
        super(
            "collectibleBlock",
            {
                positioned: new Positioned(x, y, CollectibleEntity.COLLECTIBLE_WIDTH, CollectibleEntity.COLLECTIBLE_HEIGHT),
                collitionRadius: CollectibleEntity.COLLECTIBLE_RADIUS,

                isInitialized: false,
                zIndex: 1,
                states: {},
                animation: {
                    name: 'spinning',
                    frames: [0, 1, 2, 3],
                    frameRate: 15,
                    currentFrameIndex: 0,
                    lastFrameChangeTime: 0,
                    spriteSheet: gameAssets.getSpriteSheet("coin", 10, 10, 4, 1)!
                },
                isCollidable:true
            }



        );

    }

    getBoundingBox = (self: IGameEntity<ICollectibleProps>): IBoundingBox => {
        return {
            x: self.props.positioned.x - self.props.collitionRadius,
            y: self.props.positioned.y - self.props.collitionRadius,
            width: self.props.collitionRadius * 2,
            height: self.props.collitionRadius * 2,
        };
    }

    onInit? = (self: IGameEntity<ICollectibleProps>): void => {
        self.props.isInitialized = true;
    }

    onUpdate? = (self: IGameEntity<ICollectibleProps>, timeStamp: number): void => {
     
    }

    onDraw? = (self: IGameEntity<ICollectibleProps>, helper: CanvasHelper): void => {

        const props = self.props;
        helper.drawAnimatedSprite(
            props.animation,
            props.positioned.x + props.positioned.width / 2,
            props.positioned.y,
            performance.now()
        );
    }


}
