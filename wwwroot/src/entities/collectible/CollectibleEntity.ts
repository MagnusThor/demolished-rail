import { CanvasHelper } from "../../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../enums/CollisionAxis";
import { gameState } from "../../gameState";
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
export class CollectibleEntity extends GameEntity<ICollectibleProps> implements IGameEntity<ICollectibleProps> {

    // Define the fixed size of the collectible.
    private static readonly COLLECTIBLE_WIDTH = 16;
    private static readonly COLLECTIBLE_HEIGHT = 16;
    private static readonly COLLECTIBLE_RADIUS = 5;

    constructor(x: number, y: number) {
        super(
            "collectibleBlock",
            {
                position: new Positioned(x, y, CollectibleEntity.COLLECTIBLE_WIDTH, CollectibleEntity.COLLECTIBLE_HEIGHT),
                radius: CollectibleEntity.COLLECTIBLE_RADIUS,
                color: "gold",
                uuid: crypto.randomUUID(),
                isInitialized: false,
            }
        );
        this.collisionDetectors = [
            {
                targetName: "playerBlock",
                detectorFn: this.detectPlayerCollision,
                onCollision: this.handlePlayerCollision,
            }
        ];
    }

    getBoundingBox = (self: IGameEntity<ICollectibleProps>): IBoundingBox => {
        return {
            x: self.props.position.x - self.props.radius,
            y: self.props.position.y - self.props.radius,
            width: self.props.radius * 2,
            height: self.props.radius * 2,
        };
    }

    onInit? = (self: IGameEntity<ICollectibleProps>): void => {
        self.props.isInitialized = true;
    }

    onUpdate? = (self: IGameEntity<ICollectibleProps>, timeStamp: number): void => {
        // No update logic for a static collectible
    }

    onDraw? = (self: IGameEntity<ICollectibleProps>, helper: CanvasHelper): void => {
        const ctx = helper.ctx;
        ctx.fillStyle = self.props.color;
        ctx.beginPath();
        ctx.arc(
            self.props.position.x,
            self.props.position.y,
            self.props.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    private detectPlayerCollision(selfProps: ICollectibleProps, targetEntity: IGameEntity<IPlayerProps>): ICollisionResult | false {
        const playerProps = targetEntity.props;
        if (CollisionHelper.AABBColliding(selfProps.position.getBoundingBox!(), playerProps.position.getBoundingBox!())) {
            return {
                axis: CollisionAxis.Y,
                targetEntity: targetEntity,
                x: selfProps.position.x,
                y: selfProps.position.y,
                width: selfProps.radius * 2,
                height: selfProps.radius * 2,
            };
        }
        return false;
    }

    private handlePlayerCollision(selfProps: ICollectibleProps, collisionData: ICollisionResult): void {
        const tileEntity = gameState.findEntities("tileBlock")[0];
        if (tileEntity) {
            const tileProps = tileEntity.props as ILevelProps;
            tileProps.collectibles = tileProps.collectibles.filter(
                (c: IGameEntity<ICollectibleProps>) => c.props.uuid !== selfProps.uuid
            );
        }
    }
}