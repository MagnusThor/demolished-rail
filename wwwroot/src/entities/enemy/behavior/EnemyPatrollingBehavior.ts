import { CollisionHelper } from "../../../../../src/Engine/Helpers/CollisionHelper";
import { IBoundingBox } from "../../../interface/IBoundingBox";
import { IEnemyBehavior, IEnemyProps } from "../../../interface/IEnemyProps";
import { IIndexedTile } from "../../../interface/IIndexedTile";
import { TileDefinitions } from "../../../level/TileDefinitions";
import { isSolidTile, getTileProperties } from "../../../utils/tileBlockHelpers";

/**
 * Patrolling behavior: moves the enemy back and forth.
 * This behavior now handles both horizontal movement and vertical gravity/ground checks.
 * @param indexedTiles A reference to the indexed tiles for collision checks.
 */
export const EnemyPatrollingBehavior = (indexedTiles: IIndexedTile[]): IEnemyBehavior => {
    return {
        name: "patrolling",
        onUpdate: (enemy) => {
            const props = enemy.props as IEnemyProps;

            // --- Horizontal Movement and Collision Prediction ---
            // Calculate a future horizontal position to check for walls
            const futureX = props.positioned.x + (props.direction * 0.1);
            const nextBbox: IBoundingBox = {
                x: futureX,
                y: props.positioned.y,
                width: props.positioned.width,
                height: props.positioned.height
            };

            let turnAround = false;

            // --- Vertical Ground Check for Ledges ---
            // Check the tile directly beneath the enemy's leading edge
            const footX = props.positioned.x + (props.direction === 1 ? props.positioned.width : 0) + (props.direction * 1);
            const footY = props.positioned.y + props.positioned.height + 1; // 1 pixel below the feet

            let isGrounded = false;
            let onLedge = true;

            for (const tile of indexedTiles) {
                const tileProps = getTileProperties(tile.type as keyof typeof TileDefinitions);
                if (tileProps && isSolidTile(tile.type)) {
                    const tileBbox: IBoundingBox = {
                        x: tile.x,
                        y: tile.y,
                        width: tileProps.width,
                        height: tileProps.height
                    };

                    // Check for a solid wall collision in the future horizontal position
                    if (CollisionHelper.AABBColliding(nextBbox, tileBbox)) {
                        turnAround = true;
                    }

                    // Check if there is ground beneath the enemy
                    if (CollisionHelper.AABBColliding({ x: props.positioned.x, y: footY, width: props.positioned.width, height: 1 }, tileBbox)) {
                        isGrounded = true;
                    }

                    // Check if there's a tile just below the leading foot.
                    if (CollisionHelper.AABBColliding({ x: footX, y: footY, width: 1, height: 1 }, tileBbox)) {
                        onLedge = false;
                    }
                }
            }

            // If a wall is hit or the enemy is about to walk off a ledge, flip the direction
            if (turnAround || (isGrounded && onLedge)) {
                props.direction *= -1;
            }

            // --- Apply Gravity ---
            if (!isGrounded) {
                props.velY += props.gravity;
            } else {
                props.velY = 0;
            }
 
            // --- Apply Velocities to Position ---
            props.velX = props.direction * 0.1;
            props.positioned.x += props.velX;
            props.positioned.y += props.velY;
        },
    };
};
