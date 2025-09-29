import { Point2D } from "../../../../../src";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { IBoundingCircle } from "../../../interface/IBoundingBox";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { GameState } from "../../../global/GameState";
import { getTileProperties, getTileImageDataAndProps } from "../../../utils/tileEntityHelpers";
import { CollectibleEntity } from "../../collectible/CollectibleEntity";
import { LadderEntity } from "../../ladderEntity";
import { PlatformEntity } from "../../platform/PlatformEntity";
import { RopeEntity } from "../../platform/RopeEntity";
import { LevelEntity } from "../../level/levelEntity";
import { PlayerEntity } from "../playerEntity";
import { ExtendedCollisionHelper } from "./extendedCollitionHelper";
import { WorldManager } from "../../WorldManager";
import { isHardImpact, calculateShakeIntensity } from "../../../utils/impactHelpers";


export const playerCollisionDetectors =
    [
        {
            targetName: "tileBlock",
            detectorFn: (playerEntity: PlayerEntity, tileEntity: LevelEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();
                const gridWidth = 32;
                const gridHeight = 32;
                const logicalCollisionMap = tileEntity.logicalCollisionMap;

                const playerCircle: IBoundingCircle = {
                    x: playerProps.positioned.x + playerProps.positioned.width / 2,
                    y: playerProps.positioned.y + playerProps.positioned.height / 2,
                    radius: (playerProps.positioned.width / 2)
                };

                const playerTileX = Math.floor(playerCircle.x / gridWidth);
                const playerTileY = Math.floor(playerCircle.y / gridHeight);

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

                                if (tileTexture && tileTexture.data) {
                                    const collisionResult = ExtendedCollisionHelper.isCirclePixelColliding(
                                        playerCircle,
                                        tileBox,

                                        tileTexture.data
                                    );
                                    if (collisionResult) {
                                        collisionResult.targetEntity = tileEntity;
                                        collisionResults.push(collisionResult);
                                        return collisionResults;
                                    }
                                } else {
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
                        const impactVelocity = playerProps.velY;

                        if (isHardImpact(impactVelocity)) {
                            const shakeIntensity = calculateShakeIntensity(impactVelocity);

                            if (shakeIntensity > 0) {
                                const camera = WorldManager.getCamera();
                                if (camera) {
                                    camera.runEffect('shake', shakeIntensity);
                                }
                            }
                        }

                        playerProps.positioned.y = tileY - playerProps.positioned.height;
                        playerEntity.stateHelper.set<boolean>("isGrounded", true);
                        playerProps.velY = 0;


                    } else if (playerProps.velY < 0) {
                        playerProps.positioned.y = tileY + tileHeight;
                        playerEntity.stateHelper.set<boolean>("isGrounded", false);

                        const impactVelocity = playerProps.velY;

                        const impactMagnitude = Math.abs(impactVelocity);

                        if (isHardImpact(impactMagnitude)) {
                            let shakeIntensity = calculateShakeIntensity(impactMagnitude);

                            shakeIntensity *= 0.6;

                            if (shakeIntensity > 0) {
                                WorldManager.getCamera()?.runEffect('shake', shakeIntensity);
                            }
                        }

                    }
                    playerProps.velY = 0;
                }
            }
        },
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
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult, collectibleEntity: CollectibleEntity) => {
                GameState.removeEntityByUUID(collectibleEntity.uuid);
            }
        },
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
                if (playerEntity.props.velY >= 0) {
                    playerEntity.props.positioned.y = platformEntity.props.positioned.y - playerEntity.props.positioned.height;
                    playerEntity.props.velY = 0;
                    playerEntity.props.velY = platformEntity.props.velY;
                    playerEntity.stateHelper.set("isGrounded", true);
                    playerEntity.stateHelper.set("onPlatform", true);
                }
            }
        },
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
        },
        {
            targetName: "rope",
            detectorFn: (playerEntity: PlayerEntity, ropeEntity: RopeEntity) => {
                const playerProps = playerEntity.props;
                const collisionResults = new Array<ICollisionResult>();

                const ropeStart = new Point2D(ropeEntity.props.positioned.x, ropeEntity.props.positioned.y);
                const ropeEnd = new Point2D(ropeEntity.endX - (playerProps.positioned.width / 2),
                    ropeEntity.endY - (playerProps.positioned.height / 2));
                const ropeControl = new Point2D(ropeEntity.controlX, ropeEntity.controlY);

                const collisionResult = ExtendedCollisionHelper.isRectCurveColliding(
                    playerEntity.props.positioned.getBoundingBox!(),
                    ropeStart,
                    ropeControl,
                    ropeEnd
                );

                if (collisionResult) {
                    collisionResults.push(collisionResult);
                }
                return collisionResults;
            },
            onCollision: (playerEntity: PlayerEntity, collisionData: ICollisionResult, ropeEntity: RopeEntity) => {
                playerEntity.stateHelper.set("isSwinging", true);
                playerEntity.stateHelper.set("onLadder", false);
                playerEntity.stateHelper.set("isGrounded", false);
                playerEntity.props.attachedTo = ropeEntity;

                WorldManager.getCamera()?.runEffect("zoom",2.5);

                playerEntity.props.velX = 0;
                playerEntity.props.velY = 0;

            }
        }
    ];
