// collectibleBlock.ts
import { IGameEntity } from "../interface/IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { ICollisionResult } from "../interface/ICollisionResult";
import { ICollectibleProps } from "../interface/ICollectibleProps";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IPlayerProps } from "../interface/IPlayerProps";
import { Positioned } from "../interface/IPositioned";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";

/**
 * A factory function that creates a collectible entity.
 * It assumes the correct world coordinates are passed in from the tileBlock.
 * @param x The world pixel x-coordinate of the collectible.
 * @param y The world pixel y-coordinate of the collectible.
 */
export const collectibleBlock = (x: number, y: number): IGameEntity<ICollectibleProps> => {

    // Define the fixed size of the collectible. This is independent of tile size.
    const collectibleWidth = 16;
    const collectibleHeight = 16;
    
    return {
        uuid: crypto.randomUUID(), 
        key: "collectibleBlock",
        name: "collectibleBlock",
        props: {
            // Use the provided x and y directly to set the collectible's world position
            position: new Positioned(x, y, collectibleWidth, collectibleHeight),
            radius: 5,
            color: "gold",
            uuid: crypto.randomUUID(),
        },
        getBoundingBox: (self): IBoundingBox => {
            return {
                x: self.props.position.x - self.props.radius,
                y: self.props.position.y - self.props.radius,
                width: self.props.radius * 2,
                height: self.props.radius * 2
            };
        },
        collisionDetectors: [
            {
                targetName: "playerBlock",
                detectorFn: (selfProps: ICollectibleProps, targetEntity: IGameEntity<IPlayerProps>) => {
                    const playerProps = targetEntity.props;
                    if (CollisionHelper.AABBColliding(selfProps.position.getBoundingBox!(), 
                    playerProps.position.getBoundingBox!())) {
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
                },
                onCollision: (selfProps: ICollectibleProps, collisionData) => {
                    const tileEntity = gameState.findEntities("tileBlock")[0];
                    if (tileEntity) {
                        const tileProps = tileEntity.props;
                        tileProps.collectibles = tileProps.collectibles.filter(
                            (c: IGameEntity<ICollectibleProps>) => c.props.uuid !== selfProps.uuid
                        );
                    }
                }
            }
        ],
        // The onUpdate method is empty as collision checks are handled by the tileBlock.
        onUpdate: (self, timeStamp) => { },
        onDraw: (self, helper) => {
            const ctx = helper.ctx;
            const viewport = gameState.viewport;
            
            // Draw the collectible at its absolute world coordinates.
            // The WorldEntity's translate method handles the camera scroll.
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
        },
        onInit:(self) => { }
    };
};