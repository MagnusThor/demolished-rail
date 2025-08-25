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


export const collectibleBlock = (tile: any, width: number, height: number): IGameEntity<ICollectibleProps> => {

    return {
        uuid: crypto.randomUUID(), // Generate a unique identifier for the collectible
        key: "collectibleBlock",
        name: "collectibleBlock",
        props: {
            position: new Positioned(tile.x * width, tile.y * height, width, height),
            radius: 5,
            color: "gold",
            uuid: crypto.randomUUID(),
        },
        getBoundingBox: (self): IBoundingBox => {
            // Return a bounding box for the collectible based on its position and radius
            return {
                x: self.props.position.x - self.props.radius,
                y: self.props.position.y - self.props.radius,
                width: self.props.radius * 2,
                height: self.props.radius * 2
            };
        },
        // The collision logic is now a `detectorFn` that will be called by another entity.
        collisionDetectors: [
            {
                targetName: "playerBlock",
                detectorFn: (selfProps: ICollectibleProps, targetEntity: IGameEntity<IPlayerProps>) => {
                    const playerProps = targetEntity.props;          
                    // Use the AABBColliding helper method to check for collision
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
                    const player = collisionData.targetEntity as IGameEntity<IPlayerProps>;                  
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
        onInit:(self) =>{

        }
    };
};
