// entities/bulletBlock.ts
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IBulletProps } from "../interface/IBulletProps";
import { IGameEntity } from "../interface/IGameEntity";
import { CollisionAxis } from "../enums/CollisionAxis";
import { ICollisionResult } from "../interface/ICollisionResult";
import { IDynamicEntity } from "../interface/IDynamicEntity";
import { ITileProps } from "../interface/ITileProps";
import { isSolidTile } from "../utils/tileBlockHelpers";
import { Positioned } from "../interface/IPositioned";

const BULLET_SPEED = 10;

/**
 * Creates and returns a new bullet entity.
 * @param startX The starting X position.
 * @param startY The starting Y position.
 * @param direction "left" or "right" to determine the bullet's trajectory.
 */
export const bulletBlock = (startX: number, startY: number, direction: "left" | "right"): IDynamicEntity<IBulletProps> => {
    return {
        uuid: crypto.randomUUID(), // Generate a unique identifier for the bullet
        key: "bulletBlock",
        name: "bulletBlock",
        props: {
           health: {
                health: 100, // Default health value for the bullet
                damage: 10 // Damage dealt by the bullet
            },
            position: new Positioned(startX, startY, 8, 8),
            velX: direction === "right" ? BULLET_SPEED : -BULLET_SPEED,
            velY: 0,
            isAlive: true,
            lifeTime: 2000,
           
        },
        getBoundingBox: (self): IBoundingBox => {
           return self.props.position.getBoundingBox!();
        },
        collisionDetectors: [
            {
                targetName: "tileBlock",
                detectorFn: (bulletProps: IBulletProps, tileEntity: IGameEntity<ITileProps>) => {
                
                    const tileProps = tileEntity.props;
                    const collisionResults = new Array<ICollisionResult>();
                    const bulletBBox = bulletProps.position.getBoundingBox!();                
                    // Check a radius around the bullet to reduce collision checks
                    const bulletTileX = Math.floor(bulletProps.position.x / tileProps.tileWidth);
                    const bulletTileY = Math.floor(bulletProps.position.y / tileProps.tileHeight);
                    const checkRadius = 1; 

                    for (let row = bulletTileY - checkRadius; row <= bulletTileY + checkRadius; row++) {
                        for (let col = bulletTileX - checkRadius; col <= bulletTileX + checkRadius; col++) {
                            if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                                const tileType = tileProps.tileMap[row][col];
                                if (isSolidTile(tileType)) {
                                    const tileX = col * tileProps.tileWidth;
                                    const tileY = row * tileProps.tileHeight;                                    
                              
                                    const tileBBox: IBoundingBox = {
                                        x: tileX,
                                        y: tileY,
                                        width: tileProps.tileWidth,
                                        height: tileProps.tileHeight
                                    };
                                    // Check for collision between the bullet and the tile    
                                    // Use the AABBColliding helper
                                    if (CollisionHelper.AABBColliding(bulletBBox, tileBBox)) {
                                        collisionResults.push({
                                            x: tileX, y: tileY, width: tileProps.tileWidth, height: tileProps.tileHeight, axis: CollisionAxis.X,
                                            targetEntity: tileEntity,
                                        });
                                    }
                                }
                            }
                        }
                    }
                    return collisionResults;
                
                },
                onCollision: (bulletProps: IBulletProps, collisionData: ICollisionResult) => {                 
                    bulletProps.isAlive = false;
                }
            }
        ],
        onUpdate: (self, timeStamp) => {
            self.props.position.x += self.props.velX;
            // The bullet's lifetime decreases over time. When it reaches 0 or less, it's marked for removal.
            self.props.lifeTime -= timeStamp;
            if (self.props.lifeTime <= 0) {
                self.props.isAlive = false;
            }
        },
        onDraw: (self, helper) => {
            if (!self.props.isAlive) {
                return;
            }
            const props = self.props;
            const ctx = helper.ctx;
    
            ctx.fillStyle = "#FFC107";
            ctx.fillRect(
                props.position.x ,
                props.position.y,
                props.position.width,
                props.position.height,
            );
        },
        onInit: () => { },
    };
};
