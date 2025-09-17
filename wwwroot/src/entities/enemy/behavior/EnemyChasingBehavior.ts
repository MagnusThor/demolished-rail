import { gameState } from "../../../state/gameState";
import { IEnemyBehavior } from "../../../interface/IEnemyProps";
import { IGameEntity } from "../../../interface/IGameEntity";
import { IPlayerProps } from "../../../interface/IPlayerProps";


/**
 * Chasing behavior: remains at the initial position until the player gets close,
 * then chases the player. When the player gets out of range, the enemy returns to its
 * original starting point.
 */
export const EnemyChasingBehavior = (startX: number, startY: number): IEnemyBehavior => {
    return {
        name: "chasing",
        onUpdate: (enemy) => {
            const props = enemy.props;

            // Check if the player exists in the game state before attempting to chase
            const playerEntity = gameState.player as IGameEntity<IPlayerProps>;
            if (!playerEntity) {
                // If the player is not found, stop all movement and animations
                props.velX = 0;
                enemy.props.currentAnimationKey = "idle";
                return;
            }

            const playerProps = playerEntity.props;

            // Calculate the distance to the player and the starting position
            const distanceX = playerProps.positioned.x - props.positioned.x;
            const distanceY = playerProps.positioned.y - props.positioned.y;
            const distanceToPlayer = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const distanceToStart = Math.sqrt(
                (props.positioned.x - startX) ** 2 + (props.positioned.y - startY) ** 2
            );

            // Define behavior distances
            const chaseDistance = 200;
            const attackDistance = 32;

            // Determine if the enemy should face the player or the start position
            if (distanceToPlayer < chaseDistance) {
                // Enemy is in range of the player
                if (distanceToPlayer <= attackDistance) {
                    // Player is within attack range, stop and attack
                    props.velX = 0;
                    props.currentAnimationKey = "attack";
                } else {
                    // Player is in slow-advance range, move slowly towards them
                    props.velX = Math.sign(distanceX) * 0.5;
                    props.currentAnimationKey = "walk";
                }
                // Flip the sprite to face the player
                props.flippedX = (playerProps.positioned.x < props.positioned.x);
            } else {
                // Player is out of chase range, return to the start position
                const returnTolerance = 2; // A small tolerance to prevent jittering at the destination
                if (distanceToStart > returnTolerance) {
                    // Move back to the start position
                    props.velX = Math.sign(startX - props.positioned.x) * 1.5;
                    props.currentAnimationKey = "walk";
                    // Flip the sprite to face the start position
                    props.flippedX = (startX < props.positioned.x);
                } else {
                    // Enemy has reached the start position, stop and go idle
                    props.velX = 0;
                    props.currentAnimationKey = "idle";
                    // Snap to the exact start coordinates to avoid slight offsets
                    props.positioned.x = startX;
                    props.positioned.y = startY;
                }
            }
        },
    };
};
