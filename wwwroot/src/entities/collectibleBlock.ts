// collectibleBlock.ts
import { IGameEntity, ICollisionResult, CollisionAxis } from "../interface/IGameEntity";
import { ICollectibleProps } from "../interface/ICollectibleProps";
import { IPlayerProps } from "./playerBlock";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";

export const collectibleBlock = (tile: any, width: number, height: number): IGameEntity<ICollectibleProps> => {

    return {
        key: "collectibleBlock",
        name: "collectibleBlock",
        props: {
            x: tile.x * width,
            y: tile.y * height,
            radius: 5,
            color: "gold",
            uuid: crypto.randomUUID(),
        },
        getBoundingBox: (self): IBoundingBox => {
            return {
                x: self.props.x - self.props.radius,
                y: self.props.y - self.props.radius,
                width: self.props.radius * 2,
                height: self.props.radius * 2
            };
        },
        // The collision logic is now a `detectorFn` that will be called by another entity.
        collisionDetectors: [
            {
                targetName: "playerBlock",
                detectorFn: (selfProps: ICollectibleProps, targetEntity: IGameEntity<any>) => {
                    const playerProps = targetEntity.props as IPlayerProps;
                    
                    // Simple AABB (Axis-Aligned Bounding Box) intersection check
                    if (
                        playerProps.x < selfProps.x + selfProps.radius &&
                        playerProps.x + playerProps.width > selfProps.x - selfProps.radius &&
                        playerProps.y < selfProps.y + selfProps.radius &&
                        playerProps.y + playerProps.height > selfProps.y - selfProps.radius
                    ) {
                        return {
                            axis: CollisionAxis.Y, // Collision with a collectible is more of an event than a physical block, so the axis isn't critical but we provide one for consistency.
                            targetEntity: targetEntity,
                            x: selfProps.x,
                            y: selfProps.y,
                            width: selfProps.radius * 2,
                            height: selfProps.radius * 2,
                        };
                    }
                    return false;
                },
                onCollision: (selfProps: ICollectibleProps, collisionData) => {
                    const player = collisionData.targetEntity as IGameEntity<IPlayerProps>;
                    console.log("Collectible collected by player:", selfProps.uuid);

                    // Find and remove this collectible from the tileBlock's collectibles array
                    const tileEntity = gameState.findEntities("tileBlock")[0]; // Assuming there's only one tileBlock
                    if (tileEntity) {
                        const tileProps = tileEntity.props;
                        tileProps.collectibles = tileProps.collectibles.filter(
                            (c: IGameEntity<ICollectibleProps>) => c.props.uuid !== selfProps.uuid
                        );
                    }
                }
            }
        ],
        // The onUpdate method is now empty, as collision checks happen in tileBlock.ts.
        onUpdate: (self, timeStamp) => { },
        onDraw: (self, helper) => {
            const ctx = helper.ctx;
            const viewportX = gameState.viewport.x;
            const viewportY = gameState.viewport.y;
            ctx.fillStyle = self.props.color;
            ctx.beginPath();
            ctx.arc(
                self.props.x - viewportX,
                self.props.y - viewportY,
                self.props.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    };
};