import { Point2D } from "../../../../../src";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { GameState } from "../../../global/GameState";
import { getTileProperties } from "../../../utils/tileEntityHelpers";
import { CollectibleEntity } from "../../collectible/CollectibleEntity";
import { LadderEntity } from "../../ladderEntity";
import { PlatformEntity } from "../../platform/PlatformEntity";
import { RopeEntity } from "../../platform/RopeEntity";
import { PlayerEntity } from "../playerEntity";
import { WorldManager } from "../../WorldManager";
import { ExtendedCollisionHelper } from "../../../utils/extendedCollitionHelper";
import { LevelEntityRenderer } from "../../level/LevelEntityRenderer";
import { isHardImpact, calculateShakeIntensity } from "../../../utils/impactHelpers";

/** Helper: get player's bounding box from current sprite */
function getPlayerBox(player: PlayerEntity) {
    return player.getBoundingBox(player);
}

export const playerCollisionDetectors = [
    // ---------------- TILE BLOCK ----------------
    {
        targetName: "tileBlock",
        detectorFn: (player: PlayerEntity, tile: LevelEntityRenderer) => {
            const collisionResults: ICollisionResult[] = [];
            const playerBox = getPlayerBox(player);
            const gridW = 32;
            const gridH = 32;
            const map = tile.logicalCollisionMap;

            const tileX = Math.floor(playerBox.x / gridW);
            const tileY = Math.floor(playerBox.y / gridH);
            const radius = Math.ceil(playerBox.width / gridW);

            for (let row = tileY - radius; row <= tileY + radius; row++) {
                for (let col = tileX - radius; col <= tileX + radius; col++) {
                    if (row < 0 || row >= map.length || col < 0 || col >= map[0].length) continue;
                    const logicalTile = map[row][col];
                    if (!logicalTile) continue;

                    const tileProps = getTileProperties(logicalTile.type);
                    if (!tileProps) continue;

                    const tileBox = {
                        x: logicalTile.x,
                        y: logicalTile.y,
                        width: tileProps.width,
                        height: tileProps.height,
                    };

                    const collision = ExtendedCollisionHelper.isRectRectColliding(
                        playerBox.x, playerBox.y, playerBox.width, playerBox.height,
                        tileBox.x, tileBox.y, tileBox.width, tileBox.height
                    );
                    if (collision) collisionResults.push(collision);
                }
            }
            return collisionResults;
        },
        onCollision: (player: PlayerEntity, collisionData: ICollisionResult) => {
            if (!collisionData) return;
            const playerBox = getPlayerBox(player);
            const { x: tileX, y: tileY, width: tileW, height: tileH, axis } = collisionData;
            if (axis === CollisionAxis.X) {
                if (player.props.velX > 0) player.props.position.x = tileX - playerBox.width / 2;
                else if (player.props.velX < 0) player.props.position.x = tileX + tileW + playerBox.width / 2;
                player.props.velX = 0;
            } else if (axis === CollisionAxis.Y) {
                if (player.props.velY > 0) {
                    player.props.position.y = tileY;
                    player.stateHelper.set("isGrounded", true);

                     const impactVelocity = player.props.velY;

                        if (isHardImpact(impactVelocity)) {
                            const shakeIntensity = calculateShakeIntensity(impactVelocity);

                            if (shakeIntensity > 0) {
                                const camera = WorldManager.getCamera();
                                if (camera) {
                                    camera.runEffect('shake', shakeIntensity);
                                }
                            }
                        }


                    player.props.velY = 0;
                    
                } else if (player.props.velY < 0) {
                    player.props.position.y = tileY + tileH + playerBox.height;
                    player.stateHelper.set("isGrounded", false);
                    player.props.velY = 0;
                }
            }
        },
    },

    // ---------------- COLLECTIBLE ----------------
    {
        targetName: "collectibleBlock",
        detectorFn: (player: PlayerEntity, collectible: CollectibleEntity) => {
            const collisionResults: ICollisionResult[] = [];
            const playerBox = getPlayerBox(player);
            const colBox = collectible.props.position;

            const collision = ExtendedCollisionHelper.isRectRectColliding(
                playerBox.x, playerBox.y, playerBox.width, playerBox.height,
                colBox.x, colBox.y, colBox.width, colBox.height
            );
            if (collision) {
                collision.type = "collectible";
                collisionResults.push(collision);
            }
            return collisionResults;
        },
        onCollision: (player: PlayerEntity, collisionData: ICollisionResult, collectible: CollectibleEntity) => {
            GameState.getInstance().removeEntityByUUID(collectible.uuid);
        },
    },

    // ---------------- PLATFORM ----------------
    {
        targetName: "platformBlock",
        detectorFn: (player: PlayerEntity, platform: PlatformEntity) => {
            const collisionResults: ICollisionResult[] = [];
            const playerBox = getPlayerBox(player);
            const platBox = platform.props.position;

            const collision = ExtendedCollisionHelper.isRectRectColliding(
                playerBox.x, playerBox.y, playerBox.width, playerBox.height,
                platBox.x, platBox.y, platBox.width, platBox.height
            );
            if (collision) {
                collision.type = "platform";
                collisionResults.push(collision);
            }
            return collisionResults;
        },
        onCollision: (player: PlayerEntity, collisionData: ICollisionResult, platform: PlatformEntity) => {
            if (player.props.velY >= 0) {
                const playerBox = getPlayerBox(player);
                player.props.position.y = platform.props.position.y;
                player.props.velY = platform.props.velY;
                player.stateHelper.set("isGrounded", true);
                player.stateHelper.set("onPlatform", true);
            }
        },
    },

    // ---------------- LADDER ----------------
    {
        targetName: "ladder",
        detectorFn: (player: PlayerEntity, ladder: LadderEntity) => {
            const collisionResults: ICollisionResult[] = [];
            const playerBox = getPlayerBox(player);
            const ladderBox = ladder.props.position;

            const collision = ExtendedCollisionHelper.isRectRectColliding(
                playerBox.x, playerBox.y, playerBox.width, playerBox.height,
                ladderBox.x, ladderBox.y, ladderBox.width, ladderBox.height
            );
            if (collision) {
                collision.type = "ladder";
                collisionResults.push(collision);
            }
            return collisionResults;
        },
        onCollision: (player: PlayerEntity) => {
            player.stateHelper.set("onLadder", true);
        },
    },

    // ---------------- ROPE ----------------
    {
        targetName: "rope",
        detectorFn: (player: PlayerEntity, rope: RopeEntity) => {
            const collisionResults: ICollisionResult[] = [];
            const playerBox = getPlayerBox(player);

            const ropeStart = new Point2D(rope.props.position.x, rope.props.position.y);
            const ropeEnd = new Point2D(
                rope.endX - playerBox.width / 2,
                rope.endY - playerBox.height / 2
            );
            const ropeControl = new Point2D(rope.controlX, rope.controlY);

            const collision = ExtendedCollisionHelper.isRectCurveColliding(
                playerBox,
                ropeStart,
                ropeControl,
                ropeEnd
            );
            if (collision) collisionResults.push(collision);

            return collisionResults;
        },
        onCollision: (player: PlayerEntity, collisionData: ICollisionResult, rope: RopeEntity) => {
            player.stateHelper.set("isSwinging", true);
            player.stateHelper.set("onLadder", false);
            player.stateHelper.set("isGrounded", false);
            player.props.attachedTo = rope;

            WorldManager.getCamera()?.runEffect("zoom", 2.5);
            player.props.velX = 0;
            player.props.velY = 0;
        },
    },
];
