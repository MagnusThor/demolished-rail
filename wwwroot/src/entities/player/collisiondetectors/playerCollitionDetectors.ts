// player/playerCollisionDetectors.ts

import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { CollisionAxis } from "../../../enums/CollisionAxis";
import { ICollisionResult } from "../../../interface/ICollisionResult";
import { IGameEntity } from "../../../interface/IGameEntity";
import { IPlayerProps } from "../../../interface/IPlayerProps";
import { ILevelProps } from "../../../interface/ILevelProps";
import { isSolidTile, getTileProperties } from "../../../utils/tileBlockHelpers";
import { TileEntity } from "../../tiles/tileEntity";



export const playerCollisionDetectors =
[
    {
        targetName: "tileBlock",
        detectorFn: (playerProps: IPlayerProps, tileEntity: TileEntity) => {
            const tileProps = tileEntity.props;
            const collisionResults = new Array<ICollisionResult>();
            const gridWidth = 32;
            const gridHeight = 32;

            // Get the logical collision map from the tile entity's props
            const logicalCollisionMap = tileEntity.logicalCollisionMap;
            if (!logicalCollisionMap) {
                console.warn("Logical collision map not found.");
                return collisionResults;
            }

            const playerTileX = Math.floor(playerProps.position.x / gridWidth);
            const playerTileY = Math.floor(playerProps.position.y / gridHeight);
            
            const checkRadius = 2;
            for (let row = playerTileY - checkRadius; row <= playerTileY + checkRadius; row++) {
                for (let col = playerTileX - checkRadius; col <= playerTileX + checkRadius; col++) {
                    // Step 1: Check bounds and logical map first for performance
                    if (row >= 0 && row < logicalCollisionMap.length && col >= 0 && col < logicalCollisionMap[0].length) {
                        if (logicalCollisionMap[row][col]) {
                            // Step 2: If logical map indicates solid, perform AABB collision
                            const tileType = tileProps.tileMap[row][col];
                            const tileDimensions = getTileProperties(tileType);
                            if (!tileDimensions) continue;
                            
                            const tileX = col * gridWidth;
                            const tileY = row * gridHeight;

                            const collisionResult = CollisionHelper.isRectRectColliding(
                                playerProps.position.x, playerProps.position.y, playerProps.position.width,
                                playerProps.position.height,
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
                    playerProps.position.x = tileX - playerProps.position.width;
                } else if (playerProps.velX < 0) {
                    playerProps.position.x = tileX + tileWidth;
                }
                playerProps.velX = 0;
            } else if (axis === CollisionAxis.Y) {
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