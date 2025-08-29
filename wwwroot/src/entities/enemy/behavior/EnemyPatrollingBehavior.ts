import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { IBoundingBox } from "../../../interface/IBoundingBox";
import { IEnemyBehavior, IEnemyProps } from "../../../interface/IEnemyProps";
import { TILE_TYPES } from "../../../LEVEL_SAMPLE";
import { IIndexedTile, isSolidTile, getTileProperties } from "../../../utils/tileBlockHelpers";
import { ENEMY_SPEED } from "../enemyEntity";

/**
 * Patrolling behavior: moves the enemy back and forth.
 * This behavior must now receive a reference to the indexedTiles for accurate collision checks.
 */

export const EnemyPatrollingBehavior = (indexedTiles: IIndexedTile[]): IEnemyBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy) => {
            const props = enemy.props as IEnemyProps;

            // Create a temporary bounding box for the next frame's position
            const nextBbox: IBoundingBox = {
                x: props.position.x + (props.direction * ENEMY_SPEED),
                y: props.position.y,
                width: props.position.width,
                height: props.position.height
            };

            // Check for collision with tiles in the simulated next position
            let willCollide = false;
            for (const tile of indexedTiles) {
                if (isSolidTile(tile.type)) {
                    const tileProperties = getTileProperties(tile.type as keyof typeof TILE_TYPES);
                    if (tileProperties) {
                        const tileBbox: IBoundingBox = {
                            x: tile.x,
                            y: tile.y,
                            width: tileProperties.width,
                            height: tileProperties.height
                        };
                        if (CollisionHelper.AABBColliding(nextBbox, tileBbox)) {
                            willCollide = true;
                            break;
                        }
                    }
                }
            }

            if (willCollide) {
                props.direction *= -1;
            }

            props.velX = props.direction * ENEMY_SPEED;
        },
    };
};
