import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { IBoundingBox } from "../../../interface/IBoundingBox";
import { IGameEntityBehavior } from "../../../interface/IGameEntity";
import { TileDefinitions } from "../../../level-settings/TileDefinitions";
import { gameState } from "../../../state/gameState";
import { getSurroundingTiles, isSolidTile, getTileProperties } from "../../../utils/tileBlockHelpers";
import { LevelEntity } from "../../level/levelEntity";
import { EnemyEntity } from "../enemyEntity";


/**
 * Guarding behavior: patrols back and forth between walls, and pauses for a set duration
 * at each turning point.
 *
 * @param waitTimeInSeconds The duration to wait at each turning point.
 */
export const EnemyGuardingBehavior = (waitTimeInSeconds: number): IGameEntityBehavior => {
    return {
        name: "guarding",
        onInit: (enemy: EnemyEntity) => {
            const stateHelper = enemy.stateHelper;
            stateHelper.set<string>("state", "patrolling");
            stateHelper.set<number>("waitTimer", 0);
            stateHelper.set<number>("direction", 1); // 1 for right, -1 for left
        },
        onUpdate: (enemy: EnemyEntity, timeStamp: number) => {
            const props = enemy.props;
            const stateHelper = enemy.stateHelper;
            const currentState = stateHelper.get<string>("state");

            // Look for a player to see if we should override the behavior.
            const player = gameState.player!;
            const distance = player.props.positioned.toPoint2D().distanceTo(props.positioned.toPoint2D());
            if (distance < 200) {
                // Here, you could transition to a "chasing" or "attacking" behavior
                // For now, we'll just stop the guard behavior.
                props.velX = 0;
                props.currentAnimationKey = "idle";
                return;
            }

            switch (currentState) {
                case "patrolling": {
                    // Get the level entity for tile look-ups
                    const levelEntity = gameState.findEntities("tileBlock")[0] as LevelEntity;
                    if (!levelEntity) {
                        console.error("Level entity not found in game state.");
                        return;
                    }

                    // Create a small "look-ahead" bounding box a few pixels in the direction of movement
                    const enemyBbox = props.positioned.getBoundingBox!();
                    const direction = stateHelper.get<number>("direction")!;
                    const lookAheadX = direction > 0 ? enemyBbox.x + enemyBbox.width + 5 : enemyBbox.x - 5;
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

                    // If an obstacle is found, flip the direction and transition to waiting
                    if (obstacleFound) {
                        stateHelper.set<string>("state", "waiting");
                        stateHelper.set<number>("waitTimer", timeStamp);
                    } else {
                        // Continue patrolling
                        props.velX = direction * 1.5;
                        props.currentAnimationKey = "walk";
                        props.flippedX = direction === -1;
                    }
                    break;
                }

                case "waiting": {
                    // Stop movement and change animation to "idle"
                    props.velX = 0;
                    props.currentAnimationKey = "idle";

                    // Check if the wait time has elapsed
                    const waitTimer = stateHelper.get<number>("waitTimer")!;
                    const timeElapsed = (timeStamp - waitTimer) / 1000;
                    if (timeElapsed >= waitTimeInSeconds) {
                        // Time is up, flip the direction and resume patrolling
                        stateHelper.set<number>("direction", stateHelper.get<number>("direction")! * -1);
                        stateHelper.set<string>("state", "patrolling");
                    }
                    break;
                }
            }
        }
    };
};
