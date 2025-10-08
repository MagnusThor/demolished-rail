import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { IBoundingBox } from "../../../interface/IBoundingBox";
import { IEnemyProps } from "../../../interface/IEnemyProps";
import { IGameEntityBehavior } from "../../../interface/IGameEntity";

import { TileDefinitions } from "../../../factory/TileDefinitions";
import { GameState } from "../../../global/GameState";
import { getSurroundingTiles, isSolidTile, getTileProperties } from "../../../utils/tileEntityHelpers";
import { LevelEntityRenderer } from "../../level/LevelEntityRenderer";
import { PlayerEntity } from "../../player/playerEntity";
import { EnemyEntity } from "../enemyEntity";


/**
 * Patrolling behavior: moves the enemy back and forth.
 * This behavior includes look-ahead logic to turn the enemy around when it is about to hit a wall.
 */
export const EnemyPatrollingBehavior = (): IGameEntityBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy: EnemyEntity) => {
            const props = enemy.props

            // Get the player entity and calculate distance
            const player = GameState.getInstance().player! as PlayerEntity
            const playerPos = player.props.position.toPoint2D()
            const enemyPos = enemy.props.position.toPoint2D();
            const distance = playerPos.distanceTo(enemyPos);

            // Determine if the enemy should face the player
            if (playerPos.x < enemyPos.x) {
                props.flippedX = true; // Player is to the left
            } else {
                props.flippedX = false; // Player is to the right
            }

            // Check if the player is within range
            if (distance < 200) {
                // If the player is within attack range (32 pixels), stop and attack
                if (distance <= 128) {
                    props.velX = 0;
                    enemy.props.currentAnimationKey = "attack";
                } else {
                    // If the player is within a larger range (32-200), advance slowly towards them
                    props.velX = props.flippedX ? -0.5 : 0.5; // Slowly move towards the player
                    enemy.props.currentAnimationKey = "walk";
                }
            } else {
                // Otherwise, continue patrolling
                // Get the level entity to access the spatial grid for look-ahead checks
                const levelEntity = GameState.getInstance().findEntities("tileBlock")[0] as LevelEntityRenderer;
                if (!levelEntity) {
                    console.error("Level entity not found in game state.");
                    return;
                }

                // Create a small "look-ahead" bounding box a few pixels in the direction of movement
                const enemyBbox = props.position.getBoundingBox!();
                const lookAheadX = props.direction > 0 ? enemyBbox.x + enemyBbox.width + 5 : enemyBbox.x - 5;
                const lookAheadBbox: IBoundingBox = {
                    x: lookAheadX,
                    y: enemyBbox.y,
                    width: 10,
                    height: enemyBbox.height
                };

                // Check for solid tiles in the look-ahead area
                const nearbyTiles = getSurroundingTiles(levelEntity.tileSpatialGrid, lookAheadBbox, 32);
                let obstacleFound = false;
                if (nearbyTiles) {
                    for (const tile of nearbyTiles) {
                        if (isSolidTile(tile.type)) {
                            const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions);
                            if (tileProperties) {
                                const tileBbox = {
                                    x: tile.x,
                                    y: tile.y,
                                    width: tileProperties.width,
                                    height: tileProperties.height
                                };
                                if (CollisionHelper.AABBColliding(lookAheadBbox, tileBbox)) {
                                    obstacleFound = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                // If an obstacle is found, flip the direction
                if (obstacleFound) {
                    props.direction *= -1;
                }
                // Set the horizontal velocity based on the current direction.
                props.velX = props.direction * 1.5;

                // Set animation to walk
                enemy.props.currentAnimationKey = "walk";

                // Flip the sprite based on direction
                props.flippedX = props.direction === -1;
            }
        },
    };
};
