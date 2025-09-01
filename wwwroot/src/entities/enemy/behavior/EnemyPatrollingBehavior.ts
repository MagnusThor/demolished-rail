
/**
 * Patrolling behavior: moves the enemy back and forth.
 * This behavior must now receive a reference to the indexedTiles for accurate collision checks.
 */

import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { IBoundingBox } from "../../../interface/IBoundingBox";
import { IEnemyBehavior, IEnemyProps } from "../../../interface/IEnemyProps";
import { IIndexedTile } from "../../../interface/IIndexedTile";
import { TileDefinitions } from "../../../level/TileDefinitions";
import { isSolidTile, getTileProperties } from "../../../utils/tileBlockHelpers";
import { ENEMY_SPEED } from "../enemyEntity";

export const EnemyPatrollingBehavior = (indexedTiles: IIndexedTile[]): IEnemyBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy) => {
            const props = enemy.props as IEnemyProps;

            // Create a temporary bounding box for the next frame's position
            const nextBbox: IBoundingBox = {
                x: props.positioned.x + (props.direction * ENEMY_SPEED),
                y: props.positioned.y,
                width: props.positioned.width,
                height: props.positioned.height
            };

            // Check for collision with tiles in the simulated next position
            let willCollide = false;
            let willFall = true; // Assume the enemy will fall unless a tile is found below

            for (const tile of indexedTiles) {
                if (isSolidTile(tile.type)) {
                    const tileProperties = getTileProperties(tile.type as keyof typeof TileDefinitions);
                    if (tileProperties) {
                        const tileBbox: IBoundingBox = {
                            x: tile.x,
                            y: tile.y,
                            width: tileProperties.width,
                            height: tileProperties.height
                        };

                        // Check for wall collision
                        if (CollisionHelper.AABBColliding(nextBbox, tileBbox)) {
                            willCollide = true;
                        }

                        // Check for a solid tile beneath the enemy's leading edge
                        // This prevents the enemy from walking off ledges.
                        const futureFootX = props.positioned.x + (props.direction * props.positioned.width / 2) + (props.direction * 10);
                        const footY = props.positioned.y + props.positioned.height + 1; // Check one pixel below the enemy's feet

                        if (CollisionHelper.AABBColliding({ x: futureFootX, y: footY, width: 1, height: 1 }, tileBbox)) {
                            willFall = false;
                        }
                    }
                }
            }

            if (willCollide || willFall) {
                props.direction *= -1;
            }

            props.velX = props.direction * 0.2;
            props.positioned.x += props.velX; // This line applies the movement to the enemy's position
        },
    };
};
