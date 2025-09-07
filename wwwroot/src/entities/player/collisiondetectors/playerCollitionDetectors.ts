import { CollisionAxis } from "../../../enums/CollisionAxis";
import { IBoundingCircle } from "../../../interface/IBoundingBox";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { gameState } from "../../../state/gameState";
import { getTileProperties, getTileImageDataAndProps } from "../../../utils/tileBlockHelpers";
import { CollectibleEntity } from "../../collectible/CollectibleEntity";
import { LadderEntity } from "../../ladderEntity";
import { PlatformEntity } from "../../platform/PlatformEntity";
import { TileEntity } from "../../tiles/tileEntity";
import { PlayerEntity } from "../playerEntity";
import { ExtendedCollisionHelper } from "./extendedCollitionHelper";


export const playerCollisionDetectors =
    [
        // Collision detector for static tile blocks
        {
            targetName: "tileBlock",
            detectorFn: (playerEntity: PlayerEntity, tileEntity: TileEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();
                const gridWidth = 32;
                const gridHeight = 32;
                const viewport = gameState.viewport;
                const logicalCollisionMap = tileEntity.logicalCollisionMap;

                if (!logicalCollisionMap) {
                    console.warn("Logical collision map not found.");
                    return collisionResults;
                }

                const playerCircle: IBoundingCircle = {
                    x: playerProps.positioned.x + playerProps.positioned.width / 2,
                    y: playerProps.positioned.y + playerProps.positioned.height / 2,
                    radius: (playerProps.positioned.width / 2)
                };

                const playerTileX = Math.floor(playerCircle.x / gridWidth);
                const playerTileY = Math.floor(playerCircle.y / gridHeight);

                // We will check in a small radius around the player's tile
                const checkRadius = 1;

                for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                    for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                        if (row >= 0 && row < logicalCollisionMap.length && col >= 0 && col < logicalCollisionMap[0].length) {
                            const logicalTile = logicalCollisionMap[row][col];

                            if (logicalTile) {
                                const tileType = logicalTile.type;
                                const tileDimensions = getTileProperties(tileType);
                                if (!tileDimensions) continue;

                                const tileBox = {
                                    x: logicalTile.x,
                                    y: logicalTile.y,
                                    width: tileDimensions.width,
                                    height: tileDimensions.height,
                                    tileType: tileType
                                };

                                const tileTexture = getTileImageDataAndProps(tileEntity.tileImageData, tileType);

                                // Perform the pixel-perfect check if we have texture data
                                if (tileTexture && tileTexture.data) {
                                    const collisionResult = ExtendedCollisionHelper.isCirclePixelColliding(
                                        playerCircle,
                                        tileBox,
                                        tileTexture.data
                                    );

                                    // If a collision is detected, add it to the results
                                    if (collisionResult) {
                                        collisionResult.targetEntity = tileEntity;
                                        collisionResults.push(collisionResult);
                                    }
                                } else {
                                    // Fallback to plain AABB if pixel data is not available
                                    const collisionResult = ExtendedCollisionHelper.isRectRectColliding(
                                        playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                                        tileBox.x, tileBox.y, tileBox.width, tileBox.height
                                    );
                                    if (collisionResult) {
                                        collisionResults.push(collisionResult);
                                    }
                                }
                            }
                        }
                    }
                }
                return collisionResults;
            },
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult) => {
                const playerProps = playerEntity.props;

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

                        playerEntity.stateHelper.set<boolean>("isGrounded", true);

                    } else if (playerProps.velY < 0) {
                        playerProps.positioned.y = tileY + tileHeight;
                        playerEntity.stateHelper.set<boolean>("isGrounded", false);
                    }
                    playerProps.velY = 0;
                }
            }
        },
        // Collision detector for collectibles
        {
            targetName: "collectibleBlock",
            detectorFn: (playerEntity: PlayerEntity, collectibleEntity: CollectibleEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();
                const collisionResult = ExtendedCollisionHelper.isRectRectColliding(
                    playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                    collectibleEntity.props.positioned.x, collectibleEntity.props.positioned.y, collectibleEntity.props.positioned.width, collectibleEntity.props.positioned.height
                );
                if (collisionResult) {
                    collisionResults.push(collisionResult);
                    collisionResult.type = "collectible";
                }
                return collisionResults;
            },
            // The onCollision logic for collectibles is now handled centrally in the playerUpdate function.
            // This detector only needs to return a collision result for the game loop to process.
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult, collectibleEntity: CollectibleEntity) => {
                gameState.removeEntityByUUID(collectibleEntity.uuid);

            }
        },
        // Collision detector for platforms
        {
            targetName: "platformBlock",
            detectorFn: (playerEntity: PlayerEntity, platformEntity: PlatformEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();
                const collisionResult = ExtendedCollisionHelper.isRectRectColliding(
                    playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                    platformEntity.props.positioned.x, platformEntity.props.positioned.y, platformEntity.props.positioned.width, platformEntity.props.positioned.height
                );
                if (collisionResult) {
                    collisionResults.push(collisionResult);
                    collisionResult.type = "platform";
                }
                return collisionResults;
            },
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult, platformEntity: PlatformEntity) => {
                // Check if the player is hitting the platform from above
                    playerEntity.props.positioned.y = platformEntity.props.positioned.y - playerEntity.props.positioned.height;
                    playerEntity.props.velY = 0;       
                    playerEntity.props.velY = platformEntity.props.velY;
                    playerEntity.stateHelper.set("isGrounded", true);
                    playerEntity.stateHelper.set("onPlatform", true);
                }
           
        },
        // Collision detector for ladders
        {
            targetName: "ladder",
            detectorFn: (playerEntity: PlayerEntity, ladderEntity: LadderEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();
                const collisionResult = ExtendedCollisionHelper.isRectRectColliding(
                    playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                    ladderEntity.props.positioned.x, ladderEntity.props.positioned.y,
                    ladderEntity.props.positioned.width, ladderEntity.props.positioned.height,
                );
                if (collisionResult) {
                    collisionResults.push(collisionResult);
                    collisionResult.type = "ladder";
                }
                return collisionResults;
            },
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult, ladderEntity: LadderEntity) => {
                playerEntity.stateHelper.set("onLadder", true);            
            }
        }
    ];
