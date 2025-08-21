// entities/bulletBlock.ts
import { CanvasHelper } from "../../../src/Engine/Helpers/CanvasHelper";
import { CollisionHelper } from "../../../src/Engine/Helpers/CollisionHelper";
import { gameState } from "../gameState";
import { IBoundingBox } from "../interface/IBoundingBox";
import { IBulletProps } from "../interface/IBulletProps";
import { IGameEntity, ICollisionResult, CollisionAxis, IDynamicEntity } from "../interface/IGameEntity";
import { ITileProps } from "../interface/ITileProps";
import { isSolidTile } from "./tileBlockHelpers";

const BULLET_SPEED = 10;

/**
 * Creates and returns a new bullet entity.
 * @param startX The starting X position.
 * @param startY The starting Y position.
 * @param direction "left" or "right" to determine the bullet's trajectory.
 */
export const bulletBlock = (startX: number, startY: number, direction: "left" | "right"): IDynamicEntity<IBulletProps> => {
    return {
        key: "bulletBlock",
        name: "bulletBlock",
        props: {
            x: startX,
            y: startY,
            width: 8,
            height: 8,
            velX: direction === "right" ? BULLET_SPEED : -BULLET_SPEED,
            velY: 0,
            isAlive: true,
            lifeTime: 1000,
            startPoint: {
                x: startX,
                y: startY
            }
        },
        getBoundingBox: (self): IBoundingBox => {
            return {
                x: self.props.x,
                y: self.props.y,
                width: self.props.width,
                height: self.props.height,
            };
        },
        collisionDetectors: [
            {
                targetName: "tileBlock",
                detectorFn: (bulletProps: IBulletProps, tileEntity: IGameEntity<ITileProps>) => {
                
                    const tileProps = tileEntity.props;
                    const collisionResults = new Array<ICollisionResult>();
                
                    const bulletTileX = Math.floor(bulletProps.x / tileProps.tileWidth);
                    const bulletTileY = Math.floor(bulletProps.y / tileProps.tileHeight);
                    const checkRadius = 1;
                
                    for (let row = bulletTileY - checkRadius; row <= bulletTileY + checkRadius; row++) {
                        for (let col = bulletTileX - checkRadius; col <= bulletTileX + checkRadius; col++) {
                            if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                                const tileType = tileProps.tileMap[row][col];
                                if (isSolidTile(tileType)) {
                                    const tileX = col * tileProps.tileWidth;
                                    const tileY = row * tileProps.tileHeight;
                                    
                                    if (CollisionHelper.isRectRectColliding(
                                        bulletProps.x, bulletProps.y, bulletProps.width, bulletProps.height,
                                        tileX, tileY, tileProps.tileWidth, tileProps.tileHeight
                                    )) {
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
            self.props.x += self.props.velX;
        },
        onDraw: (self, helper) => {
            if (!self.props.isAlive) {
                return;
            }
            const props = self.props;
            const ctx = helper.ctx;
            const viewportX = gameState.viewport.x;
            const viewportY = gameState.viewport.y;
            ctx.fillStyle = "#FFC107";
            ctx.fillRect(
                props.x - viewportX,
                props.y - viewportY,
                props.width,
                props.height,
            );
        },
        onInit: () => { },
    };
};
