import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { gameState } from "../../../gameState";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { IPlayerProps } from "../../../interface/IPlayerProps";
import { getTileProperties } from "../../../utils/tileBlockHelpers";
import { CollectibleEntity } from "../../collectible/CollectibleEntity";
import { GameEntity } from "../../GameEntity";
import { PlatformEntity } from "../../platform/PlatformEntity";
import { TileEntity } from "../../tiles/tileEntity";


export const playerCollisionDetectors =
[
    // Collision detector for static tile blocks
    {
        targetName: "tileBlock",
        detectorFn: (playerProps: IPlayerProps, tileEntity: TileEntity) => {
            const collisionResults = new Array<ICollisionResult>();
            const gridWidth = 32;
            const gridHeight = 32;

            // Get the logical collision map from the tile entity's props
            const logicalCollisionMap = tileEntity.logicalCollisionMap;
            if (!logicalCollisionMap) {
                console.warn("Logical collision map not found.");
                return collisionResults;
            }

            const playerTileX = Math.floor(playerProps.positioned.x / gridWidth);
            const playerTileY = Math.floor(playerProps.positioned.y / gridHeight);
            
            const checkRadius = 2;
            for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                    // Step 1: Check bounds and logical map first for performance
                    if (row >= 0 && row < logicalCollisionMap.length && col >= 0 && col < logicalCollisionMap[0].length) {
                        if (logicalCollisionMap[row][col]) {
                            // Step 2: If logical map indicates solid, perform AABB collision
                            const tileType = tileEntity.props.tileMap[row][col];
                            const tileDimensions = getTileProperties(tileType);
                            if (!tileDimensions) continue;
                            
                            const tileX = col * gridWidth;
                            const tileY = row * gridHeight;

                            const collisionResult = CollisionHelper.isRectRectColliding(
                                playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width,
                                playerProps.positioned.height,
                                tileX, tileY, tileDimensions.width, tileDimensions.height
                            );

                            if (collisionResult) {
                                collisionResults.push(collisionResult);
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
            
            const { x: tileX, y: tileY, width: tileWidth, height: tileHeight, axis } = collisionData;

            if (axis === CollisionAxis.X) {
                if (playerProps.velX > 0) {
                    playerProps.positioned.x = tileX - playerProps.positioned.width;
                } else if (playerProps.velX < 0) {
                    playerProps.positioned.x = tileX + tileWidth;
                }
                playerProps.velX = 0;
            } else if (axis === CollisionAxis.Y) {
                if (playerProps.velY > 0) {
                    playerProps.positioned.y = tileY - playerProps.positioned.height;
                    playerProps.isGrounded = true;
                } else if (playerProps.velY < 0) {
                    playerProps.positioned.y = tileY + tileHeight;
                }
                playerProps.velY = 0;
            }
        }
    },
    // Collision detector for collectibles
    {
        targetName: "collectibleBlock",
        detectorFn: (playerProps: IPlayerProps, collectibleEntity: CollectibleEntity) => {
            // If the collectible is already collected, no need to check for collision.
           

            const collisionResults = new Array<ICollisionResult>();
            const collisionResult = CollisionHelper.isRectRectColliding(
                playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                collectibleEntity.props.positioned.x, collectibleEntity.props.positioned.y, collectibleEntity.props.positioned.width, collectibleEntity.props.positioned.height
            );
            if (collisionResult) {
                collisionResults.push(collisionResult);
            }
            return collisionResults;
        },
        onCollision: (playerProps: IPlayerProps, collisionData: ICollisionResult, collectibleEntity: CollectibleEntity) => {
            gameState.removeEntityByUUID(collectibleEntity.uuid);
        }
    },
    // Collision detector for platforms
    {
        targetName: "platformBlock",
        detectorFn: (playerProps: IPlayerProps, platformEntity: PlatformEntity) => {
            const collisionResults = new Array<ICollisionResult>();
            const collisionResult = CollisionHelper.isRectRectColliding(
                playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                platformEntity.props.positioned.x, platformEntity.props.positioned.y, platformEntity.props.positioned.width, platformEntity.props.positioned.height
            );
            if (collisionResult) {
                collisionResults.push(collisionResult);
            }
            return collisionResults;
        },
        onCollision: (playerProps: IPlayerProps, collisionData: ICollisionResult, platformEntity: PlatformEntity) => {
            if (!collisionData) {
                return;
            }
            
            const { x: platformX, y: platformY, width: platformWidth, height: platformHeight, axis } = collisionData;
            
            if (axis === CollisionAxis.X) {
                if (playerProps.velX > 0) {
                    playerProps.positioned.x = platformX - playerProps.positioned.width;
                } else if (playerProps.velX < 0) {
                    playerProps.positioned.x = platformX + platformWidth;
                }
                playerProps.velX = 0;
            } else if (axis === CollisionAxis.Y) {
                if (playerProps.velY > 0) {
                    playerProps.positioned.y = platformY - playerProps.positioned.height;
                    playerProps.isGrounded = true;
                } else if (playerProps.velY < 0) {
                    playerProps.positioned.y = platformY + platformHeight;
                }
                playerProps.velY = 0;
            }
        }
    }
];
