import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { IBoundingCircle } from "../../../interface/IBoundingBox";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { IPlayerProps } from "../../../interface/IPlayerProps";
import { gameState } from "../../../state/gameState";
import { getTileProperties, getTileImageDataAndProps } from "../../../utils/tileBlockHelpers";
import { CollectibleEntity } from "../../collectible/CollectibleEntity";
import { LadderEntity } from "../../ladderEntity";
import { PlatformEntity } from "../../platform/PlatformEntity";
import { TileEntity } from "../../tiles/tileEntity";
import { ExtendedCollitionHelper } from "./isPixelPerfectColliding";

export const playerCollisionDetectors =
    [
        // Collision detector for static tile blocks
        {
            targetName: "tileBlock",
            detectorFn: (playerProps: IPlayerProps, tileEntity: TileEntity) => {

                const collisionResults = new Array<ICollisionResult>();
                
                const gridWidth = 32;
                const gridHeight = 32;
                const ctx = gameState.ctx;
                const viewport = gameState.viewport;

                const logicalCollisionMap = tileEntity.logicalCollisionMap;
                
                if (!logicalCollisionMap) {
                    console.warn("Logical collision map not found.");
                    return collisionResults;
                }

                // Define player as a circle for more accurate collisions
                const playerCircle: IBoundingCircle = {
                    x: playerProps.positioned.x + playerProps.positioned.width / 2,
                    y: playerProps.positioned.y + playerProps.positioned.height / 2,
                    radius: (playerProps.positioned.width / 2) - 2
                };

                const playerTileX = Math.floor(playerCircle.x / gridWidth);
                const playerTileY = Math.floor(playerCircle.y / gridHeight);

                // Debug draw player circle
                if (ctx && viewport) {
                    ctx.strokeStyle = 'magenta';
                    ctx.beginPath();
                    ctx.arc(playerCircle.x - viewport.x, playerCircle.y - viewport.y, playerCircle.radius, 0, 2 * Math.PI);
                    ctx.stroke();
                }

                // Make the radius dynamic based on player speed
                const playerSpeed = Math.max(Math.abs(playerProps.velX), Math.abs(playerProps.velY));
                const minRadius = 3;
                const maxRadius = 8;
                const dynamicRadius = Math.ceil(playerSpeed / gridWidth);
                let checkRadius = Math.min(minRadius + dynamicRadius, maxRadius);

                checkRadius = 1;
                
                for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {

                    for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                        if (row >= 0 && row < logicalCollisionMap.length && col >= 0 && col < logicalCollisionMap[0].length) {
                            // Now we get the tile object, not just the type
                            const logicalTile = logicalCollisionMap[row][col];
                            
                            // Check if the logical map indicates a solid tile first
                            if (logicalTile) {
                                // Access the type, and the tile's world coordinates and logical grid position
                                const tileType = logicalTile.type;
                                const tileDimensions = getTileProperties(tileType);
                                if (!tileDimensions) continue;

                                // Use the correct tile's top-left coordinates from the logical map
                                const tileX = logicalTile.x;
                                const tileY = logicalTile.y; 

                                const tileBox = {
                                    x: tileX,
                                    y: tileY,
                                    width: tileDimensions.width,
                                    height: tileDimensions.height,
                                    tileType: tileType
                                };

                                // ONLY visualize the tileBox here, after confirming it's a solid tile.
                                if (ctx && viewport) {
                                    ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
                            
                                    ctx.strokeRect(tileBox.x - viewport.x, tileBox.y - viewport.y, tileBox.width, tileBox.height);
                                
                                }

                                // Broad-phase AABB check for the circle's containing box
                                const playerBoxForAABB = {
                                    x: playerCircle.x - playerCircle.radius,
                                    y: playerCircle.y - playerCircle.radius,
                                    width: playerCircle.radius * 2,
                                    height: playerCircle.radius * 2
                                };

                                if (CollisionHelper.AABBColliding(playerBoxForAABB, tileBox)) {
                                    const tileTexture = getTileImageDataAndProps(tileEntity.tileImageData, tileType);

                                    // Check if we have texture data before proceeding with the pixel-perfect check
                                    if (tileTexture && tileTexture.data) {
                                   
                                        // Now we perform the pixel-perfect check with the circle
                                        if (ExtendedCollitionHelper.isCirclePixelColliding(
                                            playerCircle,
                                            tileBox,
                                            tileTexture.data
                                        )) {
                                            const collisionResult = CollisionHelper.isRectRectColliding(
                                                playerBoxForAABB.x, playerBoxForAABB.y, playerBoxForAABB.width,
                                                playerBoxForAABB.height,
                                                tileX, tileY, tileDimensions.width, tileDimensions.height
                                            );
                                            if (collisionResult) {
                                               
                                                collisionResults.push(collisionResult);
                                            }
                                        }
                                    } else {
                                        // NEW LOGGING: This will tell you exactly which tile type is missing data
                                        
                                        // Fallback to plain AABB since pixel data is not available
                                        const collisionResult = CollisionHelper.isRectRectColliding(
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
                        playerProps.states!["isGrounded"] = true;
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
                        playerProps.states!["isGrounded"] = true;
                    } else if (playerProps.velY < 0) {
                        playerProps.positioned.y = platformY + platformHeight;
                    }
                    playerProps.velY = 0;
                }
            }
        },
        // Collision detector for ladders
        {
            targetName: "ladder",
            detectorFn: (playerProps: IPlayerProps, ladderEntity: LadderEntity) => {
                const collisionResults = new Array<ICollisionResult>();
                const collisionResult = CollisionHelper.isRectRectColliding(
                    playerProps.positioned.x, playerProps.positioned.y, playerProps.positioned.width, playerProps.positioned.height,
                    ladderEntity.props.positioned.x, ladderEntity.props.positioned.y, ladderEntity.props.positioned.width, ladderEntity.props.positioned.height
                );

                if (collisionResult) {
                    collisionResults.push(collisionResult);
                }
                return collisionResults;
            },
            onCollision: (playerProps: IPlayerProps, collisionData: ICollisionResult, ladderEntity: LadderEntity) => {
                // This is where you will enable the climbing logic in your player's update function.
                // For now, we will simply set a flag.
                //const target = collisionData.targetEntity;
                //target?.stateHelper.set<Boolean>("onLadder",true);
                playerProps.states!["onLadder"] = true;
            }
        }
    ];
