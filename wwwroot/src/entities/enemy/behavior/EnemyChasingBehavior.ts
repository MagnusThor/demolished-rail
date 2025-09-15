import { gameState } from "../../../state/gameState";
import { IEnemyBehavior } from "../../../interface/IEnemyProps";
import { IGameEntity } from "../../../interface/IGameEntity";
import { IPlayerProps } from "../../../interface/IPlayerProps";


/**
 * Chasing behavior: remains at the initial position until the player gets close,
 * then chases the player.
 */
export const EnemyChasingBehavior = (): IEnemyBehavior => {
    return {
        name: "chasing",
        onUpdate: (enemy) => {
            const props = enemy.props;

            // Check if the player exists in the game state before attempting to chase
            const playerEntity = gameState.player as IGameEntity<IPlayerProps>;
            if (!playerEntity) {
                // If the player is not found, do nothing.
                props.velX = 0;
                return;
            }

            const playerProps = playerEntity.props;

            // Get the distance to the player to determine if the enemy should chase.
            const distanceX = playerProps.positioned.x - props.positioned.x;
            const distanceY = playerProps.positioned.y - props.positioned.y;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // A threshold for when the enemy should start chasing.
            const chaseDistance = 200;

            if (distance < chaseDistance) {
                // Chase the player by setting the enemy's velocity towards the player.
                props.velX = Math.sign(distanceX) * 3.;
            } else {
                // If the player is too far away, stop moving.
                props.velX = 0;
            }
        },
    };
};
