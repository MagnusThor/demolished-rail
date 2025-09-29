import { GameState } from "../../../global/GameState";

import { IGameEntity, IGameEntityBehavior } from "../../../interface/IGameEntity";
import { IPlayerProps } from "../../../interface/IPlayerProps";
import { IEnemyProps } from "../../../interface/IEnemyProps";


/**
 * Chasing behavior: remains at the initial position until the player gets close,
 * then chases the player.
 */
export const EnemyChasingBehavior = (startX:number,startY:number):IGameEntityBehavior => {
    return {
        name: "chasing",
        onUpdate: (enemy) => {
            const props = enemy.props;

            // Check if the player exists in the game state before attempting to chase
            const playerEntity = GameState.player as IGameEntity<IPlayerProps>;
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
                enemy.props.currentAnimationKey = "walk";
            } else {
                // If the player is too far away, stop moving.
                enemy.props.currentAnimationKey = "idle";
                props.velX = 0;
            }
        },
    };
};
