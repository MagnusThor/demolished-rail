import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { IGameEntity } from "../../../interface/IGameEntity";
import { IPlayerProps } from "../../../interface/IPlayerProps";
import { ITileProps } from "../../../interface/ITileProps";
import { isSolidTile } from "../../../utils/tileBlockHelpers";

 
 export const playerCollisionDetectors =
 [
            {
                targetName: "tileBlock",
                detectorFn: (playerProps: IPlayerProps, tileEntity: IGameEntity<ITileProps>) => {
                    const tileProps = tileEntity.props;
                    const collisionResults = new Array<ICollisionResult>();
                    const playerTileX = Math.floor(playerProps.position.x / tileProps.tileWidth);
                    const playerTileY = Math.floor(playerProps.position.y / tileProps.tileHeight);
                    const checkRadius = 2;
                    for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                        for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                            if (row >= 0 && row < tileProps.tileMap.length && col >= 0 && col < tileProps.tileMap[0].length) {
                                const tileType = tileProps.tileMap[row][col];
                                if (isSolidTile(tileType)) {
                                    const tileX = col * tileProps.tileWidth;
                                    const tileY = row * tileProps.tileHeight;
                                    if (CollisionHelper.isRectRectColliding(
                                        playerProps.position.x, playerProps.position.y, playerProps.position.width,
                                        playerProps.position.height,
                                        tileX, tileY, tileProps.tileWidth, tileProps.tileHeight
                                    )) {
                                        collisionResults.push({
                                            x: tileX, y: tileY, width: tileProps.tileWidth, height: tileProps.tileHeight, axis: CollisionAxis.X,
                                            targetEntity: tileEntity
                                        });
                                    }
                                }
                            }
                        }
                    }
                    return collisionResults;
                },
                onCollision: (playerProps: IPlayerProps, collisionData: ICollisionResult) => {
                    if (!collisionData) {
                        return;
                    }
                    const axis = collisionData.axis;
                    const tileX = collisionData.x;
                    const tileY = collisionData.y;
                    const tileWidth = collisionData.width;
                    const tileHeight = collisionData.height;
                    if (axis === 'x') {
                        if (playerProps.velX > 0) {
                            playerProps.position.x = tileX - playerProps.position.width;
                        } else if (playerProps.velX < 0) {
                            playerProps.position.x = tileX + tileWidth;
                        }
                        playerProps.velX = 0;
                    } else if (axis === 'y') {
                        if (playerProps.velY > 0) {
                            playerProps.position.y = tileY - playerProps.position.height;
                            playerProps.isGrounded = true;
                        } else if (playerProps.velY < 0) {
                            playerProps.position.y = tileY + tileHeight;
                        }
                        playerProps.velY = 0;
                    }
                }
            }
        ];